import User from "../models/User.js";
import Admin from "../models/Admin.js";
import { createJWT, clearJWT } from "../config/jwt.js";
import jwt from "jsonwebtoken";
// Register a new user (Donor)
const registerUser = async (req, res) => {
  const { name, email, password, bloodType, donor } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create a new user (password hashing is handled in the model)
    const newUser = new User({
      name,
      email,
      password, // The model pre-save middleware will hash this
      bloodType,
      donor: donor || false,
    });

    await newUser.save();

    // Generate a JWT and set the cookie
    createJWT(res, newUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, message: "User Register Server error" });
  }
};

// Register a new admin
const registerAdmin = async (req, res) => {
  const { name, email, password, hospital ,hospitalId } = req.body;

  try {
    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin already exists" });
    }

    // Create a new admin (password hashing is handled in the model)
    const newAdmin = new Admin({
      name,
      email,
      password,
      hospital,
      hospitalId,
    });

    await newAdmin.save();

    // Generate a JWT and set the cookie
    createJWT(res, newAdmin);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ success: false, message: "Admin Register Server error" });
  }
};

// Login a user or admin
const loginUser = async (req, res) => {
  

  try {
    const { email, password } = req.body;
    // Find the user or admin by email
    const user = await User.findOne({ email }) || (await Admin.findOne({ email }));

    if (!user) {
      return res.status(404).json({ success: false, message: "User/Admin not found" });
    }

    // Check if the password matches (hashed comparison is handled in the model method)
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Generate a JWT and set the cookie
    const token = createJWT(res, user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
      token,
    });
    console.log("Decoded Token",jwt.verify(token, process.env.JWT_SECRET));
    
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Login Server error" });
  }
};

// Logout a user or admin
const logoutUser = (req, res) => {
  try {
    // Clear the JWT cookie
    clearJWT(res);

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ success: false, message: "Logout Server error" });
  }
};

const getUserData = async (req, res) => {
  try {
    // Retrieve the user ID from the authenticated request
    const userId = req.user?.userId; // Ensure correct field is used from req.user
    console.log("User ID from request:", userId);

    // If the user ID is missing
    if (!userId) {
      return res.status(400).json({ error: "User ID not found in the request" });
    }

    // Fetch user from the database
    const user = await User.findById(userId);

    // If the user does not exist in the database
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prepare the user data to send
    const sendUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      phone: user.phone,
      address: user.address,
      role: user.role,
      bloodType: user.bloodType,
      donorLevel: user.donorLevel,
      points: user.points,
      lastDonationDate: user.lastDonationDate,
      donationHistory: user.donationHistory,
      notifications: user.notifications,
    };

    // Respond with the user data
    res.status(200).json(sendUser);
  } catch (error) {
    console.error("Error fetching user data:", error.message);

    // Return a generic server error
    res.status(500).json({ error: "An error occurred while fetching user data" });
  }
};



const getAdminData = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findById(id).populate("hospital", "name location");

    if (!admin) {
      return res.status(404).json({ error: "Admin Not Found" });
    }

    // Prepare the response object with selected fields
    const sendAdmin = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      hospital: admin.hospital, // Includes only name and location due to the populate
      role: admin.role,
      isAdmin: admin.isAdmin,
      notifications: admin.notifications, // Optionally include this if needed
    };

    res.status(200).json(sendAdmin);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({ error: "Server Error" });
  }
};


export { registerUser, registerAdmin, loginUser, logoutUser , getUserData , getAdminData};
