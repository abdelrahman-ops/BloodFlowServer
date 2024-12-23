import mongoose from "mongoose";

const bloodInventorySchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true, // Inventory is tied to a hospital
    },
    bloodStock: {
      type: Map,
      of: Number, // Key-value pair of blood type (e.g., "A+") and quantity
      default: {
        "A+": 0,
        "A-": 0,
        "B+": 0,
        "B-": 0,
        "AB+": 0,
        "AB-": 0,
        "O+": 0,
        "O-": 0,
      },
    },
  },
  { timestamps: true }
);

const BloodInventory = mongoose.model("BloodInventory", bloodInventorySchema);
export default BloodInventory;
