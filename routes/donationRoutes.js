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
router.post("/", protectRoute, isUserRoute, createDonation);

// Get all donations (Admin only)
router.get("/", protectRoute, isAdminRoute, getDonations);

// Get a specific donation by ID (Admin/User)
router.get("/:id", protectRoute, getDonationById);

// Update a donation (Admin only)
router.put("/:id", protectRoute, isAdminRoute, updateDonation);

// Delete a donation (Admin only)
router.delete("/:id", protectRoute, isAdminRoute, deleteDonation);

export default router;
