'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/app/firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { useAuth } from '/context/AuthContext';
import { format } from 'date-fns';

const UserDashboard = () => {
    const [cars, setCars] = useState([]);
    const [dailyReports, setDailyReports] = useState([]);
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false); // State to manage sidebar visibility
    const [destination, setDestination] = useState('');
    const [rentalRate, setRentalRate] = useState(0);
    const [date, setDate] = useState('');
    const [showReports, setShowReports] = useState(false); // State to toggle reports table visibility
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                if (!currentUser) {
                    console.log("No current user found.");
                    return;
                }

                const userRef = doc(db, 'Users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setUserName(userData.name);

                    // Fetch daily reports for the user
                    const reportsCollection = collection(db, 'DailyReports');
                    const reportsQuery = query(reportsCollection, where("userId", "==", currentUser.uid));
                    const reportsSnapshot = await getDocs(reportsQuery);

                    if (reportsSnapshot.docs.length > 0) {
                        const reportsData = reportsSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                        }));
                        setDailyReports(reportsData);
                    } else {
                        console.log("No daily reports found.");
                        setDailyReports([]);
                    }

                    // Fetch cars for the user
                    const carsCollection = collection(db, 'Cars');
                    const carsQuery = query(carsCollection, where("userId", "==", currentUser.uid));
                    const carsSnapshot = await getDocs(carsQuery);

                    if (carsSnapshot.docs.length > 0) {
                        const carsData = carsSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                        }));
                        setCars(carsData);
                    } else {
                        console.log("No cars found for this user.");
                        setCars([]);
                    }
                } else {
                    console.log("User document does not exist.");
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!date || !destination || rentalRate <= 0) {
            alert("Please fill all fields correctly.");
            return;
        }
        
        try {
            await addDoc(collection(db, 'DailyReports'), {
                userId: currentUser.uid,
                carId: cars[0]?.id, // Assuming the user has at least one car
                date: new Date(date),
                destination,
                rentalRate,
                created_at: new Date(),
                // Add other fields as necessary
            });
            // Clear form
            setDestination('');
            setRentalRate(0);
            setDate('');
        } catch (error) {
            console.error('Error adding document: ', error);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen">
                <h1 className="text-2xl font-bold mb-5">Loading...</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Mobile Menu Button */}
            <button
                className="p-2 text-white bg-blue-600 md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? 'Hide Cars' : 'Show Cars'}
            </button>

            {/* Sidebar (Cars Table) */}
            <aside className={`bg-white shadow-md w-full md:w-64 p-4 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <h2 className="text-xl font-semibold mb-3">Your Cars Details</h2>
                <button
                    onClick={() => setShowReports(!showReports)}
                    className="mb-3 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                >
                    {showReports ? 'Close Your Daily Reports' : 'View Your Daily Reports'}
                </button>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-2 px-4 text-left">Car Model Name</th>
                                <th className="py-2 px-4 text-left">Creation Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cars.length > 0 ? (
                                cars.map(car => {
                                    const creationDate = car.created_at && typeof car.created_at.toDate === 'function'
                                        ? format(car.created_at.toDate(), 'yyyy-MM-dd HH:mm:ss')
                                        : 'N/A';

                                    return (
                                        <tr key={car.id} className="hover:bg-gray-100">
                                            <td className="py-2 px-4">{car.modelName || 'N/A'}</td>
                                            <td className="py-2 px-4">{creationDate}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={2} className="text-center py-2 px-4">No cars found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </aside>

            {/* Main Content (Daily Reports) */}
            <main className="flex-1 p-6 overflow-x-auto"> 
                <h1 className="text-2xl font-bold mb-5">Welcome {userName || 'User'} to Bolorides</h1>

                {/* Add Daily Report Form */}
                <div className="mb-4 p-4 border border-gray-300 rounded shadow-md">
                    <h2 className="text-xl font-semibold mb-3">Add Daily Report</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="border p-2 mb-2 w-full"
                        />
                        <input
                            type="text"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="Destination"
                            required
                            className="border p-2 mb-2 w-full"
                        />
                        <input
                            type="number"
                            value={rentalRate}
                            onChange={(e) => setRentalRate(e.target.value)}
                            placeholder="Rental Rate"
                            required
                            className="border p-2 mb-2 w-full"
                        />
                        <button type="submit" className="bg-blue-500 text-white p-2 w-full">Submit</button>
                    </form>
                </div>

                {/* Daily Reports Table */}
                {showReports && (
                    <>
                    <br></br>
                        <h2 className="text-xl font-semibold mb-3">Your Daily Reports</h2>
                        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="py-2 px-4 text-left">Date</th>
                                    <th className="py-2 px-4 text-left">Destination</th>
                                    <th className="py-2 px-4 text-left">Rental Rate Amount</th>
                                    <th className="py-2 px-4 text-left">Num of Rental Days</th>
                                    <th className="py-2 px-4 text-left">Paid Amount</th>
                                    <th className="py-2 px-4 text-left">Total Amount Due</th>
                                    <th className="py-2 px-4 text-left">Balance Amount Due</th>
                                    <th className="py-2 px-4 text-left">Car Expense</th>
                                    <th className="py-2 px-4 text-left">Total Expenses</th>
                                    <th className="py-2 px-4 text-left">Expenses Description</th>
                                    <th className="py-2 px-4 text-left">Driver&apos;s Income</th>
                                    <th className="py-2 px-4 text-left">Driver&apos;s Salary</th>
                                    <th className="py-2 px-4 text-left">Management Fee Acc</th>
                                    <th className="py-2 px-4 text-left">Net Income</th>
                                    <th className="py-2 px-4 text-left">Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyReports.length > 0 ? (
                                    dailyReports.map(report => (
                                        <tr key={report.id} className="hover:bg-gray-100">
                                            <td className="py-2 px-4">
                                                {report.date && report.date.toDate
                                                    ? format(report.date.toDate(), 'yyyy-MM-dd HH:mm:ss')
                                                    : 'N/A'}
                                            </td>
                                            <td className="py-2 px-4">{report.destination || 'N/A'}</td>
                                            <td className="py-2 px-4">${report.rentalRate || '0'}</td>
                                            <td className="py-2 px-4">{report.number_of_rental_days || '0'}</td>
                                            <td className="py-2 px-4">${report.paid_amount || '0'}</td>
                                            <td className="py-2 px-4">${report.total_amount_due || '0'}</td>
                                            <td className="py-2 px-4">${report.balance_amount_due || '0'}</td>
                                            <td className="py-2 px-4">${report.car_expense || '0'}</td>
                                            <td className="py-2 px-4">${report.total_expenses || '0'}</td>
                                            <td className="py-2 px-4">{report.expense_description || 'N/A'}</td>
                                            <td className="py-2 px-4">${report.driver_income || '0'}</td>
                                            <td className="py-2 px-4">${report.driver_salary || '0'}</td>
                                            <td className="py-2 px-4">${report.management_fee_accruals || '0'}</td>
                                            <td className="py-2 px-4">${report.net_income || '0'}</td>
                                            <td className="py-2 px-4">{report.comments || 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={15} className="text-center py-2 px-4">No daily reports found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </>
                )}
            </main>
        </div>
    );
};

export default UserDashboard;