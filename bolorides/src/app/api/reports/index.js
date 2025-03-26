import { db } from '@/app/firebase'; 
import { collection, addDoc } from 'firebase/firestore';

export async function POST(req, res) {
    const { userId, userName, carId, carName, carType } = await req.json();

    try {
        await addDoc(collection(db, 'DailyReports'), {
            userId,
            userName,
            carId,
            carName,
            carType
        });

        return res.status(201).json({ message: 'Daily report created' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create daily report' });
    }
}