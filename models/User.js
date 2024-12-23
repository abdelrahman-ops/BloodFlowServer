import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "donor", "hospitalStaff"],
      default: "donor",
    },
    isAdmin: {
      type: Boolean,
      default: false, // Legacy flag for admin
    },
    bloodType: { type: String, enum: ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"], required: false },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    lastDonationDate: { type: Date, default: null },
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserNotification", // Reference to UserNotification model
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
