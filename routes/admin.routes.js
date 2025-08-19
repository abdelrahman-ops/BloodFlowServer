import express from 'express';
import { createAdmin, createEvent, deleteEvent, deleteUser, getAllAdmins, 
    getAllEvents, getAllUsers, getSystemOverview, getUserById, registerHospitalAdmin, 
    updateEvent, updateUser } from '../controllers/admin.controller.js';
import { authorize, protect } from '../middleware/auth.js';
import { getEmergencyRequests } from '../controllers/emergency.controller.js';


const router = express.Router();



router.get('/overview', protect, authorize('admin'), getSystemOverview);

router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin'), getUserById);
router.get('/users', protect, authorize('admin'), getAllUsers);

router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

router.get('/events', protect, authorize('admin'), getAllEvents);
router.post('/events', protect, authorize('admin'), createEvent);
router.put('/events', protect, authorize('admin'), updateEvent);
router.delete('/events', protect, authorize('admin'), deleteEvent);

router.get('/admins', protect, authorize('admin'), getAllAdmins);
router.post('/admins', protect, authorize('admin'), createAdmin);


router.get('/emergencies', protect, authorize('admin'), getEmergencyRequests);


router.post('/register-hospital-admin', registerHospitalAdmin);


export default router;