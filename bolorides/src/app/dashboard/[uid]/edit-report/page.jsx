'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';

// Safe number formatting
const formatNumber = (num) => {
  if (num === null || num === undefined) return '';
  return Number(num).toLocaleString();
};

// Field configuration
const fieldConfigs = {
  revenue: [
    { name: 'transactionDate', label: 'Transaction Date', type: 'date' },
    { name: 'destination', label: 'Destination', type: 'text' },
    { name: 'rentalRateAmount', label: 'Rental Rate Amount', type: 'number' },
    { name: 'numberOfRentalDays', label: 'Number of Rental Days', type: 'number' },
    { name: 'paidAmount', label: 'Paid Amount', type: 'number' },
    { name: 'amountDue', label: 'Amount Due', type: 'number', readOnly: true },
    { name: 'balanceAmount', label: 'Balance Amount', type: 'number', readOnly: true },
  ],
  expenses: [
    { name: 'transactionDate', label: 'Transaction Date', type: 'date' },
    { name: 'driverIncome', label: 'Driver Income', type: 'number' },
    { name: 'carExpense', label: 'Car Expense', type: 'number' },
    { name: 'expenseDescription', label: 'Expense Description', type: 'textarea' },
    { name: 'comments', label: 'Comments', type: 'textarea' },
  ],
};

const EditReport = () => {
  const router = useRouter();
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [captchaToken, setCaptchaToken] = useState('');

  const query = new URLSearchParams(window.location.search);
  const reportId = query.get('reportId');
  const reportType = query.get('type'); // revenue or expenses
  const userId = query.get('userId');

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const reportDoc = await getDoc(doc(db, 'DailyReports', reportId));
        if (!reportDoc.exists()) {
          setError('Report not found.');
          setLoading(false);
          return;
        }
        const data = reportDoc.data();

        // Normalize all fields to avoid undefined/null
        const normalizedData = {};
        fieldConfigs[reportType].forEach(f => {
          if (f.type === 'number') normalizedData[f.name] = data[f.name] || 0;
          else normalizedData[f.name] = data[f.name] || '';
        });

        setReportData({ id: reportDoc.id, ...normalizedData });
      } catch (e) {
        setError('Error fetching report data: ' + e.message);
      } finally {
        setLoading(false);
      }
    };
    if (reportId) fetchReportData();
  }, [reportId, reportType]);

  // Handle input change
  const handleChange = (field, value, type) => {
    if (type === 'number' && value < 0) {
      setError('Negative numbers are not supported.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setReportData(prev => {
      const updatedData = { ...prev, [field]: type === 'number' ? Number(value) : value };

      // Calculate amountDue & balance for revenue
      if (reportType === 'revenue') {
        const rentalRateAmount = Number(updatedData.rentalRateAmount) || 0;
        const numberOfRentalDays = Number(updatedData.numberOfRentalDays) || 0;
        const paidAmount = Number(updatedData.paidAmount) || 0;
        updatedData.amountDue = rentalRateAmount * numberOfRentalDays;
        updatedData.balanceAmount = Math.max(0, updatedData.amountDue - paidAmount);
      }

      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportData) return;

    if (reportType === 'revenue' && reportData.paidAmount > reportData.amountDue) {
      setError('Paid amount exceeds amount due.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!captchaToken) {
      setError('Please complete the reCAPTCHA.');
      return;
    }

    try {
      setSuccessMessage('Processing...');
      await updateDoc(doc(db, 'DailyReports', reportId), reportData);
      setSuccessMessage('Report updated successfully!');
      setTimeout(() => router.push(`/dashboard/${userId}?carId=${reportData.carId}`), 2000);
    } catch (e) {
      setError('Failed to update report: ' + e.message);
    }
  };

  if (loading) return <p className="text-center py-8">Loading...</p>;
  if (!reportData) return <p className="text-center text-red-500">No data found.</p>;

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-lg space-y-4 max-w-2xl mx-auto mt-20 lg:mt-20">
      <h2 className="text-2xl font-bold text-center text-[#9b2f2b]">
        Edit {reportType === 'revenue' ? 'Revenue' : 'Expenses'} Report
      </h2>

      {fieldConfigs[reportType].map(field => (
        <div key={field.name}>
          <label className="block font-semibold">{field.label}:</label>

          {field.type === 'textarea' ? (
            <textarea
              value={reportData[field.name]}
              onChange={e => handleChange(field.name, e.target.value, field.type)}
              className="border p-2 rounded w-full"
            />
          ) : (
            <input
              type={field.type === 'number' ? 'text' : field.type}
              value={field.type === 'number' ? formatNumber(reportData[field.name]) : reportData[field.name]}
              onChange={e => handleChange(field.name, e.target.value.replace(/,/g, ''), field.type)}
              readOnly={field.readOnly}
              required={!field.readOnly}
              className={`border p-2 rounded w-full ${field.readOnly ? 'bg-gray-100' : ''}`}
            />
          )}
        </div>
      ))}

      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}
        onChange={setCaptchaToken}
      />

      <div className="flex justify-center mt-4">
        <button
          type="submit"
          className="bg-[#9b2f2b] text-white font-semibold p-3 rounded-lg w-1/2"
        >
          Update Report
        </button>
      </div>

      {successMessage && <p className="text-green-600 text-center mt-3">{successMessage}</p>}
      {error && <p className="text-red-500 text-center mt-3">{error}</p>}
    </form>
  );
};

export default EditReport;
