import User from '../models/User.js';
import Donor from '../models/Donor.js';
import Admin from '../models/Admin.js';
import Request from '../models/Request.js';
import EmergencyRequest from '../models/EmergencyRequest.js';
import Event from '../models/Event.js';

// Get system overview stats
export const getSystemOverview = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalDonors = await Donor.countDocuments();
        const activeDonors = await Donor.countDocuments({ availability: true });
        const pendingRequests = await Request.countDocuments({ status: 'pending' });
        const emergencyRequests = await EmergencyRequest.countDocuments({ status: 'pending' });

        res.json({
            totalUsers,
            totalDonors,
            activeDonors,
            pendingRequests,
            emergencyRequests
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const { role, status } = req.query;
        
        let query = {};
        if (role) query.role = role;
        if (status) query.status = status;

        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update user role or status
export const updateUser = async (req, res) => {
    try {
        const { role, status } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role, status },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If changing to donor role, ensure donor profile exists
        if (role === 'donor') {
            const donorExists = await Donor.findOne({ userId: user._id });
            if (!donorExists) {
                const newDonor = new Donor({
                    userId: user._id
                });
                await newDonor.save();
            }
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Also delete associated donor profile if exists
        await Donor.findOneAndDelete({ userId: user._id });

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Create event
export const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, image } = req.body;

        const event = new Event({
            title,
            description,
            date,
            location,
            image,
            createdBy: req.user.id
        });

        await event.save();
        res.status(201).json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get all events
export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: -1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update event
export const updateEvent = async (req, res) => {
    try {
        const { title, description, date, location, image } = req.body;

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { title, description, date, location, image },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Delete event
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get all admins
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().populate('userId hospital');
        res.json(admins);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Create admin
export const createAdmin = async (req, res) => {
    try {
        const { userId, hospital } = req.body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user role to admin
        user.role = 'admin';
        await user.save();

        // Create admin profile
        const admin = new Admin({
            userId,
            hospital
        });

        await admin.save();
        res.status(201).json(admin);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};