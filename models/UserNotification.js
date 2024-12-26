import mongoose from "mongoose";

const userNotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor", // Reference to User model
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
    relatedDonation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation", // Reference to Donation (optional, for context)
    },
    urgency: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    distance: { type: String, required: false }, // e.g., "2 km"
  },
  { timestamps: true }
);

const UserNotification = mongoose.model(
  "UserNotification",
  userNotificationSchema
);
export default UserNotification;
