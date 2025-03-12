import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

if (!getApps().length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    } catch (error) {
        console.error('Firebase Admin initialization error', error.stack);
    }
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { uid } = req.body;

        try {
            await admin.auth().setCustomUserClaims(uid, { admin: true });
            console.log(`Admin claim set successfully for user: ${uid}`);
            return res.status(200).json({ message: `Admin claim set for user ${uid}` });
        } catch (error) {
            console.error('Error setting custom claims:', error);
            return res.status(500).json({ error: 'Failed to set admin claim' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}