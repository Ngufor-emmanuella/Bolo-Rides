'use client';
import { useState, useEffect } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signInWithEmailAndPassword, firebaseUser, loading, error] = useSignInWithEmailAndPassword(auth);
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const handleSignIn = async () => {
            if (firebaseUser) {
                const uid = firebaseUser.user.uid;
                const docRef = doc(db, 'Users', uid);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    setErrorMessage('Account does not exist. Please create an account.');
                } else {
                    const userData = docSnap.data();
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
            }
        };
        handleSignIn();
    }, [firebaseUser, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear previous error messages

        // Validate input
        if (!email || !password) {
            setErrorMessage('Please enter both email and password.');
            return;
        }

        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        try {
            await signInWithEmailAndPassword(email, password);
        } catch (signInError) {
            console.error('Error signing in:', signInError);
            if (signInError.code === 'auth/user-not-found') {
                setErrorMessage('This account does not exist. Please create an account.');
            } else if (signInError.code === 'auth/wrong-password') {
                setErrorMessage('Incorrect password. Please try again.');
            } else {
                setErrorMessage('An error occurred: ' + signInError.message);
            }
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
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
                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 font-bold px-4 py-3 rounded mt-4 relative" role="alert">
                        <span className="block sm:inline">{errorMessage} <a href="/Sign-up" className="text-blue-500 hover:underline">Create an account</a></span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignIn;