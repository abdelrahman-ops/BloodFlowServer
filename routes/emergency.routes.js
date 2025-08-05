import express from 'express';
import { createEmergencyRequest, getEmergencyRequests, trackEmergencyRequest, updateEmergencyRequestStatus } from '../controllers/emergency.controller.js';
import { authorize, protect } from '../middleware/auth.js';
// import rateLimit from 'express-rate-limit';

const router = express.Router();

// const emergencyLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 3,
//     message: 'Too many emergency requests from this IP, please try again later'
// });


router.post('/', createEmergencyRequest);
router.get('/', protect, authorize('admin'), getEmergencyRequests);
router.put('/:id/status', protect, authorize('admin'), updateEmergencyRequestStatus);
router.get('/:id/updates', protect, trackEmergencyRequest);

export default router;