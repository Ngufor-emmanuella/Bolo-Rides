'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '@/app/firebase';
import { db } from '@/app/firebase'; // Import Firestore
import { setDoc, doc } from 'firebase/firestore';

const SignUpPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        // Check if password and confirm password match
        if (password !== confirmPassword) {
            setError('Passwords do not match. Please check the passwords.');
            return;
        }

        try {
            // Check if the email already exists
            const signInMethods = await fetchSignInMethodsForEmail(auth, email);
            if (signInMethods.length > 0) {
                setError('Email already exists. Please choose another email.');
                return;
            }

            // Create user using Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user data in Firestore directly using setDoc with user.uid as document ID
            await setDoc(doc(db, 'Users', user.uid), {
                name,
                email,
                created_at: new Date(), // Timestamp
                role: 'user', // Role field
            });

            // Redirect to the user's dashboard
            router.push(`/dashboard/${user.uid}`); // Redirecting to the dashboard using the User ID
        } catch (error) {
            console.error('Error signing up:', error);
            setError('Error signing up: ' + error.message);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="signup p-10 rounded-lg shadow-xl w-96">
                <h1 className="text-2xl mb-5">Sign Up</h1>
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleSignUp}>
                    <label>UserName :</label>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
                        required
                    />
                    <label>Email :</label>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
                        required
                    />
                    <label>Password :</label>
                    <div className="relative mb-4">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-3 text-white"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'See'}
                        </button>
                    </div>
                    <label>Repeat Password :</label>
                    <div className="relative mb-4">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-3 text-white"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'See'}
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="submit-btn w-full p-3 rounded text-white"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;