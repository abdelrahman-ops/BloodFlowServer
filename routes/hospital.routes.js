import express from "express";
import { authorize, protect } from "../middleware/auth.js";
import { createHospitalForAdmin } from "../controllers/hospital.controller.js";

const router = express.Router();

// Create a new hospital (Admin only)
router.post("/create", protect, authorize('admin') , createHospitalForAdmin);

// Get all hospitals
// router.get("/", getHospitals);

// Get a specific hospital by ID
// router.get("/:id", protect, authorize('admin'), getHospitalById);

// Update a hospital
// router.put("/:id", protect, authorize('admin'), updateHospital);

// Delete a hospital
// router.delete("/:id", protect, authorize('admin'), deleteHospital);

export default router;
