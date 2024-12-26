import mongoose from "mongoose";



const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        age: {type : Number , required: true },
        gender: {type: String , required: true},
        address: { type: String },
        phone: { type: String },
        availability: { type: Date },
        bloodType: { type: String, enum: ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"], required: false },
        lastDonationDate: { type: Date, default: null },
        createdAt: { type: Date, default: Date.now },
},
    { timestamps: true }
);



const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
