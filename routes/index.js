import express from "express";
import authRoutes from "./authRoutes.js";
import donationRoutes from "./donationRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import hospitalRoutes from "./hospitalRoutes.js";
import patientRoutes from './patientRoutes.js';

import admin from './admin.routes.js';
import auth from './auth.routes.js';
import requests from './request.routes.js';
import emergency from './emergency.routes.js'
import donors from './donor.routes.js';
import notification from './notification.routes.js'

const router = express.Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/donations", donationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/hospitals", hospitalRoutes);
router.use("/patient", patientRoutes);


router.use('/auth/v2', auth);
router.use('/requests/v2', requests);
router.use('/emergency/v2', emergency);
router.use('/donors/v2', donors);
router.use('/admin/v2', admin);
router.use('/notification/v2', notification);

export default router;

