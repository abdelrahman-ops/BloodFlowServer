import express from 'express';
import { 
    changePassword,
    getMe, 
    login, 
    register, 
    updateFcmToken, 
    updateProfile,
    logout
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect,  getMe);
router.put('/update-profile', protect,  updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/fcm-token',protect,  updateFcmToken);
router.post('/logout', logout);

// logout , register admin , get admin data

export default router;