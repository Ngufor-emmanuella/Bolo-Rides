'use client';
import { useState, useEffect } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signInWithEmailAndPassword, firebaseUser, loading, error] = useSignInWithEmailAndPassword(auth);
    const router = useRouter();


    useEffect(() => {
        const handleSignIn = async () => {

            if (firebaseUser) {

                const uid = firebaseUser.user.uid;
                const docRef = doc(db, 'Users', uid);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    // Create the user document if it doesn't exist
                    await setDoc(docRef, {
                        email: email,
                        role: 'user', // Default role
                        // You might want to add more initial user data here
                    });
                    console.log("User document created");
                }
                const docSnapAgain = await getDoc(docRef);
                const userData = docSnapAgain.data();

                if (!userData || !userData.role) {
                    console.error("User data or role is undefined");
                    return;
                }

                // Redirect based on role
                if (userData.role === 'admin') {
                    router.push('/dashboard/AdminDashboard');
                } else {
                    router.push(`/dashboard/${uid}`);
                }
            }
        };
        handleSignIn()
    }, [firebaseUser, router]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        await signInWithEmailAndPassword(email, password)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
                <h1 className="text-white text-2xl mb-5">Sign In</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
                    />
                    <button
                        type="submit"
                        className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignIn;
