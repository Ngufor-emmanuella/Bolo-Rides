import React, { useState, useEffect } from 'react';

const UserReports = ({ reports = [] }) => {
    // Helper function to format numbers with commas
    const formatNumber = (num) => {
        return num ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A';
    };

    const [filterYear, setFilterYear] = useState(new Date().getFullYear()); // Default to current year
    const [filteredReports, setFilteredReports] = useState([]);
    const [showNoReportsMessage, setShowNoReportsMessage] = useState(false); // State for showing no reports message

    // Effect to filter reports whenever the reports or filterYear changes
    useEffect(() => {
        fetchReportsForYear(filterYear);
    }, [reports, filterYear]);

    // Handle year input change
    const handleYearChange = (event) => {
        setFilterYear(event.target.value);
    };

    // Fetch reports based on the entered year
    const fetchReportsForYear = (year) => {
        const yearReports = reports.filter(report => {
            const reportDate = new Date(report.transactionDate);
            return reportDate.getFullYear() === parseInt(year, 10);
        });

        // Sort reports by transaction date in descending order
        const sortedReports = yearReports.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
        setFilteredReports(sortedReports);

        // Show or hide the no reports message
        setShowNoReportsMessage(sortedReports.length === 0 && year !== new Date().getFullYear().toString());
    };

    return (
        <div className="mt-4 overflow-x-auto">
            <input
                type="number"
                value={filterYear}
                onChange={handleYearChange}
                placeholder="Enter Year (e.g., 2024)"
                className="border p-1 mb-4"
            />
            <button
                onClick={() => fetchReportsForYear(filterYear)}
                className="bg-blue-500 text-white p-2 rounded mb-4"
            >
                Fetch Reports
            </button>

            <h3 className="text-lg font-semibold">Daily Reports for: {filterYear}</h3>
           
            {showNoReportsMessage && (
                <p className="text-center text-red-500">No reports found for the year {filterYear}.</p>
            )}

            <table className="min-w-full border-collapse border border-gray-200">
                <thead>
                    <tr>
                        {[
                            'Transaction Date',
                            'Destination',
                            'Rental Rate Amount',
                            'Number of Rental Days',
                            'Amount Due',
                            'Paid Amount',
                            'Balance Amount',
                            'Driver Income',
                            'Car Expenses',
                            'Expense Description',
                            'Comments'
                        ].map((header) => (
                            <th key={header} className="border border-gray-300 p-2 text-left">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {filteredReports.map(report => (
                        <tr key={report.id}>
                            <td className="border border-gray-300 p-2">{report.transactionDate || 'N/A'}</td>
                            <td className="border border-gray-300 p-2">{report.destination || 'N/A'}</td>
                            <td className="border border-gray-300 p-2">{formatNumber(report.rentalRateAmount)}</td>
                            <td className="border border-gray-300 p-2">{formatNumber(report.numberOfRentalDays)}</td>
                            <td className="border border-gray-300 p-2">{formatNumber(report.amountDue)}</td>
                            <td className="border border-gray-300 p-2">{formatNumber(report.paidAmount)}</td>
                            <td className="border border-gray-300 p-2">{formatNumber(report.balanceAmount)}</td>
                            <td className="border border-gray-300 p-2">{formatNumber(report.driverIncome)}</td>
                            <td className="border border-gray-300 p-2">{formatNumber(report.carExpense)}</td>
                            <td className="border border-gray-300 p-2">{report.expenseDescription || 'N/A'}</td>
                            <td className="border border-gray-300 p-2">{report.comments || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserReports;