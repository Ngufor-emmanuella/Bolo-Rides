'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/app/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '/context/AuthContext';

const UserDashboard = () => {
    const [cars, setCars] = useState([]);
    const [dailyReports, setDailyReports] = useState([]); // State for daily reports
    const [userName, setUserName] = useState('');
    const router = useRouter();
    const [uid, setUid] = useState(null); // Local state for UID
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (router.isReady) {
            const { uid: routerUid } = router.query; // Get UID from router
            setUid(routerUid); // Set UID in local state
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        if (uid && currentUser) {
            const fetchUserData = async () => {
                setLoading(true); 
                try {
                    const userRef = doc(db, 'Users', currentUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        setUserName(userData.name);

                        // Fetch cars directly from the user document if they are DocumentReferences
                        if (userData.cars && userData.cars.length > 0) {
                            const carsData = await Promise.all(userData.cars.map(async (carRef) => {
                                const carSnap = await getDoc(carRef);
                                return { id: carSnap.id, ...carSnap.data() };
                            }));
                            setCars(carsData);
                        } else {
                            // Fetch cars from the "Cars" collection if not using DocumentReferences
                            const carsCollection = collection(db, 'Cars');
                            const q = query(carsCollection, where("userId", "==", currentUser.uid));
                            const querySnapshot = await getDocs(q);
                            const carsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                            setCars(carsData);
                        }

                        // Fetch daily reports for the user
                        const reportsCollection = collection(db, 'DailyReports');
                        const reportsQuery = query(reportsCollection, where("userId", "==", currentUser.uid));
                        const reportsSnapshot = await getDocs(reportsQuery);
                        const reportsData = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        setDailyReports(reportsData);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false); // End loading
                }
            };
            fetchUserData();
        }
    }, [uid, currentUser]);

    if (loading) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen">
                <h1 className="text-2xl font-bold mb-5">Loading...</h1>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-5">Welcome {userName} to Bolorides</h1>
            
            {/* Cars Table */}
            <h2 className="text-xl font-semibold mb-3">Your Cars</h2>
            <div className="overflow-x-auto mb-5">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="py-2 px-4 text-left">Destination</th>
                            <th className="py-2 px-4 text-left">Rental Rate</th>
                            <th className="py-2 px-4 text-left">Rental Days</th>
                            <th className="py-2 px-4 text-left">Driver Salary</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cars.length > 0 ? (
                            cars.map(car => (
                                <tr key={car.id} className="hover:bg-gray-100">
                                    <td className="py-2 px-4">{car.destination}</td>
                                    <td className="py-2 px-4">${car.rental_rate_amount}</td>
                                    <td className="py-2 px-4">{car.number_of_rental_days}</td>
                                    <td className="py-2 px-4">${car.driver_salary}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-2 px-4">No cars found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Daily Reports Table */}
            <h2 className="text-xl font-semibold mb-3">Your Daily Reports</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="py-2 px-4 text-left">Date</th>
                            <th className="py-2 px-4 text-left">Destination</th>
                            <th className="py-2 px-4 text-left">Balance Due</th>
                            <th className="py-2 px-4 text-left">Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dailyReports.length > 0 ? (
                            dailyReports.map(report => (
                                <tr key={report.id} className="hover:bg-gray-100">
                                    <td className="py-2 px-4">{report.date}</td>
                                    <td className="py-2 px-4">{report.destination}</td>
                                    <td className="py-2 px-4">${report.balance_amount_due}</td>
                                    <td className="py-2 px-4">{report.comments}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-2 px-4">No daily reports found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserDashboard;