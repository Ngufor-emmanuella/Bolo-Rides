// src/app/components/TransactionForm.jsx
import React from 'react';

const TransactionForm = ({ transactions, handleAddReport, handleTransactionChange, handleAddTransaction }) => {
    return (
        <div>
            {transactions.map((transaction, index) => (
                <div key={index} className="mb-4">
                    <div className="flex items-center mb-4">
                        <label className="mr-4">
                            <input
                                type="radio"
                                value="revenue"
                                checked={transaction.type === 'revenue'}
                                onChange={() => handleTransactionChange(index, 'revenue')}
                            />
                            Revenue
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="expenses"
                                checked={transaction.type === 'expenses'}
                                onChange={() => handleTransactionChange(index, 'expenses')}
                            />
                            Expenses
                        </label>
                    </div>
                    {transaction.type === 'revenue' && (
                        <form onSubmit={(e) => { e.preventDefault(); handleAddReport(transaction); }} className="flex flex-col space-y-4">
                            <label>Transaction date:</label>
                            <input
                                type="date"
                                value={transaction.data.transactionDate || ''}
                                onChange={(e) => handleTransactionChange(index, 'transactionDate', e.target.value)}
                                required
                                className="border p-2 rounded"
                            />
                            <label>Destination:</label>
                            <input
                                type="text"
                                placeholder="Destination"
                                value={transaction.data.destination || ''}
                                onChange={(e) => handleTransactionChange(index, 'destination', e.target.value)}
                                required
                                className="border p-2 rounded"
                            />
                            <label>Rental rate amount:</label>
                            <input
                                type="number"
                                placeholder="Rental Rate Amount"
                                value={transaction.data.rentalRateAmount || 0}
                                onChange={(e) => handleTransactionChange(index, 'rentalRateAmount', Number(e.target.value))}
                                required
                                min="0"
                                className="border p-2 rounded"
                            />
                            <label>Num of rental days:</label>
                            <input
                                type="number"
                                placeholder="Number of Rental Days"
                                value={transaction.data.numberOfRentalDays || 1}
                                onChange={(e) => handleTransactionChange(index, 'numberOfRentalDays', Number(e.target.value))}
                                required
                                min="1"
                                className="border p-2 rounded"
                            />
                            <label>Paid amount:</label>
                            <input
                                type="number"
                                placeholder="Paid Amount"
                                value={transaction.data.paidAmount || 0}
                                onChange={(e) => handleTransactionChange(index, 'paidAmount', Number(e.target.value))}
                                className="border p-2 rounded"
                            />
                            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit Daily Report</button>
                        </form>
                    )}
                    {transaction.type === 'expenses' && (
                        <form onSubmit={(e) => { e.preventDefault(); handleAddReport(transaction); }} className="flex flex-col space-y-4">
                            <label>Driver Income:</label>
                            <input
                                type="number"
                                placeholder="Driver Income"
                                value={transaction.data.driverIncome || 0}
                                onChange={(e) => handleTransactionChange(index, 'driverIncome', Number(e.target.value))}
                                className="border p-2 rounded"
                            />
                            <label>Car Expense:</label>
                            <input
                                type="number"
                                placeholder="Car Expense"
                                value={transaction.data.carExpense || 0}
                                onChange={(e) => handleTransactionChange(index, 'carExpense', Number(e.target.value))}
                                className="border p-2 rounded"
                            />
                            <label>Expense Description:</label>
                            <textarea
                                placeholder="Expense Description"
                                value={transaction.data.expenseDescription || ''}
                                onChange={(e) => handleTransactionChange(index, 'expenseDescription', e.target.value)}
                                className="border p-2 rounded"
                            />
                            <label>Comments:</label>
                            <textarea
                                placeholder="Comments"
                                value={transaction.data.comments || ''}
                                onChange={(e) => handleTransactionChange(index, 'comments', e.target.value)}
                                className="border p-2 rounded"
                            />
                            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit Expense Report</button>
                        </form>
                    )}
                </div>
            ))}
            <button onClick={handleAddTransaction} className="bg-blue-500 text-white p-2 rounded mt-4">Add Another Transaction</button>
        </div>
    );
};

export default TransactionForm;