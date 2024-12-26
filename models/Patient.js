import mongoose from "mongoose";


const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bloodType: { type: String, required: true },
    contactDetails: {
        phone: { type: String, required: true },
        email: { type: String },
    },
    urgencyLevel: { type: String, enum: ["low", "medium", "high"], required: true },
    location: {type: String },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
    },
    createdAt: { type: Date, default: Date.now },
})

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;