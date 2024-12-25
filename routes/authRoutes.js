import express from "express";
import { loginUser, registerUser, logoutUser, registerAdmin, getUserData, getAdminData } from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// User Registration
router.post("/register", registerUser);

// Admin Registration
router.post("/register/admin", registerAdmin);

// User Login
router.post("/login", loginUser);

// User Logout
router.post("/logout", logoutUser);

router.get("/user", protectRoute ,getUserData);

router.get("/admin/:id", getAdminData);

export default router;
