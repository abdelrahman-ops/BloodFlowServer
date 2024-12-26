import express from "express";
import { loginUser, registerDonor, logoutUser, registerAdmin, getUserData, getAdminData , registerQuickDonor } from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// User Registration
router.post("/register", registerDonor);
router.post("/register/quick", registerQuickDonor); 

// Admin Registration
router.post("/register/admin", registerAdmin);

// User Login
router.post("/login", loginUser);

// User Logout
router.post("/logout", logoutUser);

router.get("/user", protectRoute ,getUserData);

router.get("/admin", getAdminData);

export default router;
