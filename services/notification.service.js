import admin from 'firebase-admin';
import { createRequire } from 'module';
import Donor from '../models/Donor.js';
import EmergencyRequest from '../models/EmergencyRequest.js';

const require = createRequire(import.meta.url);
const serviceAccount = require('../config/bloodflow-4d8a2-firebase-adminsdk-fbsvc-190b0796aa.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

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