import express from 'express';
import {
    getUserNotifications,
    markNotificationAsRead,
    getUnreadNotificationCount
} from '../controllers/notification.controller.js';
import { authorize, protect } from '../middleware/auth.js';


const router = express.Router();

// Protected routes (require authentication)

// router.post('/send', protect, authorize('admin','hospital'), sendNotification);


router.get('/', protect,getUserNotifications);
router.put('/:notificationId/read', protect, markNotificationAsRead);
router.get('/unread-count', protect, getUnreadNotificationCount);

export default router;