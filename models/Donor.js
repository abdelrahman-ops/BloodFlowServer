import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const donorSchema = new mongoose.Schema(
    {
    name: { type: String, required: true, trim: true },
    age: {type : Number , required: true },
    gender: {type: String , required: true},
    address: { type: String },
    email: { 
        type: String, 
        unique: true, 
        lowercase: true ,
        required: true,
    },
    phone: { type: String },
    password: { 
        type: String, 
        required: true,
    },
    availability: { type: Boolean, default: true },
    role: {
        type: String,
        enum: ["admin", "donor", "hospitalStaff"],
        default: "donor",
    },
    isAdmin: {
        type: Boolean,
        default: false, // Legacy flag for admin
    },
    bloodType: { type: String, enum: ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"], required: false },
    lastDonationDate: { type: Date, default: null },
    donationHistory: [{
        date: { type: Date, required: true },
        location: { type: String, required: true },
        status: { type: String, default: "Completed" },
        },
    ],
    donorLevel: { type: String, default: "Bronze" },
    points: { type: Number, default: 0 },
    notifications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserNotification",
        },
    ],
    createdAt: { type: Date, default: Date.now },
},
    { timestamps: true }
);

// Password hashing middleware
donorSchema.pre("save", async function (next) {
    if (this.type === "quick" || !this.isModified("password")) {
        next();
    }
    else{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
});

// Method to compare hashed password
donorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Donor = mongoose.model("Donor", donorSchema);
export default Donor;
