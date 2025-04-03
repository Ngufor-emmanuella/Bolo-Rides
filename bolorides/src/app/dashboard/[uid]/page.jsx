'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import TransactionForm from './components/TransactionForm'; 
import AllDailyReports from './components/AllDailyReports'; 

const UserDashboard = () => {
    const router = useRouter();
    const [carName, setCarName] = useState('');
    const [carType, setCarType] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState('');
    const [cars, setCars] = useState([]);
    const [activeCarId, setActiveCarId] = useState(null);
    const [showAddCarForm, setShowAddCarForm] = useState(false);
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [showDailyReports, setShowDailyReports] = useState(false);
    const [transactions, setTransactions] = useState([{ type: 'revenue', data: {} }]);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUser(authUser);
                try {
                    const userDoc = await getDoc(doc(db, 'Users', authUser.uid));
                    if (userDoc.exists()) {
                        setUserName(userDoc.data().name);
                    } else {
                        console.warn("User document not found for UID:", authUser.uid);
                        setUserName(authUser.email);
                    }
                    const carQuery = query(collection(db, 'Cars'), where('userId', '==', authUser.uid));
                    const carSnapshot = await getDocs(carQuery);
                    const carList = carSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setCars(carList);
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
        setLoadingMessage('Adding car, hold on...');

        if (!carName || !carType) {
            setError('Please enter all fields.');
            return;
        }

        // Check for duplicate car name
        const existingCar = cars.find(car => car.carName.toLowerCase() === carName.toLowerCase());
        if (existingCar) {
            setError('Failed to add car, please choose another car name.');
            setLoadingMessage('');
            setTimeout(() => setError(''), 5000);
            return;
        }

        try {
            const carData = {
                userId: user.uid,
                userName: userName,
                carName,
                carType,
                created_at: new Date(),
            };

            await addDoc(collection(db, 'Cars'), carData);
            setSuccess(`${carName} added successfully!`);
            setCarName('');
            setCarType('');
            const carQuery = query(collection(db, 'Cars'), where('userId', '==', user.uid));
            const carSnapshot = await getDocs(carQuery);
            const carList = carSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCars(carList);
        } catch (error) {
            console.error('Error adding car:', error);
            setError('Failed to add car name successfully.');
        } finally {
            setLoadingMessage('');
            setTimeout(() => {
                setSuccess('');
                setError('');
            }, 5000);
        }
    };

    const handleCarSelect = (car) => {
        setActiveCarId(car.id);
        setShowTransactionForm(false);
        setShowDailyReports(false);
        setTransactions([{ type: 'revenue', data: {} }]);
    };

    const handleAddTransaction = () => {
        setTransactions([...transactions, { type: 'revenue', data: {} }]);
    };

    const handleTransactionChange = (index, field, value) => {
        const updatedTransactions = [...transactions];
        if (field === 'type') {
            updatedTransactions[index].type = value; 
        } else {
            updatedTransactions[index].data[field] = value; 
        }
        setTransactions(updatedTransactions); 
    };

    const handleRemoveTransaction = (index) => {
        const updatedTransactions = transactions.filter((_, i) => i !== index);
        setTransactions(updatedTransactions);
    };

    // Define the handleAddReport function
    const handleAddReport = async (transaction, index) => {
        setLoadingMessage('Processing, please wait...');
        try {
            const reportData = {
                ...transaction.data,
                userId: user.uid,
                carId: activeCarId,
                createdAt: new Date(),
            };

            await addDoc(collection(db, 'DailyReports'), reportData);
            setTransactions(transactions.filter((_, i) => i !== index)); 
            setSuccess('Report submitted successfully!');
        } catch (error) {
            console.error('Error adding report:', error.message);
            setError('Error adding report: ' + error.message);
        } finally {
            setLoadingMessage('');
            setTimeout(() => {
                setSuccess('');
                setError('');
            }, 5000);
        }
    };

    return (
        <div className="flex">
            {/* Aside Navigation */}
            <aside className="w-1/4 p-4 bg-gray-100">
                <h2 className="text-xl font-bold">My Cars</h2>
                <ul>
                    {cars.map(car => (
                        <li key={car.id} className="my-2">
                            <button
                                className={`text-left w-full p-2 rounded ${activeCarId === car.id ? 'bg-[#9b2f2f] text-white' : 'bg-blue-500 text-white'}`}
                                onClick={() => handleCarSelect(car)}
                            >
                                {car.carName}
                            </button>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={() => setShowAddCarForm(!showAddCarForm)}
                    className="mt-4 bg-green-500 text-white p-2 rounded"
                >
                    {showAddCarForm ? 'Cancel' : 'Add Car'}
                </button>
                {showAddCarForm && (
                    <form onSubmit={handleAddCar} className="mt-2">
                        <input
                            type="text"
                            placeholder="Car Name"
                            value={carName}
                            onChange={(e) => setCarName(e.target.value)}
                            required
                            className="border p-2 mb-2 w-full"
                        />
                        <input
                            type="text"
                            placeholder="Car Type"
                            value={carType}
                            onChange={(e) => setCarType(e.target.value)}
                            required
                            className="border p-2 mb-2 w-full"
                        />
                        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Submit</button>
                        {loadingMessage && <p className="mt-2 text-yellow-500">{loadingMessage}</p>}
                        {success && <p className="mt-2 text-green-500">{success}</p>}
                        {error && <p className="mt-2 text-red-500">{error}</p>}
                    </form>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4">
                <h1 className="text-2xl mb-4">Welcome, {userName || user?.email}!</h1>

                {activeCarId && (
                    <div>
                        <h2 className="text-xl mb-4">Actions for Selected Car: {cars.find(car => car.id === activeCarId)?.carName}</h2>
                        <button
                            onClick={() => setShowTransactionForm(!showTransactionForm)}
                            className="bg-blue-500 text-white p-2 rounded mr-2"
                        >
                            {showTransactionForm ? 'Hide Add Daily Report' : 'Add Daily Report'}
                        </button>
                        <button
                            onClick={() => setShowDailyReports(!showDailyReports)}
                            className="bg-green-500 text-white p-2 rounded"
                        >
                            {showDailyReports ? 'Hide All Transactions' : 'View All Transactions'}
                        </button>

                        {showTransactionForm && (
                            <TransactionForm 
                                transactions={transactions} 
                                handleAddReport={handleAddReport} 
                                handleTransactionChange={handleTransactionChange}
                                handleRemoveTransaction={handleRemoveTransaction}
                                handleAddTransaction={handleAddTransaction}
                            />
                        )}
                        {showDailyReports && (
                            <AllDailyReports carId={activeCarId} userId={user.uid} />
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserDashboard;