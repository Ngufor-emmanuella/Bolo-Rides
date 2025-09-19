import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

// Helper function to format numbers with commas
const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    const numberValue = Number(num); 
    if (isNaN(numberValue)) return 'N/A'; 
    return numberValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const AllDailyReports = ({ carId, userId }) => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const reportQuery = query(
                    collection(db, 'DailyReports'),
                    where('carId', '==', carId),
                    where('userId', '==', userId),
                    orderBy('createdAt', 'desc') // Fetch most recent reports first
                );
                
                const reportSnapshot = await getDocs(reportQuery);
                const reportList = reportSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Sorting by transactionDate in descending order (most recent first)
                reportList.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

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
                    <h3 className="text-lg font-semibold text-[#9b2f2b]">Daily Reports</h3>
                    {/* Display pending balance messages at the top */}
                    {reports.map(report => {
                        if (report.balanceAmount > 0 && report.paidAmount < report.amountDue) {
                            return (
                                <p key={report.id} className="text-red-500 mt-2">
                                    Transaction done on {report.transactionDate}. A balance amount of {formatNumber(report.balanceAmount)} is still pending. Please edit the values...
                                </p>
                            );
                        }
                        return null;
                    })}
                    <div className="overflow-x-auto">
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
                                    <th className="border border-gray-300 p-2">Expense Description</th>
                                    <th className="border border-gray-300 p-2">Comments</th>
                                    <th className="border border-gray-300 p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(report => (
                                    <tr key={report.id}>
                                        <td className="border border-gray-300 p-2">{report.transactionDate || 'N/A'}</td>
                                        <td className="border border-gray-300 p-2">{report.destination || 'N/A'}</td>
                                        <td className="border border-gray-300 p-2">{formatNumber(report.rentalRateAmount)}</td>
                                        <td className="border border-gray-300 p-2">{formatNumber(report.numberOfRentalDays)}</td>
                                        <td className="border border-gray-300 p-2">{formatNumber(report.amountDue)}</td>
                                        <td className="border border-gray-300 p-2">{formatNumber(report.paidAmount)}</td>
                                        <td className="border border-gray-300 p-2">{formatNumber(report.balanceAmount)}</td>
                                        <td className="border border-gray-300 p-2">{formatNumber(report.driverIncome)}</td>
                                        <td className="border border-gray-300 p-2">{formatNumber(report.carExpense)}</td>
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
                        <div className="h-2 bg-[#9b2f2b] rounded-b-md"></div>
                    </div>
                </div>
            ) : (
                <p>No reports found for this car.</p>
            )}
        </div>
    );
};

export default AllDailyReports;