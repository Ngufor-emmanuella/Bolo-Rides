'use client';

import React, { useEffect, useState } from 'react';
import { db, storage } from '../../firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import TransactionForm from './components/transactionForm';
import AllDailyReports from './components/allDailyReports';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Driver dashboard
const UserDashboard = () => {
    const router = useRouter();
    const [carName, setCarName] = useState('');
    const [carType, setCarType] = useState('');
    const [images, setImages] = useState([null, null, null]);
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
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userRole, setUserRole] = useState('');

    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUser(authUser);
                try {
                    const userDoc = await getDoc(doc(db, 'Users', authUser.uid));
                    if (userDoc.exists()) {
                        setUserName(userDoc.data().name);
                        setUserRole(userDoc.data().role);
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

        // Check if all fields are filled
        if (!carName || !carType) {
            setError('Please fill all fields and upload three images.');
            return;
        }

        try {
            if (!user) {
                throw new Error("User is not authenticated.");
            }           

            const carData = {
                userId: user.uid,
                userName: userName,
                carName,
                carType,
                images: [],
                created_at: new Date(),
            };

              // Upload images if any are provided
            const imageUrls = await Promise.all(
                images.map(async (image) => {
                    if (image) {
                        const storageRef = ref(storage, `car-images/${user.uid}/${Date.now()}-${image.name}`);
                        await uploadBytes(storageRef, image);
                        return getDownloadURL(storageRef);
                    }
                    return null; // Return null for missing images
                })
            );

            // Only add non-null URLs to carData.images
            carData.images = imageUrls.filter(url => url !== null);

            await addDoc(collection(db, 'Cars'), carData);
            setSuccess(`${carName} added successfully!`);
            setCarName('');
            setCarType('');
            setImages([null, null, null]);
            const carQuery = query(collection(db, 'Cars'), where('userId', '==', user.uid));
            const carSnapshot = await getDocs(carQuery);
            const carList = carSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCars(carList);
        } catch (error) {
            console.error('Error adding car:', error);
            setError(`Failed to add car name successfully: ${error.message}`);
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
        setSidebarOpen(false);
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

    const handleAddReport = async (reportData) => {
        setLoadingMessage('Processing, please wait...');
        try {
            await addDoc(collection(db, 'DailyReports'), reportData);
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
        <div>
            <header className="flex justify-center items-center p-4">
                <h1 className="text-2xl text-center mt-5">Welcome, {userName || user?.email}!</h1>
                <button
                    className="md:hidden p-2 mt-5 text-white bg-[#9b2f2b] rounded z-50 ml-4"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? 'X' : '☰'}
                </button>
            </header>

            <div className="flex flex-col md:flex-row">

                {/* Aside Navigation */}
                <aside className={`fixed inset-y-0 left-0 w-3/4 md:w-1/4 bg-gray-100 p-4 pt-23 md:pt-4 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:translate-x-0 md:static md:w-1/4 md:h-full`}>
                    <h2 className="text-xl font-bold">My Cars...</h2>
                    <ul>
                        {cars.map(car => (
                            <li key={car.id} className="my-2">
                                <button
                                    className={`text-left w-full p-2 rounded ${activeCarId === car.id ? 'bg-[#9b2f2b] text-white' : 'bg-blue-500 text-white'}`}
                                    onClick={() => handleCarSelect(car)}
                                >
                                    {car.carName}
                                </button>
                            </li>
                        ))}

                        {/* Button to access admin dashboard */}
                        {userRole === 'admin' || userRole === 'supreme' ? (
                            <button
                            onClick={() => router.push(`/admin?userId=${encodeURIComponent(user.uid)}`)}
                                className="mt-4 bg-red-500 text-white p-2 rounded"
                            >
                                Go to Admin Dashboard
                            </button>
                        ) : null}
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
                            {/* Image Uploads of car  */}
                            {/* <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(0, e)}
                               
                                className="border p-2 mb-2 w-full"
                            /> */}
                            {/* <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(1, e)}
                              
                                className="border p-2 mb-2 w-full"
                            /> */}
                            {/* <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(2, e)}
                               
                                className="border p-2 mb-2 w-full"
                            /> */}


                            <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Submit</button>
                            {loadingMessage && <p className="mt-2 text-yellow-500">{loadingMessage}</p>}
                            {success && <p className="mt-2 text-green-500">{success}</p>}
                            {error && <p className="mt-2 text-red-500">{error}</p>}
                        </form>
                    )}
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:pl-4">
                    {activeCarId && (
                        <div>
                            <h2 className="text-xl mb-4">Actions for Selected Car: {cars.find(car => car.id === activeCarId)?.carName}</h2>
                            <button
                                onClick={() => setShowTransactionForm(!showTransactionForm)}
                                className="bg-blue-500 text-white p-2 rounded mr-2"
                            >
                                {showTransactionForm ? 'Hide Transactions' : 'Add Transactions'}
                            </button>

                            <button
                                onClick={() => setShowDailyReports(!showDailyReports)}
                                className="bg-green-500 text-white p-2 rounded"
                            >
                                {showDailyReports ? 'Hide All Transactions' : 'Show All Transactions'}
                            </button>

                            {showTransactionForm && (
                                <TransactionForm
                                    transactions={transactions}
                                    handleAddReport={handleAddReport}
                                    handleTransactionChange={handleTransactionChange}
                                    handleRemoveTransaction={handleRemoveTransaction}
                                    handleAddTransaction={handleAddTransaction}
                                    carId={activeCarId}
                                    carName={cars.find(car => car.id === activeCarId)?.carName}
                                    userId={user.uid}
                                    userName={userName}
                                />
                            )}
                            {showDailyReports && (
                                <AllDailyReports carId={activeCarId} userId={user.uid} />
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UserDashboard;