import express from 'express';
import {
    getUserNotifications,
    markNotificationAsRead,
    getUnreadNotificationCount
} from '../controllers/notification.controller.js';


const router = express.Router();

// Protected routes (require authentication)
router.get('/', getUserNotifications);
router.patch('/:notificationId/read', markNotificationAsRead);
router.get('/unread-count', getUnreadNotificationCount);

export default router;