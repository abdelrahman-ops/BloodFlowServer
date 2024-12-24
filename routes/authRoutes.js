import express from "express";
import { loginUser, registerUser, logoutUser, registerAdmin } from "../controllers/authController.js";

const router = express.Router();

// User Registration
router.post("/register", registerUser);

// Admin Registration
router.post("/register/admin", registerAdmin);

// User Login
router.post("/login", loginUser);

// User Logout
router.post("/logout", logoutUser);

export default router;
