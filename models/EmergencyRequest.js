import mongoose from 'mongoose';


const responseSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    canHelp: { type: Boolean, required: true },
    respondedAt: { type: Date, default: Date.now },
    sentToRequester: { type: Boolean, default: false }
});


const notificationLogSchema = new mongoose.Schema({
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['donor','hospital'] },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent','failed'], default: 'sent' }
});

const emergencyRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    bloodType: { 
        type: String, 
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    unitsNeeded: { type: Number, required: true },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isGuest: { type: Boolean, default: false },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },
    status: { type: String, enum: ['pending', 'hospital_pending','verified', 'completed', 'cancelled'], default: 'pending' },
    
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'verifiedByModel', default: null },

    verificationRequestedAt: { type: Date },
    verifiedAt: { type: Date },
    verificationTimeout: { type: Date },
    
    responses: [responseSchema],
    notificationsSent: [notificationLogSchema],
    
    expiresAt: { type: Date, default: () => Date.now() + 1000 * 60 * 60 * 24 },
    createdAt: { type: Date, default: Date.now },
});

emergencyRequestSchema.index({ 'coordinates': '2dsphere' });
emergencyRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('EmergencyRequest', emergencyRequestSchema);