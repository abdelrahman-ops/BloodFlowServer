import EmergencyRequest from '../models/EmergencyRequest.js';
import Hospital from '../models/Hospital.js';
import Donor from '../models/Donor.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

import { 
  sendVerificationRequestToHospitals, 
  sendVerifiedEmergencyToDonors 
} from '../services/notification.service.js';
import { findDonorsByBloodAndLocation } from '../services/matching.service.js';

/**
 * UTILITY: Notify hospitals about a pending emergency
 */
async function notifyHospitals(hospitals, emergency) {
  const notificationPromises = hospitals.map(hospital => {
    return Notification.create({
      recipient: hospital.admin,
      title: 'New Emergency Verification Needed',
      message: `New unverified emergency: ${emergency.bloodType} needed at ${emergency.location}. Verify to alert donors.`,
      emergencyRequest: emergency._id,
      type: 'emergency',
      urgency: 'high'
    });
  });
  await Promise.all(notificationPromises);
  if (hospitals.length > 0) {
    await sendVerificationRequestToHospitals(hospitals, emergency);
  }
}

/**
 * UTILITY: Notify donors about a verified emergency
 */
async function notifyDonors(donors, emergency) {
  const notificationPromises = donors.map(donor => {
    return Notification.create({
      recipient: donor.userId._id,
      title: 'URGENT: Blood Needed',
      message: `Emergency need for ${emergency.bloodType} blood in ${emergency.location}`,
      emergencyRequest: emergency._id,
      type: 'emergency',
      urgency: 'high'
    });
  });
  await Promise.all(notificationPromises);
  await sendVerifiedEmergencyToDonors(donors, emergency);
}

/**
 * Create guest emergency request (unverified, hospital approval required)
 */


