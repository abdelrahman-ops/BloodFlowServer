import express from 'express';
import { addDonation, getDonationHistory, getDonorProfile, getDonors, getDonorStats, getNearbyRequests, updateAvailability, updateDonation, updateHealthInfo } from '../controllers/donor.controller.js';
import {protect} from '../middleware/auth.js'
// import { handleDonorResponse } from '../services/notification.service.js';


const router = express.Router();

router.get('/', getDonors);
router.get('/profile', protect, getDonorProfile);
router.put('/availability',protect,  updateAvailability);
router.get('/nearby-requests',protect,  getNearbyRequests);

router.put('/health-info',protect,  updateHealthInfo);

router.post('/donations',protect, addDonation);
router.put('/donations/:donationId',protect, updateDonation);

router.get('/donations',protect, getDonationHistory);
router.get('/stats',protect, getDonorStats);

// router.post('/respond-to-emergency',  async (req, res) => {
//     try {
//         const { emergencyId, canHelp } = req.body;
//         const donorId = req.user.id;

//         const result = await handleDonorResponse(donorId, emergencyId, canHelp);

//         res.json({
//         success: true,
//         message: canHelp 
//             ? 'Thank you for responding to this emergency!' 
//             : 'Thanks for letting us know',
//         emergencyRequest: result.emergencyRequest
//         });

//     } catch (err) {
//         console.error('Donor response error:', err);
//         res.status(500).json({ 
//         success: false,
//         message: 'Failed to process your response'
//         });
//     }
// });

export default router;