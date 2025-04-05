'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { sumBy } from 'lodash';

const MonthlyReport = ({ carId }) => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentYear = new Date().getFullYear(); 
    const monthlyTargetGoal = 1000000;

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true); 
            try {
                const reportsCollection = collection(db, 'DailyReports');
                const reportsQuery = query(reportsCollection, where('carId', '==', carId));
                const reportsSnapshot = await getDocs(reportsQuery);
                const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const aggregatedData = aggregateReportsByMonth(reports);
                setMonthlyData(aggregatedData);
            } catch (err) {
                console.error('Error fetching reports:', err);
                setError('Failed to load reports.');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [carId]);

    const aggregateReportsByMonth = (reports) => {
        const monthlyAggregation = {};

        reports.forEach(report => {
            const date = new Date(report.transactionDate);
            const month = date.getMonth() + 1; 
            const year = date.getFullYear();
            const monthKey = `${year}-${month}`; 

            if (!monthlyAggregation[monthKey]) {
                monthlyAggregation[monthKey] = {
                    totalAmountDue: 0,
                    managementFee: 0,
                    totalDriverIncome: 0,
                    totalCarExpenses: 0,
                    totalPaidAmount: 0,
                    driverSalary: 50000,
                    netIncome: 0,
                };
            }

            monthlyAggregation[monthKey].totalAmountDue += report.amountDue || 0;
            monthlyAggregation[monthKey].totalDriverIncome += report.driverIncome || 0;
            monthlyAggregation[monthKey].totalCarExpenses += report.carExpense || 0;
            monthlyAggregation[monthKey].totalPaidAmount += report.paidAmount || 0;
        });

        // Calculate management fee, total expenses, and net income
        for (const monthKey in monthlyAggregation) {
            const monthData = monthlyAggregation[monthKey];
            monthData.managementFee = monthData.totalAmountDue * 0.10;
            monthData.totalExpenses = monthData.totalDriverIncome + monthData.totalCarExpenses + monthData.managementFee + monthData.driverSalary;
            monthData.netIncome = monthData.totalAmountDue - monthData.totalExpenses;
        }

        return monthlyAggregation;
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    // Calculate total yearly rentals
    const totalYearlyRentals = Object.values(monthlyData).reduce((total, month) => total + (month.totalAmountDue || 0), 0);
    const percentageOfGoal = (totalYearlyRentals / monthlyTargetGoal) * 100;

    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold">Monthly Goals Reports for {currentYear}</h3>
            <h5 className="mb-4">Monthly Target Goal: {monthlyTargetGoal.toLocaleString()} CFA</h5>
            <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                    <tr>
                       <th className="border border-gray-300 p-2">Month Num</th> 
                        <th className="border border-gray-300 p-2">Month</th>
                        <th className="border border-gray-300 p-2">Total Amount Due</th>
                        <th className="border border-gray-300 p-2">Management Fee</th>
                        <th className="border border-gray-300 p-2">Total Driver Income</th>
                        <th className="border border-gray-300 p-2">Total Car Expenses</th>
                        <th className="border border-gray-300 p-2">Total Paid Amount</th>
                        <th className="border border-gray-300 p-2">Net Income</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 12 }, (_, index) => {
                        const monthNum = index + 1; // Month number (1-12)
                        const monthKey = `${currentYear}-${monthNum}`; 
                        const data = monthlyData[monthKey] || {}; 

                        return (
                            <tr key={monthNum}>
                                 <td className="border border-gray-300 p-2">{monthNum}</td> 
                                <td className="border border-gray-300 p-2">
                                    {new Date(currentYear, index).toLocaleString('default', { month: 'long' })}
                                </td>
                               
                                <td className="border border-gray-300 p-2">{(data.totalAmountDue || 0).toFixed(2)}</td>
                                <td className="border border-gray-300 p-2">{(data.managementFee || 0).toFixed(2)}</td>
                                <td className="border border-gray-300 p-2">{(data.totalDriverIncome || 0).toFixed(2)}</td>
                                <td className="border border-gray-300 p-2">{(data.totalCarExpenses || 0).toFixed(2)}</td>
                                <td className="border border-gray-300 p-2">{(data.totalPaidAmount || 0).toFixed(2)}</td>
                                <td className="border border-gray-300 p-2">{(data.netIncome || 0).toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <h3 className="text-lg font-semibold mt-4">Total Yearly Rentals: {totalYearlyRentals.toFixed(2)} CFA</h3>
            <h4 className="text-md">Percentage of Goal: {percentageOfGoal.toFixed(2)}%</h4>
        </div>
    );
};

export default MonthlyReport;