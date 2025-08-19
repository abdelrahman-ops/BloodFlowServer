import Donor from "../models/Donor.js";
import User from "../models/User.js";

import Admin from "../models/Admin.js";
import Hospital from "../models/Hospital.js";

export const getDonorProfileData = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) return null;

    const response = {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            bloodType: user.bloodType,
            city: user.city,
            district: user.district,
            gender: user.gender,
            role: user.role,
            createdAt: user.createdAt
        }
    };

    if (user.role === 'donor') {
        const donor = await Donor.findOne({ userId: user._id })
            .populate({
                path: 'donationHistory.hospital',
                select: 'name address'
            })
            .select('-healthInfo');

        if (donor) {
            response.donor = {
                lastDonationDate: donor.lastDonationDate,
                donationHistory: donor.donationHistory,
                donorLevel: donor.donorLevel,
                points: donor.points,
                availability: donor.availability,
                donationCount: donor.donationCount
            };
        }
    }

    return response;
};

export const getUserProfileData = async (userId) => {
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) return null;

        const response = {
            user: {
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
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        };

        // Handle donor-specific data
        if (user.role === 'donor') {
            const donor = await Donor.findOne({ userId: user._id })
                .populate({
                    path: 'donationHistory.hospital',
                    select: 'name address phone location'
                })
                .select('-healthInfo');

            if (donor) {
                response.donor = {
                    lastDonationDate: donor.lastDonationDate,
                    donationHistory: donor.donationHistory,
                    donorLevel: donor.donorLevel,
                    points: donor.points,
                    availability: donor.availability,
                    donationCount: donor.donationCount
                };
            }
        }

        // Handle admin-specific data
        if (user.role === 'admin') {
            const admin = await Admin.findOne({ userId: user._id })
                .populate({
                    path: 'hospital',
                    select: 'name phone address location admin'
                });

            if (admin && admin.hospital) {
                response.hospital = {
                    id: admin.hospital._id,
                    name: admin.hospital.name,
                    phone: admin.hospital.phone,
                    address: admin.hospital.address,
                    location: admin.hospital.location
                };
            }
        }

        return response;

    } catch (error) {
        console.error('Error in getUserProfileData:', error);
        throw error;
    }
};