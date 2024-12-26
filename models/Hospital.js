import mongoose from "mongoose";
import BloodInventory from "./Inventory.js";
const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    phone: {
      type: String,
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true, // Every hospital must have an admin
    },
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodInventory",
    },
  },
  { timestamps: true }
);

const Hospital = mongoose.model("Hospital", hospitalSchema);
export default Hospital;
