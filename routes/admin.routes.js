import express from 'express';
import { createAdmin, createEvent, deleteEvent, deleteUser, getAllAdmins, getAllEvents, getAllUsers, getSystemOverview, getUserById, updateEvent, updateUser } from '../controllers/admin.controller.js';


const router = express.Router();



router.get('/overview', getSystemOverview);

router.get('/users',  getAllUsers);
router.get('/users/:id', getUserById);
router.get('/users', getAllUsers);

router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/events', getAllEvents);
router.post('/events', createEvent);
router.put('/events', updateEvent);
router.delete('/events', deleteEvent);

router.get('/admins', getAllAdmins);
router.post('/admins', createAdmin);


export default router;