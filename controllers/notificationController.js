// getAdminNotifications,
//     markAdminNotificationRead,
//     getUserNotifications,
//     markUserNotificationRead,

import AdminNotification from "../models/AdminNotification";
import UserNotification from "../models/UserNotification";

const getAdminNotifications = async (req, res) => { 
    try{
        const notifications = await userNotification.find();
        res.status(200).json(notifications);
    }catch(error){
        res.status(404).json({ message: error.message });
    }
}
const markAdminNotificationRead = async (req, res) => {
    try{
        const notification = await AdminNotification.findByIdAndUpdate(req.params.id, { read: true });
        res.status(200).json(notification);
    }catch(error){
        res.status(404).json({ message: error.message });
    }
 }

const getUserNotifications = async (req, res) => {
    try{
        const notifications = await UserNotification.find();
        res.status(200).json(notifications);
    }catch(error){
        res.status(404).json({ message: error.message });
}}

const markUserNotificationRead = async (req, res) => {
    try{
        const notification = await UserNotification.findByIdAndUpdate(req.params.id, { read: true });
        res.status(200).json(notification);
    }catch(error){
        res.status(404).json({ message: error.message });
    }
 }


export {
    getAdminNotifications,
    markAdminNotificationRead,
    getUserNotifications,
    markUserNotificationRead,
};