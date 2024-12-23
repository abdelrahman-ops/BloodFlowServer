import express from "express";
import authRoutes from "./authRoutes.js";
import donationRoutes from "./donationRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import hospitalRoutes from "./hospitalRoutes.js";


const router = express.Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/donations", donationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/hospitals", hospitalRoutes);

export default router;

