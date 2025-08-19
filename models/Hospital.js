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
                enum: ['Point'], 
                required: true,
                default: 'Point'
            },
            coordinates: { 
                type: [Number], 
                required: true,
                validate: {
                validator: function(coords) {
                    return coords.length === 2 && 
                        typeof coords[0] === 'number' && 
                        typeof coords[1] === 'number';
                },
                    message: 'Coordinates must be an array of two numbers [longitude, latitude]'
                }
            }
        },

        phone: {
            type: String,
            required: true,
        },
        admin: {
        type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: false
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
