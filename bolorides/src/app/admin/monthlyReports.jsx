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

  console.log("Car name prop received in MonthlyReport:", carName);

  
  const getDriverSalary = (carName) => {
    if (typeof carName !== 'string') return DEFAULT_DRIVER_SALARY;

    const normalized = carName.trim().toLowerCase();
    const salary = normalized.includes('rav4') ? 0 : DEFAULT_DRIVER_SALARY;

    console.log(`Driver salary for "${carName}": ${salary}`); // Log the driver salary

    return salary;
  };

  const parseDate = (dateField) => {
    if (!dateField) return null;
    if (dateField.toDate) return dateField.toDate(); // Firestore Timestamp
    return new Date(dateField); // string/Date
  };

  const aggregateReportsByMonth = (reports) => {
    const monthlyAggregation = {};

    // Pre-fill all 12 months with defaults
    for (let month = 1; month <= 12; month++) {
      const monthKey = `${year}-${month}`;
      monthlyAggregation[monthKey] = {
        totalAmountDue: 0,
        managementFee: 0,
        totalDriverIncome: 0,
        totalCarExpenses: 0,
        totalPaidAmount: 0,
        driverSalary: getDriverSalary(carName),
        netIncome: 0,
        totalExpenses: 0,
        balanceAmountDue: 0,
      };
    }

    reports.forEach((report) => {
      const date = parseDate(report.transactionDate);
      if (!date) return;
      const reportYear = date.getFullYear();
      if (reportYear !== year) return;

      const month = date.getMonth() + 1;
      const monthKey = `${year}-${month}`;
      const monthData = monthlyAggregation[monthKey];
      if (!monthData) return;

      monthData.totalAmountDue += report.amountDue || 0;
      monthData.totalDriverIncome += report.driverIncome || 0;
      monthData.totalCarExpenses += report.carExpense || 0;
      monthData.totalPaidAmount += report.paidAmount || 0;
    });

    // Final calculations
    for (const monthKey in monthlyAggregation) {
      const monthData = monthlyAggregation[monthKey];
      
      monthData.driverSalary = getDriverSalary(carName); // Recalculate and log salary again
      console.log(`Updated driver salary for ${monthKey}: ${monthData.driverSalary}`); // Log updated salary

      monthData.managementFee = monthData.totalAmountDue * 0.1;
      monthData.balanceAmountDue = monthData.totalAmountDue - monthData.totalPaidAmount;

      const baseExpenses =
        monthData.totalDriverIncome +
        monthData.totalCarExpenses +
        monthData.managementFee;

      monthData.totalExpenses = baseExpenses + monthData.driverSalary;
      monthData.netIncome = monthData.totalAmountDue - monthData.totalExpenses;

      console.log(`Net income for ${monthKey}: ${monthData.netIncome}`); // Log net income for each month
    }

    return monthlyAggregation;
  };

  const fetchReports = async () => {
    setLoading(true);
    setShowNoReportsMessage(false);
    try {
      const reportsCollection = collection(db, 'DailyReports');
      const reportsQuery = query(reportsCollection, where('carId', '==', carId));
      const reportsSnapshot = await getDocs(reportsQuery);
      const reports = reportsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredReports = reports.filter((report) => {
        const date = parseDate(report.transactionDate);
        if (!date) return false;
        return date.getFullYear() === year;
      });

      const aggregatedData = aggregateReportsByMonth(filteredReports);
      setMonthlyData(aggregatedData);
      setShowNoReportsMessage(filteredReports.length === 0);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [carId, year]);

  const formatNumber = (num) => {
    const safeNum = num || 0;
    return safeNum.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleYearChange = (event) => {
    setYear(parseInt(event.target.value, 10));
    setShowNoReportsMessage(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const totalYearlyRentals = Object.values(monthlyData).reduce(
    (total, month) => total + (month.totalAmountDue || 0),
    0
  );
  const percentageOfGoal = (totalYearlyRentals / monthlyTargetGoal) * 100;

  return (
    <div className="mt-4 p-4">
      <h3 className="text-lg font-semibold">
        Monthly Goals Reports for {year}
      </h3>
      <h5 className="mb-4">
        Monthly Target Goal: {formatNumber(monthlyTargetGoal)} CFA
      </h5>

      <input
        type="number"
        value={year}
        onChange={handleYearChange}
        placeholder="Enter Year (e.g., 2024)"
        className="border p-1 mb-4"
      />
      <button
        onClick={fetchReports}
        className="bg-blue-500 text-white p-2 rounded mb-4"
      >
        Fetch Reports
      </button>

      {showNoReportsMessage && (
        <p className="text-center text-red-500">
          No reports found for the year {year}.
        </p>
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
                'Net Income',
              ].map((header) => (
                <th key={header} className="border border-gray-300 p-2">
                  {header}
                </th>
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
                    {new Date(year, index).toLocaleString('default', {
                      month: 'long',
                    })}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {formatNumber(data.totalAmountDue)}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {formatNumber(data.managementFee)}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {formatNumber(data.totalDriverIncome)}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {formatNumber(data.totalCarExpenses)}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {formatNumber(data.totalPaidAmount)}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {formatNumber(data.balanceAmountDue)}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {formatNumber(data.netIncome)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold mt-4">
        Total Yearly Rentals: {formatNumber(totalYearlyRentals)} CFA
      </h3>
      <h4 className="text-md">
        Percentage of Goal: {percentageOfGoal.toFixed(2)}%
      </h4>
      <br />
      <h4 className="text-md">Note for each Month;</h4>

      <ul style={{ listStyleType: 'disc', padding: 0, margin: 0 }}>
        <li style={{ marginBottom: '10px' }}>
          The values for total amount due is calculated and displayed.
        </li>
        <li style={{ marginBottom: '10px' }}>
          The Total management fee is 10% of the total amount due.
        </li>
        <li style={{ marginBottom: '10px' }}>
          The Balance amount due is the difference between the Total amount due and the Total paid amount.
        </li>
        <li style={{ marginBottom: '10px' }}>
          The Net income is the difference between the Total amount due and the Total expenses, (including 50k salary, except for Rav4 whose salary is 0).
        </li>
      </ul>
    
      <br/>
    </div>
  );
};

export default MonthlyReport;