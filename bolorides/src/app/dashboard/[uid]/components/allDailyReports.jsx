// src/app/components/DailyReports.jsx
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
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <tr key={report.id}>
                                    <td className="border border-gray-300 p-2">{report.transaction_date}</td>
                                    <td className="border border-gray-300 p-2">{report.destination}</td>
                                    <td className="border border-gray-300 p-2">{report.rental_rate_amount}</td>
                                    <td className="border border-gray-300 p-2">{report.number_of_rental_days}</td>
                                    <td className="border border-gray-300 p-2">{report.paid_amount}</td>
                                    <td className="border border-gray-300 p-2">{report.balance_amount}</td>
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