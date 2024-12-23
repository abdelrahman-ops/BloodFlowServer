const { required } = require("joi");
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: True,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdminNotification", // Reference to AdminNotification model
      },
    ],
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
