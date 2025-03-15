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
    const [dynamicFields, setDynamicFields] = useState([
        {
            date: '',
            destination: '',
            rentalRate: 0,
            numOfRentalDays: 0,
            paidAmount: 0,
            driverIncome: 0,
            expense: 0,
            expenseDescription: '',
            comments: '',
        },
    ]);
    const [showReports, setShowReports] = useState(false); // State to toggle reports table visibility
    const [formType, setFormType] = useState('revenue'); // State to toggle form type
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

                    const reportsData = reportsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setDailyReports(reportsData);

                    // Fetch cars for the user
                    const carsCollection = collection(db, 'Cars');
                    const carsQuery = query(carsCollection, where("userId", "==", currentUser.uid));
                    const carsSnapshot = await getDocs(carsQuery);

                    const carsData = carsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setCars(carsData);
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

    const addField = () => {
        setDynamicFields([
            ...dynamicFields,
            {
                date: '',
                destination: '',
                rentalRate: 0,
                numOfRentalDays: 0,
                paidAmount: 0,
                driverIncome: 0,
                expense: 0,
                expenseDescription: '',
                comments: '',
            },
        ]);
    };

    const removeField = (index) => {
        const data = [...dynamicFields];
        data.splice(index, 1);
        setDynamicFields(data);
    };

    const updateField = (index, fieldName, value) => {
        const data = [...dynamicFields];
        data[index][fieldName] = value;
        setDynamicFields(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formType === 'revenue') {
            // Validate revenue form fields
            for (const field of dynamicFields) {
                if (
                    !field.date ||
                    !field.destination ||
                    field.rentalRate <= 0 ||
                    field.numOfRentalDays <= 0 ||
                    field.paidAmount <= 0 ||
                    field.driverIncome <= 0
                ) {
                    alert("Please fill all revenue fields correctly.");
                    return;
                }
            }
        } else {
            // Validate expense form fields
            for (const field of dynamicFields) {
                if (field.expense <= 0 || !field.expenseDescription) {
                    alert("Please fill all expense fields correctly.");
                    return;
                }
            }
        }

        try {
            const reportData = {
                userId: currentUser.uid,
                carId: cars[0]?.id, // Assuming the user has at least one car
                created_at: new Date(),
                entries: dynamicFields.map((field) => {
                    if (formType === 'revenue') {
                        return {
                            date: new Date(field.date),
                            destination: field.destination,
                            rentalRate: field.rentalRate,
                            number_of_rental_days: field.numOfRentalDays,
                            paid_amount: field.paidAmount,
                            driver_income: field.driverIncome,
                        };
                    } else {
                        return {
                            expense: field.expense,
                            expense_description: field.expenseDescription,
                            comments: field.comments,
                        };
                    }
                }),
            };

            await addDoc(collection(db, 'DailyReports'), reportData);

            // Clear form
            setDynamicFields([
                {
                    date: '',
                    destination: '',
                    rentalRate: 0,
                    numOfRentalDays: 0,
                    paidAmount: 0,
                    driverIncome: 0,
                    expense: 0,
                    expenseDescription: '',
                    comments: '',
                },
            ]);
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
            <aside className={`aside-background shadow-md w-full md:w-64 p-4 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <h2 className="text-xl font-semibold mb-3">Your Cars Details</h2>
                <button
                    onClick={() => setShowReports(!showReports)}
                    className="aside-btn mb-3 py-2 px-4 text-white rounded hover:bg-gray-600 w-full"
                >
                    {showReports ? 'Close Your Daily Reports' : 'View Your Daily Reports'}
                </button>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead className="aside-table">
                            <tr>
                                <th className="aside-values py-2 px-3 text-left">Car Model Name</th>
                                <th className="aside-values py-2 px-2 text-left">Creation Date</th>
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

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-x-auto">
                <h1 className="dashboard-head text-2xl font-bold mb-5">Welcome &quot; {userName || 'User'} &quot; to Bolorides</h1>
                <br />

                {/* Conditional Rendering for Add Daily Report Form and Daily Reports Table */}
                {!showReports ? (
                    <div className="flex items-center justify-center">
                        <div className="report-box mb-4 p-5 border border-gray-300 rounded shadow-md">
                            <h2 className="reporting text-xl font-semibold mb-3">Add Daily Report</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4 flex items-center">
                                    <label className="mr-5 flex items-center">
                                        <input
                                            type="radio"
                                            value="revenue"
                                            checked={formType === 'revenue'}
                                            onChange={() => setFormType('revenue')}
                                            className="mr-2 accent-[#9b2f2f]" // Change accent color for radio button
                                        />
                                        Revenue
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="expenses"
                                            checked={formType === 'expenses'}
                                            onChange={() => setFormType('expenses')}
                                            className="mr-2 accent-[#9b2f2f]" // Change accent color for radio button
                                        />
                                        Car Expenses
                                    </label>
                                </div>

                                {dynamicFields.map((field, index) => (
                                    <div key={index}>
                                        {formType === 'revenue' && (
                                            <>
                                                <label>Date:</label>
                                                <input
                                                    type="date"
                                                    value={field.date}
                                                    onChange={(e) =>
                                                        updateField(index, 'date', e.target.value)
                                                    }
                                                    required
                                                    className="border p-2 mb-2 w-full"
                                                />
                                                <label>Destination:</label>
                                                <input
                                                    type="text"
                                                    value={field.destination}
                                                    onChange={(e) =>
                                                        updateField(index, 'destination', e.target.value)
                                                    }
                                                    placeholder="Destination"
                                                    required
                                                    className="border p-2 mb-2 w-full"
                                                />
                                                <label>Rental Rate Amount:</label>
                                                <input
                                                    type="number"
                                                    value={field.rentalRate}
                                                    onChange={(e) =>
                                                        updateField(index, 'rentalRate', e.target.value)
                                                    }
                                                    placeholder="Rental Rate Amount"
                                                    required
                                                    className="border p-2 mb-2 w-full"
                                                />
                                                <label>Num of Rental Days:</label>
                                                <input
                                                    type="number"
                                                    value={field.numOfRentalDays}
                                                    onChange={(e) =>
                                                        updateField(index, 'numOfRentalDays', e.target.value)
                                                    }
                                                    placeholder="Num of Rental Days"
                                                    required
                                                    className="border p-2 mb-2 w-full"
                                                />
                                                <label>Paid Amount:</label>
                                                <input
                                                    type="number"
                                                    value={field.paidAmount}
                                                    onChange={(e) =>
                                                        updateField(index, 'paidAmount', e.target.value)
                                                    }
                                                    placeholder="Paid Amount"
                                                    required
                                                    className="border p-2 mb-2 w-full"
                                                />
                                                <label>Driver Income:</label>
                                                <input
                                                    type="number"
                                                    value={field.driverIncome}
                                                    onChange={(e) =>
                                                        updateField(index, 'driverIncome', e.target.value)
                                                    }
                                                    placeholder="Driver Income:"
                                                    required
                                                    className="border p-2 mb-2 w-full"
                                                />
                                            </>
                                        )}
                                        {formType === 'expenses' && (
                                            <>
                                                <label>Expense Amount:</label>
                                                <input
                                                    type="number"
                                                    value={field.expense}
                                                    onChange={(e) =>
                                                        updateField(index, 'expense', e.target.value)
                                                    }
                                                    placeholder="Expense Amount"
                                                    required
                                                    className="border p-2 mb-2 w-full"
                                                />
                                                <label>Expense Description:</label>
                                                <input
                                                    type="text"
                                                    value={field.expenseDescription}
                                                    onChange={(e) =>
                                                        updateField(index, 'expenseDescription', e.target.value)
                                                    }
                                                    placeholder="Expense Description"
                                                    required
                                                    className="border p-2 mb-2 w-full"
                                                />
                                                <label>Comments:</label>
                                                <input
                                                    type="text"
                                                    value={field.comments}
                                                    onChange={(e) =>
                                                        updateField(index, 'comments', e.target.value)
                                                    }
                                                    placeholder="Comments"
                                                    className="border p-2 mb-2 w-full"
                                                />
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeField(index)}
                                            className="remove-btn"
                                        >
                                            Remove Entry
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addField}
                                    className="add-btn"
                                >
                                    Add More Fields
                                </button>
                                <button type="submit" className="dashboard-btn text-white p-2 w-full">
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="reporting text-xl font-semibold mb-3">Your Daily Reports</h2>
                        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                            <thead className="report-table">
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
                                    <th className="py-2 px-4 text-left">Driver's Income</th>
                                    <th className="py-2 px-4 text-left">Driver's Salary</th>
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
