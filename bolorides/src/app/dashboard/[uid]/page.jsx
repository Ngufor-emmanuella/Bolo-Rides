'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import CarList from './components/carsList';

const UserDashboard = () => {
    const router = useRouter();
    const [carName, setCarName] = useState('');
    const [carType, setCarType] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // New state for success message
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState('');
   
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUser(authUser);
                console.log("Authenticated User:", authUser);

                try {
                    const userDoc = await getDoc(doc(db, 'Users', authUser.uid));
                    if (userDoc.exists()) {
                        setUserName(userDoc.data().name);
                    } else {
                        console.warn("User document not found for UID:", authUser.uid);
                        setUserName(authUser.email);
                    }
                } catch (e) {
                    console.error("Error fetching user data:", e);
                    setError("Error fetching user data.");
                }
            } else {
                router.push('/Sign-in');
            }
        });

        return () => unsubscribe();
    }, [auth, router]);

    const handleAddCar = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(''); 

        if (!carName || !carType) {
            setError('Please enter all fields.');
            return;
        }

        if (!user) {
            setError('Not authenticated. Please sign in.');
            return;
        }

        if (!userName) {
            setError("User name is still loading. Please wait.");
            return;
        }

        try {
            const carQuery = query(
                collection(db, 'Cars'),
                where('userId', '==', user.uid),
                where('carName', '==', carName)
            );
            const carSnapshot = await getDocs(carQuery);

            if (!carSnapshot.empty) {
                setError('Car name already exists. Please select another car name.');
                return;
            }

            const carData = {
                userId: user.uid,
                userName: userName,
                carName,
                carType,
                created_at: new Date(),
            };

            const reportData = {
                userId: user.uid,
                userName: userName,
                carId: "",
                carName,
                created_at: new Date(),
            };

            console.log("Data being sent to Cars:", carData);
            console.log("Data being sent to DailyReports (before car creation):", reportData);

            const carDoc = await addDoc(collection(db, 'Cars'), carData);
            reportData.carId = carDoc.id;

            console.log("Data being sent to DailyReports (after car creation):", reportData);
            await addDoc(collection(db, 'DailyReports'), reportData);

            setSuccess('Car and Daily Report added successfully!');
            setCarName('');
            setCarType('');
        } catch (error) {
            console.error('Error adding car or daily report:', error);
            setError('Error: ' + error.message);
        }
    };

    return (
        <div>
            <h1>Welcome, {userName || user?.email}!</h1>
            <form onSubmit={handleAddCar}>
                <input
                    type="text"
                    placeholder="Car Name"
                    value={carName}
                    onChange={(e) => setCarName(e.target.value)}
                    required
                    className="border p-2 mb-2"
                />
                <input
                    type="text"
                    placeholder="Car Type"
                    value={carType}
                    onChange={(e) => setCarType(e.target.value)}
                    required
                    className="border p-2 mb-2"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Car</button>
            </form>
            {success && <p className="text-green-500 mt-2">{success}</p>}
            {error && <p className="text-red-500 mt-2">{error}</p>}

            {/* display cars owned by a user */}
            {user &&
                <CarList userId={user.uid} userName={userName} />

            }

            {/* daily*/}

        </div>
    );
};

export default UserDashboard;