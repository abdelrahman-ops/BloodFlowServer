import express from "express";
import { loginUser, registerUser, logoutUser } from "../controllers/authController.js";

const router = express.Router();

// User Registration
router.post("/register", registerUser);

// User Login
router.post("/login", loginUser);

// User Logout
router.post("/logout", logoutUser);

export default router;
