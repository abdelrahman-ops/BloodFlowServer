import User from "../models/User.js";
import Admin from "../models/Admin.js";
import { createJWT, clearJWT } from "../config/jwt.js";

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
    res.status(500).json({ success: false, message: "Server error" });
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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login a user or admin
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
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
    createJWT(res, user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Server error" });
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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { registerUser, registerAdmin, loginUser, logoutUser };
