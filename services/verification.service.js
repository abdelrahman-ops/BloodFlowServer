import EmergencyRequest from '../models/EmergencyRequest.js';
import Hospital from '../models/Hospital.js';
import { sendNotificationToUser } from './notification.service.js';

// Check for expired verification requests
export const checkExpiredVerifications = async () => {
    try {
        const now = new Date();
        const expiredRequests = await EmergencyRequest.find({
        status: 'hospital_pending',
        verificationTimeout: { $lte: now }
        });

        for (const request of expiredRequests) {
        // Update status to expired or cancelled
        request.status = 'cancelled';
        await request.save();
        
        // Notify the requester if possible
        if (request.createdBy) {
            await sendNotificationToUser(request.createdBy, {
            title: 'Emergency Expired',
            body: 'Your emergency request was not verified in time and has expired',
            data: {
                emergencyId: request._id.toString(),
                type: 'verification_expired'
            }
            });
        }
        }

        return {
        processed: expiredRequests.length
        };
    } catch (err) {
        console.error('Error in checkExpiredVerifications:', err);
        throw err;
    }
};

// Setup a cron job to run this periodically (e.g., every hour)