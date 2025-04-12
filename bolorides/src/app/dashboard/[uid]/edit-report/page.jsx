'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// Helper function to format numbers with commas
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const EditReport = () => {
    const router = useRouter();
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const query = new URLSearchParams(window.location.search);
    const reportId = query.get('reportId');
    const reportType = query.get('type');
    const userId = query.get('userId');

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const reportDoc = await getDoc(doc(db, 'DailyReports', reportId));
                if (reportDoc.exists()) {
                    setReportData({ id: reportDoc.id, ...reportDoc.data() });
                } else {
                    setError('Report not found.');
                    setTimeout(() => setError(''), 3000);
                }
            } catch (e) {
                setError('Error fetching report data: ' + e.message);
                setTimeout(() => setError(''), 3000);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [reportId]);

    const handleChange = (field, value) => {
        if (value < 0) {
            setError('Invalid value; negative numbers are not supported.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setReportData(prev => {
            const updatedData = { ...prev, [field]: value };
            if (reportType === 'revenue') {
                const amountDue = updatedData.rentalRateAmount * updatedData.numberOfRentalDays;
                const balanceAmount = amountDue - (updatedData.paidAmount || 0);
                return { ...updatedData, amountDue, balanceAmount };
            }
            return updatedData;
        });
    };

    const handleInputChange = (field, value) => {
        const numericValue = value.replace(/[^0-9]/g, ''); // Allow only digits
        handleChange(field, numericValue ? Number(numericValue) : '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reportData) return;

        if (reportType === 'revenue' && reportData.paidAmount > reportData.amountDue) {
            setError('Error: Paid amount exceeds amount due. Enter a valid amount.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        try {
            setSuccessMessage('Processing, hold on please...');
            await updateDoc(doc(db, 'DailyReports', reportId), reportData);
            setSuccessMessage('Form data successfully edited, thank you!');
            setTimeout(() => {
                router.push(`/dashboard/${userId}?carId=${reportData.carId}`);
            }, 3000);
        } catch (e) {
            setError('Failed to edit form data: ' + e.message);
            setTimeout(() => setError(''), 3000);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-[#9b2f2b] text-center">Edit {reportType === 'revenue' ? 'Revenue' : 'Expense'} Report</h2>
            <br />
            {reportType === 'revenue' && (
                <>
                    <div className="w-11/12 md:w-85% mx-auto">
                        <label className="block">Transaction Date:</label>
                        <input
                            type="date"
                            value={reportData.transactionDate || ''}
                            onChange={(e) => handleChange('transactionDate', e.target.value)}
                            required
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div className="w-11/12 md:w-85% mx-auto">
                        <label className="block">Destination:</label>
                        <input
                            type="text"
                            value={reportData.destination || ''}
                            onChange={(e) => handleChange('destination', e.target.value)}
                            required
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div className="w-11/12 md:w-85% mx-auto">
                        <label className="block">Rental Rate Amount:</label>
                        <input
                            type="text"
                            value={reportData.rentalRateAmount ? formatNumber(reportData.rentalRateAmount) : ''}
                            onChange={(e) => handleInputChange('rentalRateAmount', e.target.value)}
                            required
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div className="w-11/12 md:w-85% mx-auto">
                        <label className="block">Number of Rental Days:</label>
                        <input
                            type="text"
                            value={reportData.numberOfRentalDays ? formatNumber(reportData.numberOfRentalDays) : ''}
                            onChange={(e) => handleInputChange('numberOfRentalDays', e.target.value)}
                            required
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div className="w-11/12 md:w-85% mx-auto">
                        <label className="block">Paid Amount:</label>
                        <input
                            type="text"
                            value={reportData.paidAmount ? formatNumber(reportData.paidAmount) : ''}
                            onChange={(e) => handleInputChange('paidAmount', e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div className="w-11/12 md:w-85% mx-auto">
                        <label className="block">Amount Due:</label>
                        <input
                            type="text"
                            value={formatNumber(reportData.amountDue || 0)}
                            readOnly
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div className="w-11/12 md:w-85% mx-auto">
                        <label className="block">Balance Amount:</label>
                        <input
                            type="text"
                            value={formatNumber(reportData.balanceAmount || 0)}
                            readOnly
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                </>
            )}
            {reportType === 'expenses' && (
                <>
                    <div className="w-11/12 md:w-85% mx-auto">
                        <label className="block">Driver Income:</label>
                        <input
                            type="text"
                            value={reportData.driverIncome ? formatNumber(reportData.driverIncome) : ''}
                            onChange={(e) => handleInputChange('driverIncome', e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full"
                            required
                        />
                    </div>
                    <div className="w-11/12 md:w-85% mx-auto">
                        <label className="block">Car Expense:</label>
                        <input
                            type="text"
                            value={reportData.carExpense ? formatNumber(reportData.carExpense) : ''}
                            onChange={(e) => handleInputChange('carExpense', e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full"
                            required
                        />
                    </div>
                    <div className="w-11/12 md:w-85% mx-auto">
                        <label className="block">Expense Description:</label>
                        <textarea
                            value={reportData.expenseDescription || ''}
                            onChange={(e) => handleChange('expenseDescription', e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div className="w-11/12 md:w-85% mx-auto">
                        <label className="block">Comments:</label>
                        <textarea
                            value={reportData.comments || ''}
                            onChange={(e) => handleChange('comments', e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                </>
            )}
            <div className="flex justify-center">
                <button 
                    type="submit" 
                    className="bg-[#9b2f2b] text-white p-2 rounded w-1/2 md:w-auto"
                >
                    Update Report
                </button>
            </div>
            {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </form>
    );
};

export default EditReport;