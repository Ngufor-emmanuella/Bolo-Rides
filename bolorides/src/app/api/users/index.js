import { db } from '@/app/firebase'; 
import { collection, addDoc } from 'firebase/firestore';

export async function POST(req) {
    const { name, email, userId } = await req.json();
    try {
        await addDoc(collection(db, 'Users'), {
            name,
            email,
            userId,
        });
        return NextResponse.json({ message: 'User created' }, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}