import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to authenticate users
const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from Authorization header or cookies
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
        return res.status(401).json({
            status: false,
            message: "Unauthorized access. Token missing.",
        });
        }

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decodedToken);

        // Fetch user details from database
        const user = await User.findById(decodedToken.userId).select("isAdmin email");
        if (!user) {
        return res.status(404).json({
            status: false,
            message: "User not found.",
        });
        }

        // Attach user info to the request object
        req.user = {
        email: user.email,
        isAdmin: user.isAdmin,
        userId: decodedToken.userId, // Ensure the correct field is used
        };

        console.log("Authenticated user:", req.user);
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(401).json({
        status: false,
        message: "Invalid or expired token. Please log in again.",
        });
    }
};

// Middleware to restrict access to admin users
const isAdminRoute = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({
        status: false,
        message: "Access denied. Admins only.",
        });
    }
};

// Middleware to restrict access to regular users (donors)
const isUserRoute = (req, res, next) => {
    if (req.user && req.user.role === "donor") {
        next();
    } else {
        return res.status(403).json({
        status: false,
        message: "Access denied. Donors only.",
        });
    }
};

export { authMiddleware, isAdminRoute, isUserRoute };
