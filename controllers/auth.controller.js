import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import { sendEmail } from '../services/email.service.js';
import Admin from '../models/Admin.js';
import Hospital from '../models/Hospital.js';
import { getDonorProfileData , getUserProfileData } from '../utils/donorHelpers.js';
import mongoose from "mongoose";

// Register a new user
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, bloodType, city, district, gender, role, healthInfo, fcmToken, hospitalId } = req.body;

        // Validate required fields
        const requiredFields = ['name', 'email', 'password', 'phone', 'bloodType', 'city', 'district', 'role'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Additional validation for admins
        if (role === 'admin' && !hospitalId) {
            return res.status(400).json({ 
                message: 'Hospital ID is required for admin registration' 
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate hospital exists if admin
        if (role === 'admin') {
            const hospitalExists = await Hospital.exists({ _id: hospitalId });
            if (!hospitalExists) {
                return res.status(404).json({ message: 'Hospital not found' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            bloodType,
            city,
            district,
            gender,
            role,
            fcmToken
        });

        await user.save();

        // Create role-specific profiles
        if (role === 'donor') {
            const donor = new Donor({
                userId: user._id,
                healthInfo: healthInfo || ''
            });
            await donor.save();
        }

        if (role === 'admin') {
            const admin = new Admin({
                userId: user._id,
                hospital: hospitalId  // Use the provided hospitalId
            });
            await admin.save();
        }

        // Create JWT token
        const payload = { 
            user: { 
                id: user.id, 
                role: user.role,
                // Include hospital ID for admins in the token
                ...(role === 'admin' && { hospitalId })
            } 
        };

        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }, 
            (err, token) => {
                if (err) throw err;

                // Set secure cookie
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000
                });

                // Return response without password
                const userResponse = user.toObject();
                delete userResponse.password;
                
                // Include hospital ID in response for admins
                if (role === 'admin') {
                    userResponse.hospitalId = hospitalId;
                }

                res.status(201).json({ 
                    token, 
                    user: userResponse 
                });
            }
        );

    } catch (err) {
        console.error('Registration error:', err.message);
        
        // Handle specific errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ 
                message: 'Validation error', 
                errors 
            });
        }
        
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ 
                message: 'Invalid ID format' 
            });
        }

        res.status(500).json({ 
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};


// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;

            res.cookie('token', token, {
                httpOnly: true, // prevents JS access
                secure: process.env.NODE_ENV === 'production', // https only in prod
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            const userResponse = user.toObject();
            userResponse.id = userResponse._id;
            delete userResponse._id;
            delete userResponse.password;
            res.json({ token, user: userResponse });
            // console.log(user);
            
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


// Get current user
// controllers/authController.js
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Base response for all users
        const response = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            bloodType: user.bloodType,
            city: user.city,
            district: user.district,
            gender: user.gender,
            role: user.role,
            fcmToken: user.fcmToken,
            createdAt: user.createdAt
        };

        // Add role-specific data
        if (user.role === 'donor') {
            const donor = await Donor.findOne({ userId: user._id })
                .populate('donationHistory.hospital', 'name address phone location')
                .select('-healthInfo');

            if (donor) {
                response.donorProfile = {
                    lastDonationDate: donor.lastDonationDate,
                    donationHistory: donor.donationHistory,
                    donorLevel: donor.donorLevel,
                    points: donor.points,
                    availability: donor.availability,
                    donationCount: donor.donationCount
                };
            }
        } else if (user.role === 'admin') {
            const admin = await Admin.findOne({ userId: user._id })
                .populate('hospital', 'name phone address location');

            if (admin?.hospital) {
                response.hospital = admin.hospital;
            }
        }

        res.json(response);
    } catch (error) {
        console.error('Error in getMe:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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

// Add this to your existing auth controller
export const logout = async (req, res) => {
    try {
        // Clear the HTTP-only cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        // Optionally: Invalidate the token on server-side if you're using token blacklisting
        // This would require additional setup with Redis or database
        // await TokenBlacklist.create({ token: req.cookies.token });

        // Send success response
        res.status(200).json({ 
            success: true,
            message: 'Logged out successfully'
        });

    } catch (err) {
        console.error('Logout error:', err.message);
        res.status(500).json({ 
            success: false,
            message: 'Server error during logout'
        });
    }
};




