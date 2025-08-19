import Donor from "../models/Donor.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

import admin from "./config.js";


// Send notification to hospitals for verification
export const sendVerificationRequestToHospitals = async (hospitals, emergencyRequest) => {
  try {
    // Get hospital admin users with FCM tokens
    const hospitalUsers = await User.find({
      _id: { $in: hospitals.map(h => h.admin) },
      fcmToken: { $exists: true }
    }).exec();

    console.log('hospitalUsers: ', hospitalUsers);

    const tokens = hospitalUsers.map(user => user.fcmToken).filter(Boolean);
    
    if (tokens.length === 0) {
      console.log('No hospital admin FCM tokens available');
      return { success: false, message: 'No hospital admins with FCM tokens' };
    }

    const payload = {
      notification: {
        title: 'New Emergency Verification Needed',
        body: `Unverified emergency: ${emergencyRequest.bloodType} at ${emergencyRequest.location}. Verify to alert donors.`
      },
      data: {
        emergencyId: emergencyRequest._id.toString(),
        type: 'verification_request'
      }
    };
    const response = await sendPush(tokens, payload);
    
    // Log notification results
    console.log(`Sent ${response.successCount} verification requests to hospitals`);

    for (const user of hospitalUsers) {
      console.log('user to be notified: ', user._id)
      await sendAndSaveNotification(user._id, {
      title: payload.notification.title,
      message: payload.notification.body,
      emergencyRequestId: emergencyRequest._id,
      type: "emergency"
    });
  }

    return {
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (err) {
    console.error('Error in sendVerificationRequestToHospitals:', err);
    throw err;
  }
};


async function sendAndSaveNotification(userId, data) {
  // Step 1: Create notification document
  const notif = await Notification.create({
    recipient: userId,
    title: data.title,
    message: data.message,
    emergencyRequest: data.emergencyRequestId,
    type: data.type || 'emergency',
    urgency: data.urgency || 'high',
    read: false
  });

  // Step 2: Add to user's notifications array
  await User.findByIdAndUpdate(userId, {
    $push: { notifications: notif._id }
  });

  return notif;
}



// Send verified emergency to donors
export const sendVerifiedEmergencyToDonors = async (donors, emergencyRequest) => {
  try {
    // Create token to donor map and collect valid tokens
    const tokenToDonor = new Map();
    const tokens = donors
      .map(donor => {
        const token = donor.userId?.fcmToken;
        if (token && typeof token === 'string') {
          tokenToDonor.set(token, donor);
          return token;
        }
        return null;
      })
      .filter(token => token !== null);

    if (tokens.length === 0) {
      console.log('No valid FCM tokens available');
      return { success: false, message: 'No valid FCM tokens found' };
    }

    const message = {
      notification: {
        title: `URGENT: ${emergencyRequest.bloodType} needed`,
        body: `${emergencyRequest.name} — ${emergencyRequest.location} (${emergencyRequest.unitsNeeded || 1} unit(s))`
      },
      data: {
        emergencyId: emergencyRequest._id.toString(),
        type: 'verified_emergency',
        bloodType: emergencyRequest.bloodType,
        location: emergencyRequest.location,
        hospital: emergencyRequest.hospital?.toString() || '',
        unitsNeeded: emergencyRequest.unitsNeeded?.toString() || '1'
      },
      tokens
    };

    const messaging = admin.messaging();
    const response = await messaging.sendEachForMulticast(message);

    // Create notification records and handle failures
    const notificationPromises = response.responses.map((resp, idx) => {
      const token = tokens[idx];
      const donor = tokenToDonor.get(token);
      
      if (!resp.success) {
        // Handle invalid tokens
        if (resp.error?.code === 'messaging/invalid-registration-token' || 
            resp.error?.code === 'messaging/registration-token-not-registered') {
          return User.findByIdAndUpdate(donor.userId._id, { $unset: { fcmToken: 1 } });
        }
      }
      
      return Notification.create({
        recipient: donor.userId._id,
        title: message.notification.title,
        message: message.notification.body,
        emergencyRequest: emergencyRequest._id,
        type: 'emergency',
        status: resp.success ? 'sent' : 'failed',
        sentAt: new Date()
      });
    });

    await Promise.all(notificationPromises);

    return {
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (err) {
    console.error('Error in sendVerifiedEmergencyToDonors:', err);
    throw err;
  }
};

// Send emergency notifications to multiple donors
export const sendNotificationToDonors = async (donors, notification) => {
  try {
    // Get valid FCM tokens
    const tokens = donors
      .map(donor => donor.userId?.fcmToken)
      .filter(token => token && typeof token === 'string');
    
    if (tokens.length === 0) {
      console.log('No valid FCM tokens available');
      return { success: false, message: 'No valid FCM tokens found' };
    }

    // Debug: Log tokens being sent
    console.log('Sending to tokens:', tokens);

    // Create multicast message
    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      tokens: tokens
    };

    // Debug: Verify messaging object exists
    if (!admin.messaging) {
      throw new Error('Firebase messaging is not available');
    }

    // Send multicast message
    const messaging = admin.messaging();
    const response = await messaging.sendEachForMulticast(message);
    
    // Handle results
    console.log(`Successfully sent ${response.successCount} messages`);
    
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
        }
      });
    }

    return {
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };

  } catch (err) {
    console.error('Error in sendNotificationToDonors:', err);
    
    // More detailed error logging
    if (err.code) {
      console.error('Firebase error code:', err.code);
      console.error('Firebase error message:', err.message);
    }
    
    throw err;
  }
};

// Handle donor response to emergency
export const handleDonorResponse = async (donorId, emergencyId, canHelp) => {
  try {
    const emergencyRequest = await EmergencyRequest.findById(emergencyId);
    const donor = await Donor.findOne({ userId: donorId }).populate('userId');

    if (!emergencyRequest || !donor) {
      throw new Error('Emergency request or donor not found');
    }

    // Add response to emergency request
    emergencyRequest.responses.push({
      donorId: donor._id,
      canHelp,
      respondedAt: new Date()
    });

    await emergencyRequest.save();

    return {
      success: true,
      emergencyRequest,
      donorName: donor.userId.name,
      donorPhone: donor.userId.phone
    };

  } catch (err) {
    console.error('Error handling donor response:', err);
    throw err;
  }
};

// Send notification to specific user
export const sendNotificationToUser = async (userId, notification) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) return;

    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      token: user.fcmToken
    };

    await admin.messaging().send(message);
  } catch (err) {
    console.error('Error sending notification:', err);
  }
};

// Generic helper to send push
export async function sendPush(tokens, payload) {
  if (!tokens || tokens.length === 0) return { success: false, message: "No tokens" };

  const response = await admin.messaging().sendEachForMulticast({
    notification: payload.notification,
    data: payload.data || {},
    tokens,
  });

  return response;
}