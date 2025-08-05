import express from 'express';
import { createRequest, getAllRequests, getUserRequests, updateRequestStatus } from '../controllers/request.controller.js';





const router = express.Router();


router.post('/', createRequest);
router.get('/my-requests', getUserRequests);
router.get('/', getAllRequests);
router.put('/:id/status', updateRequestStatus);

export default router;