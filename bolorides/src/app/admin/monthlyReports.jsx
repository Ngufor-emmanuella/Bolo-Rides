'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const MonthlyReport = ({ carId, carName }) => {
    const [monthlyData, setMonthlyData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [showNoReportsMessage, setShowNoReportsMessage] = useState(false);
    const monthlyTargetGoal = 1000000;
    const DEFAULT_DRIVER_SALARY = 50000;

    console.log('Car Name:', carName); // Check carName prop

    // This useEffect will only fetch data for the current year initially
    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const reportsCollection = collection(db, 'DailyReports');
                const reportsQuery = query(reportsCollection, where('carId', '==', carId));
                const reportsSnapshot = await getDocs(reportsQuery);
                const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Filter reports for the current year by default
                const filteredReports = reports.filter(report => {
                    const reportYear = new Date(report.transactionDate).getFullYear();
                    return reportYear === year;
                });

                const aggregatedData = aggregateReportsByMonth(filteredReports);
                setMonthlyData(aggregatedData);

                // Show no reports message if none are found
                setShowNoReportsMessage(filteredReports.length === 0);
            } catch (err) {
                console.error('Error fetching reports:', err);
                setError('Failed to load reports.');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [carId, year]); // Only fetch when carId or year changes

    // Function to get the driver salary based on car name
    const getDriverSalary = (carName) => {
        return (typeof carName === 'string' && carName.trim() === 'Rav4') ? 0 : DEFAULT_DRIVER_SALARY; 
    };

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
                driverSalary: getDriverSalary(carName), // Set the driver salary correctly
                netIncome: 0,
            };
            console.log('Driver Salary for', carName, ':', monthlyAggregation[monthKey].driverSalary); 
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

            // Calculate total expenses
            const baseExpenses = monthData.totalDriverIncome + monthData.totalCarExpenses + monthData.managementFee;
            monthData.totalExpenses = baseExpenses + monthData.driverSalary; // Add driver salary

            const netInc = monthData.totalAmountDue - monthData.totalExpenses;

            // Set net income to 0 if the car name is Rav4 and net income is negative
            monthData.netIncome = (carName && carName.trim() === 'Rav4' && netInc < 0) ? 0 : netInc;
        }

        return monthlyAggregation;
    };

    const formatNumber = (num) => {
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleYearChange = (event) => {
        setYear(event.target.value);
        setShowNoReportsMessage(false); 
    };

    const handleFetchReports = async () => {
        setLoading(true);
        setShowNoReportsMessage(false);

        try {
            const reportsCollection = collection(db, 'DailyReports');
            const reportsQuery = query(reportsCollection, where('carId', '==', carId));
            const reportsSnapshot = await getDocs(reportsQuery);
            const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Filter reports for the specified year
            const filteredReports = reports.filter(report => {
                const reportYear = new Date(report.transactionDate).getFullYear();
                return reportYear === parseInt(year, 10);
            });

            const aggregatedData = aggregateReportsByMonth(filteredReports);
            setMonthlyData(aggregatedData);

            // Show no reports message if none are found
            setShowNoReportsMessage(filteredReports.length === 0);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError('Failed to load reports.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const totalYearlyRentals = Object.values(monthlyData).reduce((total, month) => total + (month.totalAmountDue || 0), 0);
    const percentageOfGoal = (totalYearlyRentals / monthlyTargetGoal) * 100;

    return (
        <div className="mt-4 p-4">
            <h3 className="text-lg font-semibold">Monthly Goals Reports for {year}</h3>
            <h5 className="mb-4">Monthly Target Goal: {formatNumber(monthlyTargetGoal)} CFA</h5>
            
            <input
                type="number"
                value={year}
                onChange={handleYearChange}
                placeholder="Enter Year (e.g., 2024)"
                className="border p-1 mb-4"
            />
            <button
                onClick={handleFetchReports}
                className="bg-blue-500 text-white p-2 rounded mb-4"
            >
                Fetch Reports
            </button>

            {showNoReportsMessage && (
                <p className="text-center text-red-500">No reports found for the year {year}.</p>
            )}

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
                                    <td className="border border-gray-300 p-2">{formatNumber(data.totalAmountDue || 0)}</td>
                                    <td className="border border-gray-300 p-2">{formatNumber(data.managementFee || 0)}</td>
                                    <td className="border border-gray-300 p-2">{formatNumber(data.totalDriverIncome || 0)}</td>
                                    <td className="border border-gray-300 p-2">{formatNumber(data.totalCarExpenses || 0)}</td>
                                    <td className="border border-gray-300 p-2">{formatNumber(data.totalPaidAmount || 0)}</td>
                                    <td className="border border-gray-300 p-2">{formatNumber(data.balanceAmountDue || 0)}</td>
                                    <td className="border border-gray-300 p-2">{formatNumber(data.netIncome || 0)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <h3 className="text-lg font-semibold mt-4">Total Yearly Rentals: {formatNumber(totalYearlyRentals)} CFA</h3>
            <h4 className="text-md">Percentage of Goal: {percentageOfGoal.toFixed(2)}%</h4>
            <br />
            <h4 className="text-md">Note for each Month;</h4>
            <h6>The values for total amount due is calculated and displayed.</h6>
            <h6>The Total management fee is 10% of the total amount due.</h6>
            <h6>The Balance amount due is the difference between the Total amount due and the Total paid amount</h6>
            <h6>The Net income is the difference between the Total amount due and the Total expenses, (including 50k salary, except for Rav4) </h6>
        </div>
    );
};

export default MonthlyReport;