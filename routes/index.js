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
import hospital from './hospital.routes.js';

const router = express.Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/v2/donations", donationRoutes);
router.use("/v2/notifications", notificationRoutes);
router.use("/v2/hospitals", hospitalRoutes);
router.use("/v2/patient", patientRoutes);


router.use('/v2/auth', auth); //done
router.use('/v2/requests', requests);
router.use('/v2/emergency', emergency);
router.use('/v2/donors', donors);
router.use('/v2/admin', admin);
router.use('/v2/notification', notification);

router.use("/v3/hospitals", hospital);

export default router;

