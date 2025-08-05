import mongoose from 'mongoose';
import './Hospital.js'

const donorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastDonationDate: { type: Date },
    donationHistory: [{
            date: { type: Date, required: true },
            location: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
            status: { type: String, default: "Completed" },
        },
    ],
    donorLevel: { type: String, default: "Bronze" },
    points: { type: Number, default: 0 },
    availability: { type: Boolean, default: true },
    healthInfo: { type: String },
    donationCount: { type: Number, default: 0 }
});

export default mongoose.model('Donor', donorSchema);