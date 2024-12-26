import mongoose from "mongoose";


const requestSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    bloodType: { type: String, required: true },
    location: { type: String, required: true },
    urgencyLevel: { type: String, enum: ["low", "medium", "high"], required: true },
    status: { type: String, enum: ["pending", "matched", "completed"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
});


const Request = mongoose.model("Request", requestSchema);
export default Request;