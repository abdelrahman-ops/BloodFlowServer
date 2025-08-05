import EmergencyRequest from '../models/EmergencyRequest.js';
import Donor from '../models/Donor.js';
import Notification from '../models/Notification.js';
import { sendNotificationToDonors } from '../services/notification.service.js';


// Create emergency request
export const createEmergencyRequest = async (req, res) => {
    try {
        const { name, phone, location, hospital, bloodType, unitsNeeded, notes, coordinates } = req.body;

    // Validate required fields
    if (!name || !phone || !bloodType || !location) {
        return res.status(400).json({ 
            success: false,
            message: 'Name, phone, blood type and location are required' 
        });
    }

    // Create emergency request
    const emergencyRequest = new EmergencyRequest({
        name,
        phone,
        location,
        hospital,
        bloodType,
        unitsNeeded,
        notes,
        coordinates,
        status: 'pending'
    });

        await emergencyRequest.save();

    // Find matching donors (within same region and available)
    const donors = await Donor.find({
        availability: true
        }).populate({
        path: 'userId',
        match: { bloodType }
    });


    const matchingDonors = donors.filter(donor => donor.userId);

    const notificationPromises = matchingDonors.map(donor => {
            return Notification.create({
                recipient: donor.userId._id,
                title: 'URGENT: Blood Needed',
                message: `Emergency need for ${bloodType} blood in ${location}`,
                emergencyRequest: emergencyRequest._id,
                type: 'emergency'
            });
        });

    await sendNotificationToDonors(matchingDonors, {
        title: 'URGENT: Blood Needed',
        body: `Emergency need for ${bloodType} blood in ${location}`,
        data: {
            emergencyId: emergencyRequest._id.toString(),
            type: 'emergency',
            bloodType,
            location,
            hospital,
            unitsNeeded
        }
    });

    res.status(201).json({
        success: true,
        emergencyRequest,
        notifiedDonors: matchingDonors.length
    });
    } catch (err) {
        console.error('Emergency request error:', err);
        res.status(500).json({ 
        success: false,
        message: 'Failed to process emergency request'
        });
    }
};

// Track emergency request updates (SSE)
export const trackEmergencyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send initial connection message
    res.write('event: connected\n');
    res.write('data: ' + JSON.stringify({ type: 'connected' }) + '\n\n');
    
    // Check for new responses every 5 seconds
    const interval = setInterval(async () => {
      try {
        const request = await EmergencyRequest.findById(id)
          .populate('responses.donorId', 'name phone');
        
        if (request.status === 'fulfilled') {
          res.write('event: fulfilled\n');
          res.write('data: ' + JSON.stringify({ 
            type: 'request_fulfilled',
            message: 'Request has been fulfilled'
          }) + '\n\n');
          clearInterval(interval);
          res.end();
        }
        
        // Send new responses
        if (request.responses && request.responses.length > 0) {
          for (const response of request.responses) {
            if (!response.sentToRequester) {
              res.write('event: response\n');
              res.write('data: ' + JSON.stringify({
                type: 'donor_response',
                donorName: response.donorId.name,
                phone: response.donorId.phone,
                responseId: response._id
              }) + '\n\n');
              
              // Mark as sent
              response.sentToRequester = true;
              await request.save();
            }
          }
        }
      } catch (err) {
        console.error('SSE error:', err);
      }
    }, 5000);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });

  } catch (err) {
    console.error('Track emergency error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to track emergency request'
    });
  }
};

// Get all emergency requests
export const getEmergencyRequests = async (req, res) => {
    try {
        const requests = await EmergencyRequest.find()
        .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update emergency request status
export const updateEmergencyRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const request = await EmergencyRequest.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
        );

        if (!request) {
        return res.status(404).json({ message: 'Request not found' });
        }

        res.json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};