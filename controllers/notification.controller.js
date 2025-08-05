import Notification from "../models/Notification.js";

// Get all notifications for current user
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // const userId = req.user._id;
        
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .populate('emergencyRequest', 'bloodType location hospital');
        
        console.log("useId: ", userId)
        console.log("notifications: ", notifications);

        res.json({
            success: true,
            notifications
        });
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to get notifications'
        });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ 
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            notification
        });
    } catch (err) {
        console.error('Mark notification error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
};

// Get unread notification count
export const getUnreadNotificationCount = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const count = await Notification.countDocuments({
            recipient: userId,
            read: false
        });

        res.json({
            success: true,
            count
        });
    } catch (err) {
        console.error('Unread count error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to get unread count'
        });
    }
};