export const createGuestEmergency = async (req, res) => {
  try {
    const { name, phone, location, hospital, bloodType, unitsNeeded = 1, notes, coordinates, city } = req.body;

    if (!name || !phone || !bloodType || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const geoCoords = (coordinates?.lat && coordinates?.lng)
      ? { lat: parseFloat(coordinates.lat), lng: parseFloat(coordinates.lng) }
      : null;

    // Validate hospital if provided
    let hospitalDoc = null;
    if (hospital) {
      hospitalDoc = await Hospital.findById(hospital);
      if (!hospitalDoc) return res.status(404).json({ message: 'Hospital not found' });
    }

    const emergency = await EmergencyRequest.create({
      name, phone, location, bloodType, unitsNeeded, notes,
      isGuest: true, createdBy: null,
      hospital: hospitalDoc?._id || null,
      coordinates: geoCoords,
      status: 'hospital_pending',
      verificationRequestedAt: new Date(),
      verificationTimeout: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2h
    });

    // Select hospitals to notify
    let hospitalsToNotify = hospitalDoc ? [hospitalDoc] : [];
    if (!hospitalDoc) {
      try {
        if (geoCoords) {
          hospitalsToNotify = await Hospital.find({
            location: {
              $nearSphere: {
                $geometry: {
                  type: "Point",
                  coordinates: [geoCoords.lng, geoCoords.lat]
                },
                $maxDistance: 50000 // 50km
              }
            }
          }).limit(10);
        }
        if (hospitalsToNotify.length === 0 && city) {
          hospitalsToNotify = await Hospital.find({ 'address.city': city }).limit(10);
        }
      } catch (geoErr) {
        console.error('Geo query failed:', geoErr);
        if (city) hospitalsToNotify = await Hospital.find({ 'address.city': city }).limit(10);
      }
    }

    // Send notifications (helper handles DB + FCM)
    await sendVerificationRequestToHospitals(hospitalsToNotify, emergency);

    console.log('hospitalsToNotify', hospitalsToNotify);

    return res.status(201).json({
      message: 'Emergency submitted. Awaiting hospital verification.',
      emergency,
      hospitalsNotified: hospitalsToNotify.length
    });
  } catch (err) {
    console.error('Error in createGuestEmergency:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


/**
 * Create emergency request (verified immediately — logged-in user or hospital admin)
 */
export const createEmergencyRequest = async (req, res) => {
  try {
    const { name, phone, location, hospital, bloodType, unitsNeeded, notes, coordinates } = req.body;

    if (!name || !phone || !bloodType || !location) {
      return res.status(400).json({ success: false, message: 'Name, phone, blood type and location are required' });
    }

    const emergency = await EmergencyRequest.create({
      name,
      phone,
      location,
      hospital,
      bloodType,
      unitsNeeded,
      notes,
      coordinates,
      status: 'verified',
      verifiedAt: new Date(),
      verifiedBy: req.user._id,
      verifiedByModel: 'User'
    });

    const donors = await findDonorsByBloodAndLocation(bloodType, coordinates || location);
    await notifyDonors(donors, emergency);

    res.status(201).json({
      success: true,
      emergency,
      notifiedDonors: donors.length
    });
  } catch (err) {
    console.error('Emergency request error:', err);
    res.status(500).json({ success: false, message: 'Failed to process emergency request' });
  }
};

/**
 * Hospital verifies guest emergency request
 */
export const verifyEmergencyRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const emergency = await EmergencyRequest.findById(id);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }
    if (emergency.status !== 'hospital_pending') {
      return res.status(400).json({ success: false, message: 'Emergency is not awaiting verification' });
    }

    emergency.status = 'verified';
    emergency.verifiedAt = new Date();
    emergency.verifiedBy = req.user._id;
    emergency.verifiedByModel = 'User';
    await emergency.save();

    const donors = await findDonorsByBloodAndLocation(
      emergency.bloodType,
      emergency.coordinates || emergency.location
    );
    await notifyDonors(donors, emergency);

    res.json({
      success: true,
      message: 'Emergency verified and donors notified',
      emergency,
      notifiedDonors: donors.length
    });
  } catch (err) {
    console.error('Error verifying emergency:', err);
    res.status(500).json({ success: false, message: 'Failed to verify emergency request' });
  }
};

/**
 * Get pending emergencies for hospital admins
 */
export const getPendingVerificationEmergencies = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ admin: req.user._id });
    let query = { status: 'hospital_pending' };

    if (hospital) {
      query.$or = [
        { hospital: hospital._id },
        {
          coordinates: {
            $near: {
              $geometry: { type: "Point", coordinates: hospital.location.coordinates },
              $maxDistance: 50000
            }
          }
        }
      ];
    }

    const emergencies = await EmergencyRequest.find(query).sort({ createdAt: -1 });
    res.json({ success: true, emergencies });
  } catch (err) {
    console.error('Error getting pending verification emergencies:', err);
    res.status(500).json({ success: false, message: 'Failed to get pending emergencies' });
  }
};

/**
 * Track emergency request responses (SSE)
 */
export const trackEmergencyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(`event: connected\ndata: ${JSON.stringify({ type: 'connected' })}\n\n`);

    const interval = setInterval(async () => {
      try {
        const request = await EmergencyRequest.findById(id).populate('responses.donorId', 'name phone');

        if (request.status === 'fulfilled') {
          res.write(`event: fulfilled\ndata: ${JSON.stringify({ type: 'request_fulfilled', message: 'Request fulfilled' })}\n\n`);
          clearInterval(interval);
          res.end();
        }

        if (request.responses && request.responses.length > 0) {
          for (const response of request.responses) {
            if (!response.sentToRequester) {
              res.write(`event: response\ndata: ${JSON.stringify({
                type: 'donor_response',
                donorName: response.donorId.name,
                phone: response.donorId.phone,
                responseId: response._id
              })}\n\n`);
              response.sentToRequester = true;
              await request.save();
            }
          }
        }
      } catch (err) {
        console.error('SSE error:', err);
      }
    }, 5000);

    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  } catch (err) {
    console.error('Track emergency error:', err);
    res.status(500).json({ success: false, message: 'Failed to track emergency request' });
  }
};

/**
 * Get all emergency requests
 */
export const getEmergencyRequests = async (req, res) => {
  try {
    const requests = await EmergencyRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

/**
 * Update emergency request status
 */
export const updateEmergencyRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await EmergencyRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
