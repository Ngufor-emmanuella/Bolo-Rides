'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const MonthlyReport = ({ carId, year }) => {
    const [monthlyData, setMonthlyData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const monthlyTargetGoal = 1000000;

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true); 
            try {
                const reportsCollection = collection(db, 'DailyReports');
                const reportsQuery = query(reportsCollection, where('carId', '==', carId));
                const reportsSnapshot = await getDocs(reportsQuery);
                const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Filter reports for the specified year
                const filteredReports = reports.filter(report => {
                    const reportYear = new Date(report.transactionDate).getFullYear();
                    return reportYear === year;
                });

                const aggregatedData = aggregateReportsByMonth(filteredReports);
                setMonthlyData(aggregatedData);
            } catch (err) {
                console.error('Error fetching reports:', err);
                setError('Failed to load reports.');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [carId, year]);

    const aggregateReportsByMonth = (reports) => {
        const monthlyAggregation = {};

        for (let month = 1; month <= 12; month++) {
            const monthKey = `${year}-${month}`;
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

        reports.forEach(report => {
            const date = new Date(report.transactionDate);
            const month = date.getMonth() + 1; 
            const monthKey = `${year}-${month}`; 

            monthlyAggregation[monthKey].totalAmountDue += report.amountDue || 0;
            monthlyAggregation[monthKey].totalDriverIncome += report.driverIncome || 0;
            monthlyAggregation[monthKey].totalCarExpenses += report.carExpense || 0;
            monthlyAggregation[monthKey].totalPaidAmount += report.paidAmount || 0;
        });

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

    const totalYearlyRentals = Object.values(monthlyData).reduce((total, month) => total + (month.totalAmountDue || 0), 0);
    const percentageOfGoal = (totalYearlyRentals / monthlyTargetGoal) * 100;

    return (
        <div className="mt-4 p-4">
            <h3 className="text-lg font-semibold">Monthly Goals Reports for {year}</h3>
            <h5 className="mb-4">Monthly Target Goal: {monthlyTargetGoal.toLocaleString()} CFA</h5>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                    <thead>
                        <tr>
                            {[
                                'Month Num',
                                'Month',
                                'Total Amount Due',
                                'Total Management Fee',
                                'Total Driver Income',
                                'Total Car Expenses',
                                'Total Paid Amount',
                                'Balance Amount Due',
                                'Net Income'
                            ].map((header) => (
                                <th key={header} className="border border-gray-300 p-2">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 12 }, (_, index) => {
                            const monthNum = index + 1; 
                            const monthKey = `${year}-${monthNum}`; 
                            const data = monthlyData[monthKey] || {}; 

                            return (
                                <tr key={monthNum}>
                                    <td className="border border-gray-300 p-2">{monthNum}</td> 
                                    <td className="border border-gray-300 p-2">
                                        {new Date(year, index).toLocaleString('default', { month: 'long' })}
                                    </td>
                                    <td className="border border-gray-300 p-2">{(data.totalAmountDue || 0).toFixed(2)}</td>
                                    <td className="border border-gray-300 p-2">{(data.managementFee || 0).toFixed(2)}</td>
                                    <td className="border border-gray-300 p-2">{(data.totalDriverIncome || 0).toFixed(2)}</td>
                                    <td className="border border-gray-300 p-2">{(data.totalCarExpenses || 0).toFixed(2)}</td>
                                    <td className="border border-gray-300 p-2">{(data.totalPaidAmount || 0).toFixed(2)}</td>
                                    <td className="border border-gray-300 p-2">{(data.balanceAmountDue || 0).toFixed(2)}</td>
                                    <td className="border border-gray-300 p-2">{(data.netIncome || 0).toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <h3 className="text-lg font-semibold mt-4">Total Yearly Rentals: {totalYearlyRentals.toFixed(2)} CFA</h3>
            <h4 className="text-md">Percentage of Goal: {percentageOfGoal.toFixed(2)}%</h4>
        </div>
    );
};

export default MonthlyReport;