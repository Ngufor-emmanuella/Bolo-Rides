'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const EditReport = () => {
    const router = useRouter();
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // State for success message
    const [loading, setLoading] = useState(true);

    const query = new URLSearchParams(window.location.search);
    const reportId = query.get('reportId');
    const reportType = query.get('type');

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const reportDoc = await getDoc(doc(db, 'DailyReports', reportId));
                if (reportDoc.exists()) {
                    setReportData({ id: reportDoc.id, ...reportDoc.data() });
                } else {
                    setError('Report not found.');
                }
            } catch (e) {
                setError('Error fetching report data: ' + e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [reportId]);

    const handleChange = (field, value) => {
        setReportData(prev => {
            const updatedData = { ...prev, [field]: value };
            if (reportType === 'revenue') {
                // Calculate Amount Due and Balance Amount for revenue
                const amountDue = updatedData.rentalRateAmount * updatedData.numberOfRentalDays;
                const balanceAmount = amountDue - (updatedData.paidAmount || 0);
                return { ...updatedData, amountDue, balanceAmount };
            }
            return updatedData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reportData) return;

        try {
            await updateDoc(doc(db, 'DailyReports', reportId), reportData);
            setSuccessMessage('Edited successfully!'); // Set success message
            setTimeout(() => {
                router.push(`/dashboard/${reportData.userId}`); // Redirect to the user's dashboard
            }, 5000); // Redirect after 5 seconds
        } catch (e) {
            setError('Error updating report: ' + e.message);
            setTimeout(() => {
                setError(''); // Clear error after 5 seconds
            }, 5000);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Edit {reportType === 'revenue' ? 'Revenue' : 'Expense'} Report</h2>
            {reportType === 'revenue' && (
                <>
                    <div>
                        <label className="block">Transaction Date:</label>
                        <input
                            type="date"
                            value={reportData.transactionDate || ''}
                            onChange={(e) => handleChange('transactionDate', e.target.value)}
                            required
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block">Destination:</label>
                        <input
                            type="text"
                            value={reportData.destination || ''}
                            onChange={(e) => handleChange('destination', e.target.value)}
                            required
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block">Rental Rate Amount:</label>
                        <input
                            type="number"
                            value={reportData.rentalRateAmount || ''}
                            onChange={(e) => handleChange('rentalRateAmount', Number(e.target.value))}
                            required
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block">Number of Rental Days:</label>
                        <input
                            type="number"
                            value={reportData.numberOfRentalDays || ''}
                            onChange={(e) => handleChange('numberOfRentalDays', Number(e.target.value))}
                            required
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block">Paid Amount:</label>
                        <input
                            type="number"
                            value={reportData.paidAmount || ''}
                            onChange={(e) => handleChange('paidAmount', Number(e.target.value))}
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block">Amount Due:</label>
                        <input
                            type="number"
                            value={reportData.amountDue || 0}
                            readOnly
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block">Balance Amount:</label>
                        <input
                            type="number"
                            value={reportData.balanceAmount || 0}
                            readOnly
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                </>
            )}
            {reportType === 'expenses' && (
                <>
                    <div>
                        <label className="block">Driver Income:</label>
                        <input
                            type="number"
                            value={reportData.driverIncome || ''}
                            onChange={(e) => handleChange('driverIncome', Number(e.target.value))}
                            className="border border-gray-300 p-2 rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block">Car Expense:</label>
                        <input
                            type="number"
                            value={reportData.carExpense || ''}
                            onChange={(e) => handleChange('carExpense', Number(e.target.value))}
                            className="border border-gray-300 p-2 rounded w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block">Expense Description:</label>
                        <textarea
                            value={reportData.expenseDescription || ''}
                            onChange={(e) => handleChange('expenseDescription', e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block">Comments:</label>
                        <textarea
                            value={reportData.comments || ''}
                            onChange={(e) => handleChange('comments', e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                </>
            )}
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Update Report</button>
            {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>} {/* Display success message */}
            {error && <p className="text-red-500 mt-4">{error}</p>} {/* Display error message */}
        </form>
    );
};

export default EditReport;