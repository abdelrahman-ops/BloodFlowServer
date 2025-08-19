import Admin from "../models/Admin.js";
import Hospital from "../models/Hospital.js";
import User from "../models/User.js";

export const createHospitalForAdmin = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware
    const { hospitalName, hospitalPhone, street, city, state, postalCode, lat, lng } = req.body;

    // 1. Ensure the logged-in user is admin
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create hospitals" });
    }

    // 2. Prevent creating multiple hospitals for same admin
    const existingAdmin = await Admin.findOne({ userId });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already linked to a hospital" });
    }

    // 3. Create hospital first (no admin assigned yet)
    const hospital = await Hospital.create({
      name: hospitalName,
      phone: hospitalPhone,
      address: { street, city, state, postalCode },
      location: { type: "Point", coordinates: [lng, lat] }
    });

    // 4. Create admin linked to hospital
    const admin = await Admin.create({
      userId: user._id,
      hospital: hospital._id
    });

    // 5. Update hospital with admin reference
    hospital.admin = admin._id;
    await hospital.save();

    res.status(201).json({
      message: "Hospital created and linked to admin successfully",
      hospital,
      admin
    });

  } catch (err) {
    console.error("Error in createHospitalForAdmin:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
