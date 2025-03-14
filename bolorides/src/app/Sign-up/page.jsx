'use client';
import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection } from 'firebase/firestore';
import { createUserWithEmailAndPassword, onAuthStateChanged, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth, db } from '@/app/firebase';
import { useRouter } from 'next/navigation';

const SignUpPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // State to hold error messages
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push('/dashboard/' + user.uid);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(''); // Reset error message

        try {
            // Check if the email already exists
            const signInMethods = await fetchSignInMethodsForEmail(auth, email);
            if (signInMethods.length > 0) {
                setError('The email you entered is already associated with an account. Please use a different email address.'); // Custom error message
                return; // Stop the sign-up process
            }
    
            // Create user with email and password
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const user = res.user;
    
            if (user) {
                // Create user document in Users collection
                const userDocRef = doc(db, 'Users', user.uid);
                await setDoc(userDocRef, {
                    name: name,
                    email: user.email,
                    role: 'user',
                    created_at: new Date(),
                });
    
                // Create a car document for the user
                const carDocRef = doc(collection(db, 'Cars')); 
                await setDoc(carDocRef, {
                    userId: user.uid,
                    userName: name,
                    modelName: "",
                    created_at: new Date(),
                });
    
                // Create a daily report document for the user 
                const reportDocRef = doc(collection(db, 'DailyReports'));
                await setDoc(reportDocRef, {
                    carId: carDocRef.id, 
                    userId: user.uid,
                    userName: name,
                    date: new Date(),
                    destination: "",
                    balance_amount_due: 0,
                    car_expense: 0,
                    driver_income: 0,
                    driver_salary: 0,
                    expense_description: "",
                    management_fee_accruals: 0,
                    net_income: 0,
                    number_of_rental_days: 1,
                    paid_amount: 0,
                    rental_rate_amount: 0,
                    total_amount_due: 0,
                    total_expenses: 0,
                    comments: "",
                });
    
                console.log("User, car, and daily report documents created");
                // Redirect to dashboard
                router.push('/dashboard/' + user.uid);
            }
        } catch (error) {
            console.error('Error signing up:', error);
            setError('Error signing up: ' + error.message); 
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
                <h1 className="text-white text-2xl mb-5">Sign Up</h1>
                {error && <p className="text-red-500">{error}</p>} 
                <form onSubmit={handleSignUp}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
                    />
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
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;