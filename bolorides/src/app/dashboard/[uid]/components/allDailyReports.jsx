import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

const AllDailyReports = ({ carId, userId }) => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                console.log("Fetching reports for Car ID:", carId, "User ID:", userId);
                
                const reportQuery = query(
                    collection(db, 'DailyReports'),
                    where('carId', '==', carId),
                    where('userId', '==', userId),
                    orderBy('transactionDate', 'desc') // Ensure your Firestore documents have a 'transactionDate' field
                );
                
                const reportSnapshot = await getDocs(reportQuery);
                
                // Check if any reports were fetched
                if (reportSnapshot.empty) {
                    console.log("No reports found for this car and user.");
                } else {
                    console.log("Reports fetched:", reportSnapshot.docs.length);
                }

                const reportList = reportSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReports(reportList);
            } catch (error) {
                console.error('Error fetching reports:', error);
                setError('Error fetching reports: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        if (carId) {
            fetchReports();
        }
    }, [carId, userId]);

    if (loading) return <p>Loading reports...</p>;

    return (
        <div className="mt-4">
            {error && <p className="text-red-500">{error}</p>}
            {reports.length > 0 ? (
                <div>
                    <h3 className="text-lg font-semibold">Daily Reports</h3>
                    <table className="min-w-full border-collapse border border-gray-200">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 p-2">Transaction Date</th>
                                <th className="border border-gray-300 p-2">Destination</th>
                                <th className="border border-gray-300 p-2">Rental Rate Amount</th>
                                <th className="border border-gray-300 p-2">Number of Rental Days</th>
                                <th className="border border-gray-300 p-2">Amount Due</th>
                                <th className="border border-gray-300 p-2">Paid Amount</th>
                                <th className="border border-gray-300 p-2">Balance Amount</th>
                                <th className="border border-gray-300 p-2">Driver Income</th>
                                <th className="border border-gray-300 p-2">Car Expenses</th>
                                <th className="border border-gray-300 p-2">Expenses Description</th>
                                <th className="border border-gray-300 p-2">Comments</th>
                                <th className="border border-gray-300 p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <tr key={report.id}>
                                    <td className="border border-gray-300 p-2">{report.transactionDate || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.destination || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.rentalRateAmount || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.numberOfRentalDays || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.amountDue || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.paidAmount || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.balanceAmount || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.driverIncome || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.carExpense || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.expenseDescription || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.comments || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">
                                        <a
                                            href={`/dashboard/${userId}/edit-report?reportId=${report.id}&type=${report.driverIncome ? 'expenses' : 'revenue'}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-yellow-500 text-white p-1 rounded"
                                        >
                                            Edit
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No reports found for this car.</p>
            )}
        </div>
    );
};

export default AllDailyReports;