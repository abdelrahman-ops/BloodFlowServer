import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Reference to Admin model
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital", // Reference to Hospital (optional, for context)
    },
  },
  { timestamps: true }
);

const AdminNotification = mongoose.model(
  "AdminNotification",
  adminNotificationSchema
);
export default AdminNotification;
