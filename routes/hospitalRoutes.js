import express from "express";
import {
    createHospital,
    getHospitals,
    getHospitalById,
    updateHospital,
    deleteHospital,
} from "../controllers/hospitalController.js";
import { protectRoute, isAdminRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new hospital (Admin only)
router.post("/", protectRoute, isAdminRoute, createHospital);

// Get all hospitals
router.get("/", getHospitals);

// Get a specific hospital by ID
router.get("/:id", protectRoute, isAdminRoute, getHospitalById);

// Update a hospital
router.put("/:id", protectRoute, isAdminRoute, updateHospital);

// Delete a hospital
router.delete("/:id", protectRoute, isAdminRoute, deleteHospital);

export default router;
