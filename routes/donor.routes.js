import express from 'express';
import { addDonation, getDonorProfile, getDonors, getNearbyRequests, updateAvailability, updateHealthInfo } from '../controllers/donor.controller.js';

// import { handleDonorResponse } from '../services/notification.service.js';


const router = express.Router();

router.get('/', getDonors);
router.get('/profile',  getDonorProfile);
router.put('/availability',  updateAvailability);
router.get('/nearby-requests',  getNearbyRequests);
router.post('/donate',  addDonation);
router.put('/health-info',  updateHealthInfo);
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