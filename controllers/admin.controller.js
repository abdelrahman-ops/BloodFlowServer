import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import Admin from '../models/Admin.js';
import Request from '../models/Request.js';
import EmergencyRequest from '../models/EmergencyRequest.js';
import Event from '../models/Event.js';
import Hospital from '../models/Hospital.js';
import mongoose from "mongoose";

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


export const registerHospitalAdmin = async (req, res) => {
  try {
    const {
      name, email, password, phone,
      hospitalName, hospitalPhone,
      street, city, state, postalCode,
      lat, lng , fcmToken , gender
    } = req.body;

    // 1. Create the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      bloodType: "O+", // placeholder
      city,
      district: state, // mapping state → district for now
      gender,
      role: "admin",
      fcmToken
    });

    // 2. Create the hospital FIRST (no admin yet)
    const hospital = await Hospital.create({
      name: hospitalName,
      phone: hospitalPhone,
      address: { street, city, state, postalCode },
      location: { type: "Point", coordinates: [lng, lat] },
    });

    // 3. Create the admin referencing hospital
    const admin = await Admin.create({
      userId: user._id,
      hospital: hospital._id,
      email: user.email
    });

    // 4. Update hospital to reference admin
    hospital.admin = admin._id;
    await hospital.save();

     const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            hospital: {
                id: hospital._id,
                name: hospital.name,
                address: hospital.address,
                phone: hospital.phone
            }
        },
        message: "Hospital admin and hospital created successfully",
        userId: user._id,
        adminId: admin._id,
        hospitalId: hospital._id
    });

  } catch (err) {
    console.error("Error in registerHospitalAdmin:", err);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};