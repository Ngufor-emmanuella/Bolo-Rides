import React from 'react';

const UserReports = ({ reports = [] }) => {
    // Helper function to format numbers with commas
    const formatNumber = (num) => {
        return num ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A';
    };

    if (reports.length === 0) return <p className="text-center text-gray-500">No reports found for this car.</p>;

    return (
        <div className="mt-4 overflow-x-auto">
            <h3 className="text-lg font-semibold">Daily Reports</h3>
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
                    {reports.map(report => (
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