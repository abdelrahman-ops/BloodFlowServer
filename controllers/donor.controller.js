import Donor from "../models/Donor.js";
import User from "../models/User.js";
import Request from "../models/Request.js";
import { getDonorProfileData } from "../utils/donorHelpers.js";
// Get all donors (updated with better filtering)
export const getDonors = async (req, res) => {
    try {
        const { bloodType, city, district, availability } = req.query;
        
        let query = {};
        let userQuery = {};
        
        if (bloodType) userQuery.bloodType = bloodType;
        if (city) userQuery.city = city;
        if (district) userQuery.district = district;
        if (availability) query.availability = availability === 'true';

        // Find users first that match the criteria
        const matchingUsers = await User.find(userQuery).select('_id');
        const userIds = matchingUsers.map(user => user._id);
        
        // Now find donors with those user IDs
        query.userId = { $in: userIds };
        
        const donors = await Donor.find(query)
            .populate({
                path: 'userId',
                select: 'name email phone bloodType city district gender',
                match: userQuery
            })
            .select('-healthInfo');

        // Filter out any null users (in case population failed)
        const filteredDonors = donors.filter(donor => donor.userId !== null);

        res.json(filteredDonors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get donor profile
export const getDonorProfile = async (req, res) => {
    try {
        const profileData = await getDonorProfileData(req.user.id);
        if (!profileData) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (profileData.user.role !== 'donor') {
            return res.status(400).json({ message: 'User is not a donor' });
        }

        res.json(profileData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update donor availability
export const updateAvailability = async (req, res) => {
    try {
        const { availability } = req.body;

        const donor = await Donor.findOneAndUpdate(
            { userId: req.user.id },
            { availability },
            { new: true }
        ).populate('userId', 'name email phone bloodType city district gender');

        if (!donor) {
            return res.status(404).json({ message: 'Donor profile not found' });
        }

        res.json(donor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get nearby blood requests for donor
export const getNearbyRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        const requests = await Request.find({
            bloodType: user.bloodType,
            status: 'pending',
            city: user.city
        }).sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Add donation to history
export const addDonation = async (req, res) => {
    try {
        const { date, 
            hospital, 
            request, 
            bloodType, 
            quantity, 
            notes  } = req.body;
        
        const donor = await Donor.findOne({ userId: req.user.id });
        if (!donor) {
            return res.status(404).json({ message: 'Donor profile not found' });
        }

        const userBloodType = bloodType || (await User.findById(req.user.id)).bloodType;

        const newDonation = {
            date: date || new Date(),
            hospital,
            request,
            bloodType: userBloodType,
            quantity: quantity || 1, // default to 1 unit
            notes,
            status: "Completed"
        };

        // Add to donation history
        donor.donationHistory.push(newDonation);

        // Update last donation date
        donor.lastDonationDate = newDonation.date;
        
        // Increment donation count
        donor.donationCount += 1;
        
        // Update points and donor level
        donor.points += 10;
        updateDonorLevel(donor);

        await donor.save();

        res.json(donor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const updateDonorLevel = (donor) => {
    if (donor.points >= 100) {
        donor.donorLevel = "Gold";
    } else if (donor.points >= 50) {
        donor.donorLevel = "Silver";
    } else {
        donor.donorLevel = "Bronze";
    }
};

export const updateDonation = async (req, res) => {
    try {
        const { donationId } = req.params;
        const updateData = req.body;

        const donor = await Donor.findOne({ userId: req.user.id });
        if (!donor) {
            return res.status(404).json({ message: 'Donor profile not found' });
        }

        const donation = donor.donationHistory.id(donationId);
        if (!donation) {
            return res.status(404).json({ message: 'Donation record not found' });
        }

        // Update fields
        if (updateData.date) donation.date = updateData.date;
        if (updateData.hospital) donation.hospital = updateData.hospital;
        if (updateData.bloodType) donation.bloodType = updateData.bloodType;
        if (updateData.quantity) donation.quantity = updateData.quantity;
        if (updateData.notes) donation.notes = updateData.notes;
        if (updateData.status) donation.status = updateData.status;

        // If status changed to cancelled, adjust points
        if (updateData.status === 'Cancelled' && donation.status !== 'Cancelled') {
            donor.points = Math.max(0, donor.points - 10);
            updateDonorLevel(donor);
        }

        await donor.save();

        res.json(donor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update health info
export const updateHealthInfo = async (req, res) => {
    try {
        const { healthInfo } = req.body;

        const donor = await Donor.findOneAndUpdate(
            { userId: req.user.id },
            { healthInfo },
            { new: true }
        );

        if (!donor) {
            return res.status(404).json({ message: 'Donor profile not found' });
        }

        res.json(donor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export const getDonationHistory = async (req, res) => {
    try {
        const donor = await Donor.findOne({ userId: req.user.id })
            .populate({
                path: 'donationHistory.hospital',
                select: 'name address'
            })
            .populate({
                path: 'donationHistory.request',
                select: 'patientName'
            })
            .select('donationHistory');

        if (!donor) {
            return res.status(404).json({ message: 'Donor profile not found' });
        }

        res.json(donor.donationHistory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export const getDonorStats = async (req, res) => {
    try {
        const donor = await Donor.findOne({ userId: req.user.id });
        if (!donor) {
            return res.status(404).json({ message: 'Donor profile not found' });
        }

        const stats = {
            totalDonations: donor.donationCount,
            points: donor.points,
            donorLevel: donor.donorLevel,
            lastDonationDate: donor.lastDonationDate,
            availability: donor.availability
        };

        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};