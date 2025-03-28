// src/app/dashboard/[uid]/edit-report/page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const EditReport = () => {
    const router = useRouter();
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');
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
        setReportData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reportData) return;

        try {
            await updateDoc(doc(db, 'DailyReports', reportId), reportData);
            router.push(`/dashboard/${reportData.userId}`); // Redirect to the user's dashboard
        } catch (e) {
            setError('Error updating report: ' + e.message);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <form onSubmit={handleSubmit}>
            <h2>Edit {reportType === 'revenue' ? 'Revenue' : 'Expense'} Report</h2>
            {reportType === 'revenue' && (
                <>
                    <label>Transaction Date:</label>
                    <input
                        type="date"
                        value={reportData.transaction_date}
                        onChange={(e) => handleChange('transaction_date', e.target.value)}
                        required
                    />
                    <label>Destination:</label>
                    <input
                        type="text"
                        value={reportData.destination}
                        onChange={(e) => handleChange('destination', e.target.value)}
                        required
                    />
                    <label>Rental Rate Amount:</label>
                    <input
                        type="number"
                        value={reportData.rental_rate_amount}
                        onChange={(e) => handleChange('rental_rate_amount', Number(e.target.value))}
                        required
                    />
                    <label>Number of Rental Days:</label>
                    <input
                        type="number"
                        value={reportData.number_of_rental_days}
                        onChange={(e) => handleChange('number_of_rental_days', Number(e.target.value))}
                        required
                    />
                    <label>Paid Amount:</label>
                    <input
                        type="number"
                        value={reportData.paid_amount}
                        onChange={(e) => handleChange('paid_amount', Number(e.target.value))}
                    />
                </>
            )}
            {reportType === 'expenses' && (
                <>
                    <label>Driver Income:</label>
                    <input
                        type="number"
                        value={reportData.driver_income}
                        onChange={(e) => handleChange('driver_income', Number(e.target.value))}
                    />
                    <label>Car Expense:</label>
                    <input
                        type="number"
                        value={reportData.car_expense}
                        onChange={(e) => handleChange('car_expense', Number(e.target.value))}
                    />
                    <label>Expense Description:</label>
                    <textarea
                        value={reportData.expense_description}
                        onChange={(e) => handleChange('expense_description', e.target.value)}
                    />
                    <label>Comments:</label>
                    <textarea
                        value={reportData.comments}
                        onChange={(e) => handleChange('comments', e.target.value)}
                    />
                </>
            )}
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Update Report</button>
        </form>
    );
};

export default EditReport;