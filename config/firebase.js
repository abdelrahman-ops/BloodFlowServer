import admin from 'firebase-admin';
console.log('process.env.FIREBASE_SERVICE_ACCOUNT: ', process.env.FIREBASE_PROJECT_ID)
if (!admin.apps.length) {
    admin.initializeApp({
            credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

export default admin;