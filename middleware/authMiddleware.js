import jwt from "jsonwebtoken";
import Donor from "../models/Donor.js";

// Middleware to authenticate users
const protectRoute = async (req, res, next) => {
    try {
        // Extract token from Authorization header or cookies
        const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

        // If no token is provided
        if (!token) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access. Token is missing. Please log in.",
            });
        }

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decodedToken);

        // Fetch user details from the database
        const user = await Donor.findById(decodedToken.userId).select("isAdmin email");
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found. Please log in again.",
            });
        }

        // Attach user info to the request object
        req.user = {
            email: user.email,
            isAdmin: user.isAdmin,
            userId: decodedToken.userId, // Ensure correct ID is used
        };

        console.log("User authenticated:", req.user);
        next(); // Pass control to the next middleware
    } catch (error) {
        console.error("Authentication error:", error.message);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                status: false,
                message: "Invalid token. Please log in again.",
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                status: false,
                message: "Token has expired. Please log in again.",
            });
        }

        return res.status(500).json({
            status: false,
            message: "Internal server error. Please try again later.",
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

export { protectRoute , isAdminRoute, isUserRoute };
