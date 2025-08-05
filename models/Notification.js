import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    emergencyRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmergencyRequest'
    },
    read: { type: Boolean, default: false },
    type: {
        type: String,
        enum: ["emergency", "donation", "system", "info", 'reminder'],
        default: 'emergency',
    },
    action: {
        kind: { type: String, enum: ["request", "donation"] },
        refId: mongoose.Schema.Types.ObjectId
    },
    urgency: { type: String, enum: ["low", "medium", "high"] },
    expiresAt: Date
}, {
    timestamps: true
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
