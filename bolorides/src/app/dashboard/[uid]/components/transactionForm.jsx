import React, { useState } from 'react';

const TransactionForm = ({ transactions = [], handleAddReport, handleTransactionChange, handleRemoveTransaction, handleAddTransaction }) => {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateFields = (transaction) => {
        if (transaction.type === 'revenue') {
            const { rentalRateAmount, numberOfRentalDays, paidAmount } = transaction.data;
            const amountDue = rentalRateAmount * numberOfRentalDays;

            if (paidAmount > amountDue) {
                setMessage('Error: Paid amount exceeds amount due. Enter a valid amount.');
                return false;
            }
            if (rentalRateAmount < 0 || numberOfRentalDays < 0 || paidAmount < 0) {
                setMessage('Invalid value; negative numbers are not supported.');
                return false;
            }
            return transaction.data.transactionDate && transaction.data.destination && 
                   rentalRateAmount && numberOfRentalDays && paidAmount !== undefined;
        } else if (transaction.type === 'expenses') {
            return transaction.data.transactionDate && transaction.data.driverIncome &&
                   transaction.data.carExpense && transaction.data.expenseDescription && transaction.data.comments;
        }
        return false;
    };

    const handleSubmit = async (e, index) => {
        e.preventDefault();
    
        if (isSubmitting) return;
    
        const transaction = transactions[index];
    
        if (!validateFields(transaction)) {
            setTimeout(() => setMessage(''), 5000);
            return;
        }
    
        setIsSubmitting(true);
        setMessage('Processing, please wait...');
    
        try {
            await handleAddReport(transaction, index);
            setMessage('Report submitted successfully!');

            // Reset the form fields after successful submission
            const resetData = {
                transactionDate: '',
                destination: '',
                rentalRateAmount: '',
                numberOfRentalDays: '',
                paidAmount: '',
                driverIncome: '',
                carExpense: '',
                expenseDescription: '',
                comments: '',
            };
            handleTransactionChange(index, 'data', resetData); 
        } catch (error) {
            setMessage('Error adding report: ' + error.message);
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };
    
    return (
        <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg w-full max-w-2xl mx-auto">
            {transactions.map((transaction, index) => (
                <div key={index} className="mb-4 w-full">
                    
                    <br></br>
                    <div className="flex items-center mb-4">
                        <label className="mr-4">
                            <input
                                type="radio"
                                value="revenue"
                                checked={transaction.type === 'revenue'}
                                onChange={() => handleTransactionChange(index, 'type', 'revenue')}
                            />
                            Revenue
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="expenses"
                                checked={transaction.type === 'expenses'}
                                onChange={() => handleTransactionChange(index, 'type', 'expenses')}
                            />
                            Expenses
                        </label>
                        <button type="button" onClick={() => handleRemoveTransaction(index)} className="ml-2 bg-red-500 text-white p-1 rounded">
                            Remove
                        </button>
                    </div>
                    <form onSubmit={(e) => handleSubmit(e, index)} className="flex flex-col space-y-4 w-full md:w-3/4 lg:w-7/10 mx-auto">
                        {transaction.type === 'revenue' && (
                            <>
                                <label>Transaction Date:</label>
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
                                <label>Rental Rate Amount:</label>
                                <input
                                    type="number"
                                    placeholder="Rental Rate Amount"
                                    value={transaction.data.rentalRateAmount || ''}
                                    onChange={(e) => handleTransactionChange(index, 'rentalRateAmount', Math.max(0, Number(e.target.value)))}
                                    required
                                    min="0"
                                    className="border p-2 rounded"
                                />
                                <label>Number of Rental Days:</label>
                                <input
                                    type="number"
                                    placeholder="Number of Rental Days"
                                    value={transaction.data.numberOfRentalDays || ''}
                                    onChange={(e) => handleTransactionChange(index, 'numberOfRentalDays', Math.max(1, Number(e.target.value)))}
                                    required
                                    min="1"
                                    className="border p-2 rounded"
                                />
                                <label>Paid Amount:</label>
                                <input
                                    type="number"
                                    placeholder="Paid Amount"
                                    value={transaction.data.paidAmount || ''}
                                    onChange={(e) => handleTransactionChange(index, 'paidAmount', Math.max(0, Number(e.target.value)))}
                                    className="border p-2 rounded"
                                />
                                <label>Amount Due:</label>
                                <input
                                    type="number"
                                    value={transaction.data.rentalRateAmount * transaction.data.numberOfRentalDays || 0}
                                    readOnly
                                    className="border p-2 rounded"
                                />
                                <label>Balance Amount:</label>
                                <input
                                    type="number"
                                    value={Math.max(0, (transaction.data.rentalRateAmount * transaction.data.numberOfRentalDays || 0) - (transaction.data.paidAmount || 0))}
                                    readOnly
                                    className="border p-2 rounded"
                                />
                                <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={isSubmitting}>Submit Daily Report</button>
                            </>
                        )}
                        {transaction.type === 'expenses' && (
                            <>
                                <label>Transaction Date:</label>
                                <input
                                    type="date"
                                    value={transaction.data.transactionDate || ''}
                                    onChange={(e) => handleTransactionChange(index, 'transactionDate', e.target.value)}
                                    required
                                    className="border p-2 rounded"
                                />
                                <label>Driver Income:</label>
                                <input
                                    type="number"
                                    placeholder="Driver Income"
                                    value={transaction.data.driverIncome || ''}
                                    onChange={(e) => handleTransactionChange(index, 'driverIncome', Math.max(0, Number(e.target.value)))}
                                    className="border p-2 rounded"
                                    required
                                />
                                <label>Car Expense:</label>
                                <input
                                    type="number"
                                    placeholder="Car Expense"
                                    value={transaction.data.carExpense || ''}
                                    onChange={(e) => handleTransactionChange(index, 'carExpense', Math.max(0, Number(e.target.value)))}
                                    className="border p-2 rounded"
                                    required
                                />
                                <label>Expense Description:</label>
                                <textarea
                                    placeholder="Expense Description"
                                    value={transaction.data.expenseDescription || ''}
                                    onChange={(e) => handleTransactionChange(index, 'expenseDescription', e.target.value)}
                                    className="border p-2 rounded"
                                    required
                                />
                                <label>Comments:</label>
                                <textarea
                                    placeholder="Comments"
                                    value={transaction.data.comments || ''}
                                    onChange={(e) => handleTransactionChange(index, 'comments', e.target.value)}
                                    className="border p-2 rounded"
                                    required
                                />
                                <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={isSubmitting}>Submit Expense Report</button>
                            </>
                        )}
                    </form>
                    {message && <p className={`mt-2 ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500 font-bold'}`}>{message}</p>}
                </div>
            ))}
            <button onClick={handleAddTransaction} className="bg-blue-500 text-white p-2 rounded mt-4">Add Another Transaction</button>
        </div>
    );
};

export default TransactionForm;