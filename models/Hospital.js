import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true , unique : true },
        address: {
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: {type: String , default: "Egypt"}
        },
        location: {
            type: {
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            coordinates: [Number] // [longitude, latitude]
        },

        phone: {
            type: String,
            required: true,
        },
        admin: {
        type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true
        },
        inventory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BloodInventory"
        }
    },
{ timestamps: true }
);
// Create geospatial index for location-based queries
hospitalSchema.index({ location: '2dsphere' });

// Virtual for formatted address
hospitalSchema.virtual('formattedAddress').get(function() {
    return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.postalCode}`;
});
const Hospital = mongoose.model("Hospital", hospitalSchema);
export default Hospital;
