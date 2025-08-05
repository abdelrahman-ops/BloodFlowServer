import express from 'express';
import {
    getUserNotifications,
    markNotificationAsRead,
    getUnreadNotificationCount
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.js';


const router = express.Router();

// Protected routes (require authentication)
router.get('/', protect, getUserNotifications);
router.patch('/:notificationId/read', protect, markNotificationAsRead);
router.get('/unread-count', protect, getUnreadNotificationCount);

export default router;