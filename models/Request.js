import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bloodType: { 
        type: String, 
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    unitsNeeded: { type: Number, required: true },
    location: { type: String, required: true },
    hospital: { type: String },
    notes: { type: String },
    status: { 
        type: String, 
        enum: ['pending', 'fulfilled', 'cancelled'], 
        default: 'pending' 
    },
    createdAt: { type: Date, default: Date.now },
    fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' }
});

export default mongoose.model('Request', requestSchema);