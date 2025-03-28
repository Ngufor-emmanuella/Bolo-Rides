// src/app/components/AllDailyReports.jsx
import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

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
                    where('userId', '==', userId)
                );
                const reportSnapshot = await getDocs(reportQuery);
                const reportList = reportSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReports(reportList);
            } catch (error) {
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
                                    <td className="border border-gray-300 p-2">{report.transaction_date || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.destination || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.rental_rate_amount || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.number_of_rental_days || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.paid_amount || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.balance_amount || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.driver_income || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.car_expense || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.expense_description || 'N/A'}</td>
                                    <td className="border border-gray-300 p-2">{report.comments || 'N/A'}</td>

                                    <td className="border border-gray-300 p-2">
                                        <a
                                            href={`/dashboard/${userId}/edit-report?reportId=${report.id}&type=${report.driver_income ? 'expenses' : 'revenue'}`}
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