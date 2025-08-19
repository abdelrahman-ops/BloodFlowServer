import mongoose from "mongoose";


const adminSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
        },
    },
    { timestamps: true }
);



export default mongoose.model("Admin", adminSchema);
