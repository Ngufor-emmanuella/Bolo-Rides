import { db } from '@/app/firebase'; 
import { collection, getDocs, query, where } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const { email } = await req.json();
    const q = query(collection(db, 'Users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return NextResponse.json({ exists: false }, { status: 200 });
    } else {
        return NextResponse.json({ exists: true }, { status: 200 });
    }
}