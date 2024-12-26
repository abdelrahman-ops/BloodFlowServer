import Donation from "../models/Donation.js";
import User from "../models/User.js";
import Donor from "../models/Donor.js";
import Hospital from "../models/Hospital.js"

const createDonation = async (req, res) => {
    const { donorId, hospitalId, bloodType, amount } = req.body;

    try {
        if (!donorId || !hospitalId || !bloodType || !amount) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: donorId, hospitalId, bloodType, and amount are required.",
            });
        }


        const donor = await User.findById(donorId);
        if (!donor) {
            return res.status(404).json({
            success: false,
            message: "Donor not found.",
            });
        }

        if (!donor.donationHistory) {
            donor.donationHistory = [];
          }

        const lastDonationDate = donor.lastDonationDate;
        if (lastDonationDate) {
            const weeksSinceLastDonation = Math.floor((Date.now() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24 * 7));
            if (weeksSinceLastDonation < 12) {
            return res.status(400).json({
                success: false,
                message: "Donor is not eligible to donate yet. Minimum gap is 12 weeks.",
            });
            }
        }

        const newDonation = new Donation({
            donor: donorId,
            hospital: hospitalId,
            bloodType,
            amount,
            status: "Pending",
        });

        await newDonation.save();

        donor.lastDonationDate = new Date();
        donor.donationHistory.push({
            date: new Date(),
            location: hospitalId,
            status: "Completed",
        });

        await donor.save();

    // Send response
    res.status(201).json({
        success: true,
        message: "Donation created successfully.",
        donation: newDonation,
    });
    } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({ success: false, message: "Server error while creating donation." });
    }
};

const getDonations = async (req, res) => { }
const getDonationById = async (req, res) => { }
const updateDonation = async (req, res) => { }
const deleteDonation = async (req, res) => { }

export { 
    createDonation,
    getDonations,
    getDonationById,
    updateDonation,
    deleteDonation,
}