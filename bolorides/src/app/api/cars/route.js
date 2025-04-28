import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { userId, userName, carName, carType } = await request.json();

        const carDoc = await addDoc(collection(db, 'Cars'), {
            userId,
            userName,
            carName,
            carType
        });

        return NextResponse.json({ carId: carDoc.id }, { status: 201 });
    } catch (error) {
        console.error('Error creating car:', error);
        return NextResponse.json({ error: 'Failed to create car' }, { status: 500 });
    }
}