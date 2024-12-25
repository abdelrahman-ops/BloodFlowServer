import express from "express";
import {
    createDonation,
    getDonations,
    getDonationById,
    updateDonation,
    deleteDonation,
} from "../controllers/donationController.js";
import { protectRoute, isAdminRoute, isUserRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new donation (User only)
router.post("/", createDonation);

// Get all donations (Admin only)
router.get("/",getDonations);

// Get a specific donation by ID (Admin/User)
router.get("/", getDonationById);

// Update a donation (Admin only)
router.put("/", updateDonation);

// Delete a donation (Admin only)
router.delete("/:id", deleteDonation);

export default router;
