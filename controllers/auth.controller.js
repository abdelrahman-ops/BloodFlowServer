import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import { sendEmail } from '../services/email.service.js';

// Register a new user
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, bloodType, city, district, gender, role, healthInfo, fcmToken } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
        return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        user = new User({
            name,
            email,
            password,
            phone,
            bloodType,
            city,
            district,
            gender,
            role,
            fcmToken
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // If donor, create donor profile
        if (role === 'donor') {
        const donor = new Donor({
            userId: user._id,
            healthInfo: healthInfo || ''
        });
        await donor.save();
        }

        // Create JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
            }
        );
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const payload = {
        user: {
            id: user.id,
            role: user.role
        }
        };

        jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        }
        );

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        // res.json(userResponse);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get current user
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
        return res.status(404).json({ message: 'User not found' });
        }

        // If donor, include donor info
        if (user.role === 'donor') {
            const donor = await Donor.findOne({ userId: user._id })
            .populate({
                path: 'donationHistory.location',
                model: 'Hospital',
                select: 'name address'
            });
            return res.json({ ...user._doc, donorInfo: donor });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, city, district, gender } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone, city, district, gender },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update FCM token
export const updateFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        const user = await User.findByIdAndUpdate(
        req.user.id,
        { fcmToken },
        { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};