import admin from 'firebase-admin';
import serviceAccount from './bloodflow-4d8a2-firebase-adminsdk-fbsvc-190b0796aa.json'

if (!admin.apps.length) {
    admin.initializeApp({
            credential: admin.credential.cert({serviceAccount})
    });
}

export default admin;