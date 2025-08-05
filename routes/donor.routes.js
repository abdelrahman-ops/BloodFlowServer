import express from 'express';
import { addDonation, getDonorProfile, getDonors, getNearbyRequests, updateAvailability, updateHealthInfo } from '../controllers/donor.controller.js';

import { handleDonorResponse } from '../services/notification.service.js';


const router = express.Router();

router.get('/', getDonors);
router.get('/profile',  getDonorProfile);
router.put('/availability',  updateAvailability);
router.get('/nearby-requests',  getNearbyRequests);
router.post('/donate',  addDonation);
router.put('/health-info',  updateHealthInfo);

export default router;