import Request from '../models/Request.js';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import { sendNotificationToDonors } from '../services/notification.service.js';

// Create a blood request
export const createRequest = async (req, res) => {
    try {
        const { bloodType, unitsNeeded, location, hospital, notes } = req.body;

        const request = new Request({
        requesterId: req.user.id,
        bloodType,
        unitsNeeded,
        location,
        hospital,
        notes
        });

        await request.save();

        // Find matching donors and notify them
        const donors = await Donor.find({
        availability: true
        }).populate('userId');

        const matchingDonors = donors.filter(donor => 
        donor.userId.bloodType === bloodType && 
        donor.userId.city === req.user.city
        );

        await sendNotificationToDonors(matchingDonors, {
        title: 'New Blood Request',
        body: `A patient needs ${bloodType} blood in ${location}`,
        data: { requestId: request._id.toString() }
        });

        res.status(201).json(request);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get user's requests
export const getUserRequests = async (req, res) => {
    try {
        const requests = await Request.find({ requesterId: req.user.id })
        .sort({ createdAt: -1 })
        .populate('fulfilledBy', 'userId');

        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get all requests (for admin)
export const getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find()
        .sort({ createdAt: -1 })
        .populate('requesterId', 'name email phone')
        .populate('fulfilledBy', 'userId');

        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update request status
export const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const request = await Request.findByIdAndUpdate(
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