import mongoose from 'mongoose';
import './Hospital.js'

const donationHistorySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    hospital: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Hospital', 
        required: true 
    },
    request: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request'
    },
    bloodType: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Completed', 'Cancelled', 'Pending'], 
        default: "Completed" 
    },
    notes: { type: String },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const donorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastDonationDate: { type: Date },
    donationHistory: [donationHistorySchema],
    donorLevel: { type: String, default: "Bronze" },
    points: { type: Number, default: 0 },
    availability: { type: Boolean, default: true },
    healthInfo: { type: String },
    donationCount: { type: Number, default: 0 }
});

export default mongoose.model('Donor', donorSchema);