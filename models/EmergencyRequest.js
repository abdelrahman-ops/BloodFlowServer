import mongoose from 'mongoose';


const responseSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
    canHelp: { type: Boolean, required: true },
    respondedAt: { type: Date, default: Date.now },
    sentToRequester: { type: Boolean, default: false }
});

const emergencyRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    hospital: { type: String },
    bloodType: { 
        type: String, 
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    unitsNeeded: { type: Number, required: true },
    notes: { type: String },
    coordinates: {
    lat: { type: Number },
    lng: { type: Number }
    },
    status: {
        type: String,
        enum: ['pending', 'fulfilled', 'cancelled'],
        default: 'pending'
    },
    responses: [responseSchema],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('EmergencyRequest', emergencyRequestSchema);