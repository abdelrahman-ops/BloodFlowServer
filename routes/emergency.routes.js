import express from 'express';
import {
    createGuestEmergency,
    createEmergencyRequest,
    verifyEmergencyRequest,
    getPendingVerificationEmergencies,
    trackEmergencyRequest,
    getEmergencyRequests,
    updateEmergencyRequestStatus
} from '../controllers/emergency.controller.js';

import { protect , authorize} from '../middleware/auth.js'


const router = express.Router();

/**
 * @desc Create emergency request as guest
 * @route POST /api/emergencies/guest
 * @access Public
 */
router.post('/guest', createGuestEmergency); // test done

/**
 * @desc Create emergency request (verified immediately)
 * @route POST /api/emergencies
 * @access Private (logged-in hospital admin or user)
 */
router.post('/', protect, createEmergencyRequest); // test done

/**
 * @desc Verify a pending emergency request
 * @route PATCH /api/emergencies/:id/verify
 * @access Private (hospital admin only)
 */
router.patch('/:id/verify', protect, authorize('admin'), verifyEmergencyRequest); // test done

/**
 * @desc Get all emergencies pending verification for a hospital
 * @route GET /api/emergencies/pending-verification
 * @access Private (hospital admin only)
 */
router.get('/pending-verification', protect, authorize('admin'), getPendingVerificationEmergencies); // test done 

/**
 * @desc Track emergency request updates (SSE)
 * @route GET /api/emergencies/:id/track
 * @access Public (guest or logged-in)
 */
router.get('/:id/track', trackEmergencyRequest); // test done

/**
 * @desc Get all emergency requests (admin dashboard)
 * @route GET /api/emergencies
 * @access Private (admin or hospital)
 */
router.get('/', protect, getEmergencyRequests); // test done

/**
 * @desc Update emergency request status
 * @route PATCH /api/emergencies/:id/status
 * @access Private (admin or hospital)
 */
router.patch('/:id/status', protect, updateEmergencyRequestStatus); // test done

export default router;
