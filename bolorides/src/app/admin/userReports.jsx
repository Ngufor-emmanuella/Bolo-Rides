// UserReports.jsx
import React from 'react';

const UserReports = ({ reports = [] }) => {
    if (reports.length === 0) return <p>No reports found for this car.</p>;

    return (
        <div className="mt-4">
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
                            <th key={header} className="border border-gray-300 p-2">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {reports.map(report => (
                        <tr key={report.id}>
                            <td className="border border-gray-300 p-2">{report.transactionDate || 'N/A'}</td>
                            <td className="border border-gray-300 p-2">{report.destination || 'N/A'}</td>
                            <td className="border border-gray-300 p-2">{report.rentalRateAmount || 'N/A'}</td>
                            <td className="border border-gray-300 p-2">{report.numberOfRentalDays || 'N/A'}</td>
                            <td className="border border-gray-300 p-2">{report.amountDue || 'N/A'}</td>
                            <td className="border border-gray-300 p-2">{report.paidAmount || 'N/A'}</td>
                            <td className="border border-gray-300 p-2">{report.balanceAmount || 'N/A'}</td>
                            <td className="border border-gray-300 p-2">{report.driverIncome || 'N/A'}</td>
                            <td className="border border-gray-300 p-2">{report.carExpense || 'N/A'}</td>
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