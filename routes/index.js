import express from "express";
import authRoutes from "./authRoutes.js";
import donationRoutes from "./donationRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import hospitalRoutes from "./hospitalRoutes.js";
import patientRoutes from './patientRoutes.js';


const router = express.Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/donations", donationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/hospitals", hospitalRoutes);
router.use("/patient", patientRoutes)

export default router;

