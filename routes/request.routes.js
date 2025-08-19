import express from 'express';
import { createRequest, getAllRequests, getUserRequests, updateRequestStatus } from '../controllers/request.controller.js';
import { authorize, protect } from '../middleware/auth.js';





const router = express.Router();


router.post('/', protect, createRequest);
router.get('/my-requests', protect, getUserRequests);
router.get('/', protect, authorize('admin'), getAllRequests);
router.put('/:id/status', protect, authorize('admin'), updateRequestStatus);

export default router;