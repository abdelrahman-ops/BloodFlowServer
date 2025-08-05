import express from 'express';
import { createEmergencyRequest, getEmergencyRequests, trackEmergencyRequest, updateEmergencyRequestStatus } from '../controllers/emergency.controller.js'
// import rateLimit from 'express-rate-limit';

const router = express.Router();

// const emergencyLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 3,
//     message: 'Too many emergency requests from this IP, please try again later'
// });


router.post('/', createEmergencyRequest);
router.get('/',   getEmergencyRequests);
router.put('/:id/status',   updateEmergencyRequestStatus);
router.get('/:id/updates',  trackEmergencyRequest);

export default router;