import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
    isAdmin: {type:Boolean , default : true},
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdminNotification", // Reference to AdminNotification model
      },
    ],
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
