import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
    changePassword,
    getMe, 
    login, 
    register, 
    updateFcmToken, 
    updateProfile
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/fcm-token', protect, updateFcmToken);

export default router;