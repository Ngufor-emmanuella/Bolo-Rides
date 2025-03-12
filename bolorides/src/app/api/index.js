import admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}

const uid = '2Gohrr26ZgVLKFBm8CqpKf9BJy73'; // Replace with the UID of the user you want to set as admin

admin.auth().setCustomUserClaims(uid, { admin: true })
    .then(() => {
        console.log(`Custom claims set for user: ${uid}`);
    })
    .catch(error => {
        console.error('Error setting custom claims:', error);
    });