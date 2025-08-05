import express from 'express';
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
router.get('/me',  getMe);
router.put('/update-profile',  updateProfile);
router.put('/change-password',  changePassword);
router.put('/fcm-token',  updateFcmToken);

export default router;