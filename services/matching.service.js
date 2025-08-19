// src/services/matching.service.js
import User from "../models/User.js";
import Donor from "../models/Donor.js";


export async function findDonorsByBloodAndLocation(bloodType, coordsOrLocation, maxDistance = 10000, limit = 50) {
    // Normalize coords
    let lng = 0, lat = 0;
    if (coordsOrLocation?.lng !== undefined && coordsOrLocation?.lat !== undefined) {
        lng = coordsOrLocation.lng; lat = coordsOrLocation.lat;
    } else if (coordsOrLocation?.coordinates && Array.isArray(coordsOrLocation.coordinates)) {
        // handle GeoJSON Point { coordinates: [lng, lat] }
        [lng, lat] = coordsOrLocation.coordinates;
    } else {
        // fallback: try to parse if coordsOrLocation is a string (not ideal)
        throw new Error('Invalid coords provided to matching service');
    }

    // Find users (donors) by geo proximity + blood type
    const users = await User.find({
        role: 'donor',
        bloodType,
        available: true,
        location: {
        $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: maxDistance
        }
        }
    }).limit(limit).select('_id');

    const userIds = users.map(u => u._id);

    // Find Donor documents for those users and populate user data (fcmToken, phone, name, etc.)
    const donors = await Donor.find({ userId: { $in: userIds } }).populate('userId');

    return donors;
}
