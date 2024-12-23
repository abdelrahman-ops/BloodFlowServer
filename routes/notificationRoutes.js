import express from "express";
import {
    getAdminNotifications,
    markAdminNotificationRead,
    getUserNotifications,
    markUserNotificationRead,
} from "../controllers/notificationController.js";
import { protectRoute, isAdminRoute, isUserRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin Notifications
router.get("/admin", protectRoute, isAdminRoute, getAdminNotifications);
router.put("/admin/:id/read", protectRoute, isAdminRoute, markAdminNotificationRead);

// User Notifications
router.get("/user", protectRoute, isUserRoute, getUserNotifications);
router.put("/user/:id/read", protectRoute, isUserRoute, markUserNotificationRead);

export default router;
