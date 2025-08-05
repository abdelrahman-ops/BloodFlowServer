import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    bloodType: { 
        type: String, 
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    city: { type: String, required: true },
    district: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    role: { type: String, enum: ['admin', 'donor', 'user'], required: true },
    notifications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification",
        },
    ],
    fcmToken: { type: String },
    createdAt: { type: Date, default: Date.now }  
});

export default mongoose.model('User', userSchema);