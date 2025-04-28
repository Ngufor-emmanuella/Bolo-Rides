import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

// Helper function to format numbers with commas
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const TransactionForm = ({
    transactions = [],
    handleAddReport,
    handleTransactionChange,
    handleRemoveTransaction,
    handleAddTransaction,
    carId,
    carName,
    userId,
    userName,
}) => {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');

    const validateFields = (transaction) => {
        if (!transaction.data.transactionDate) {
            setMessage('Transaction date is required.');
            return false;
        }
        if (transaction.type === 'revenue') {
            if (!transaction.data.destination) {
                setMessage('Destination is required.');
                return false;
            }
            if (!transaction.data.rentalRateAmount || transaction.data.rentalRateAmount <= 0) {
                setMessage('Rental Rate Amount must be greater than 0.');
                return false;
            }
            if (!transaction.data.numberOfRentalDays || transaction.data.numberOfRentalDays <= 0) {
                setMessage('Number of Rental Days must be greater than 0.');
                return false;
            }
            if (transaction.data.paidAmount > (transaction.data.rentalRateAmount * transaction.data.numberOfRentalDays)) {
                setMessage('Paid amount exceeds amount due. Please enter a valid amount.');
                return false;
            }
        } else if (transaction.type === 'expenses') {
            if (!transaction.data.driverIncome && transaction.data.driverIncome !== 0) {
                setMessage('Driver Income must be a valid number.');
                return false;
            }
            if (!transaction.data.carExpense && transaction.data.carExpense !== 0) {
                setMessage('Car Expense must be a valid number.');
                return false;
            }
            if (!transaction.data.expenseDescription) {
                setMessage('Expense Description is required.');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e, index) => {
        e.preventDefault();
        if (isSubmitting) return;

        const transaction = transactions[index];

        if (!validateFields(transaction)) {
            setTimeout(() => setMessage(''), 5000);
            return;
        }

        if (!captchaToken) {
            setMessage('Please complete the reCAPTCHA.');
            return;
        }

        setIsSubmitting(true);
        setMessage('Processing, please wait...');

        try {
            // Calculate Amount Due and Balance Amount
            const rentalRateAmount = transaction.data.rentalRateAmount || 0;
            const numberOfRentalDays = transaction.data.numberOfRentalDays || 0;
            const paidAmount = transaction.data.paidAmount || 0;

            const amountDue = rentalRateAmount * numberOfRentalDays;
            const balanceAmount = Math.max(0, amountDue - paidAmount);

            // Prepare the report data to be submitted
            const reportData = {
                ...transaction.data,
                carId: carId,
                carName: carName,
                userId: userId,
                userName: userName,
                amountDue: amountDue, // Include Amount Due
                balanceAmount: balanceAmount, // Include Balance Amount
                createdAt: new Date(), // Add timestamp
                captchaToken: captchaToken, // Include reCAPTCHA token
            };

            await handleAddReport(reportData);
            setMessage('Report submitted successfully!');

            // Reset the form fields after successful submission
            handleTransactionChange(index, 'data', {
                transactionDate: '',
                destination: '',
                rentalRateAmount: '',
                numberOfRentalDays: '',
                paidAmount: '',
                driverIncome: '',
                carExpense: '',
                expenseDescription: '',
                comments: '',
            });
        } catch (error) {
            setMessage('Error adding report: ' + error.message);
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(''), 5000);
            setCaptchaToken(''); // Reset the captcha token after submission
        }
    };

    const handleNumberChange = (index, field, value) => {
        const cleanedValue = value.replace(/[^0-9]/g, ''); // Allow only digits
        const numberValue = cleanedValue === '' ? '' : Math.max(0, Number(cleanedValue)); // Ensure non-negative
        handleTransactionChange(index, field, numberValue);
    };

    const handleStringChange = (index, field, value) => {
        handleTransactionChange(index, field, value);
    };

    const handleTypeChange = (index, type) => {
        handleTransactionChange(index, 'type', type);
        handleTransactionChange(index, 'data', {
            transactionDate: '',
            destination: '',
            rentalRateAmount: '',
            numberOfRentalDays: '',
            paidAmount: '',
            driverIncome: '',
            carExpense: '',
            expenseDescription: '',
            comments: '',
        });
    };

    return (
        <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg w-full max-w-2xl mx-auto">
            {transactions.map((transaction, index) => (
                <div key={index} className="mb-4 w-full">
                    <div className="flex justify-center mb-4">
                        <label>
                            <input
                                type="radio"
                                name={`transactionType-${index}`}
                                checked={transaction.type === 'revenue'}
                                onChange={() => handleTypeChange(index, 'revenue')}
                            />
                            Revenue
                        </label>
                        <label className="ml-4">
                            <input
                                type="radio"
                                name={`transactionType-${index}`}
                                checked={transaction.type === 'expenses'}
                                onChange={() => handleTypeChange(index, 'expenses')}
                            />
                            Expenses
                        </label>
                    </div>
                    <form onSubmit={(e) => handleSubmit(e, index)} className="flex flex-col space-y-4 w-full md:w-3/4 lg:w-7/10 mx-auto">
                        {transaction.type === 'revenue' && (
                            <>
                                <label>Transaction Date:</label>
                                <input
                                    type="date"
                                    value={transaction.data.transactionDate || ''}
                                    onChange={(e) => handleStringChange(index, 'transactionDate', e.target.value)}
                                    required
                                    className="border p-2 rounded"
                                />
                                <label>Destination:</label>
                                <input
                                    type="text"
                                    placeholder="Destination"
                                    value={transaction.data.destination || ''}
                                    onChange={(e) => handleStringChange(index, 'destination', e.target.value)}
                                    required
                                    className="border p-2 rounded"
                                />
                                <label>Rental Rate Amount:</label>
                                <input
                                    type="text"
                                    placeholder="Rental Rate Amount"
                                    value={transaction.data.rentalRateAmount ? formatNumber(transaction.data.rentalRateAmount) : ''}
                                    onChange={(e) => handleNumberChange(index, 'rentalRateAmount', e.target.value)}
                                    required
                                    className="border p-2 rounded"
                                />
                                <label>Number of Rental Days:</label>
                                <input
                                    type="text"
                                    placeholder="Number of Rental Days"
                                    value={transaction.data.numberOfRentalDays ? formatNumber(transaction.data.numberOfRentalDays) : ''}
                                    onChange={(e) => handleNumberChange(index, 'numberOfRentalDays', e.target.value)}
                                    required
                                    className="border p-2 rounded"
                                />
                                <label>Paid Amount:</label>
                                <input
                                    type="text"
                                    placeholder="Paid Amount"
                                    value={transaction.data.paidAmount ? formatNumber(transaction.data.paidAmount) : ''}
                                    onChange={(e) => handleNumberChange(index, 'paidAmount', e.target.value)}
                                    className="border p-2 rounded"
                                />
                                {/* Read-only fields */}
                                <label>Amount Due:</label>
                                <input
                                    type="text"
                                    value={formatNumber(transaction.data.rentalRateAmount * transaction.data.numberOfRentalDays || 0)}
                                    readOnly
                                    className="border p-2 rounded"
                                />
                                <label>Balance Amount:</label>
                                <input
                                    type="text"
                                    value={formatNumber(Math.max(0, (transaction.data.rentalRateAmount * transaction.data.numberOfRentalDays || 0) - (transaction.data.paidAmount || 0)))}
                                    readOnly
                                    className="border p-2 rounded"
                                />
                            </>
                        )}
                        {transaction.type === 'expenses' && (
                            <>
                                <label>Transaction Date:</label>
                                <input
                                    type="date"
                                    value={transaction.data.transactionDate || ''}
                                    onChange={(e) => handleStringChange(index, 'transactionDate', e.target.value)}
                                    required
                                    className="border p-2 rounded"
                                />
                                <label>Driver Income:</label>
                                <input
                                    type="text"
                                    placeholder="Driver Income"
                                    value={transaction.data.driverIncome ? formatNumber(transaction.data.driverIncome) : ''}
                                    onChange={(e) => handleNumberChange(index, 'driverIncome', e.target.value)}
                                    className="border p-2 rounded"
                                    required
                                />
                                <label>Car Expense:</label>
                                <input
                                    type="text"
                                    placeholder="Car Expense"
                                    value={transaction.data.carExpense ? formatNumber(transaction.data.carExpense) : ''}
                                    onChange={(e) => handleNumberChange(index, 'carExpense', e.target.value)}
                                    className="border p-2 rounded"
                                    required
                                />
                                <label>Expense Description:</label>
                                <textarea
                                    placeholder="Expense Description"
                                    value={transaction.data.expenseDescription || ''}
                                    onChange={(e) => handleStringChange(index, 'expenseDescription', e.target.value)}
                                    className="border p-2 rounded"
                                    required
                                />
                                <label>Comments:</label>
                                <textarea
                                    placeholder="Comments"
                                    value={transaction.data.comments || ''}
                                    onChange={(e) => handleStringChange(index, 'comments', e.target.value)}
                                    className="border p-2 rounded"
                                />
                            </>
                        )}
                        <ReCAPTCHA 
                            sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY} 
                            onChange={setCaptchaToken} 
                            className="mb-4" 
                        />
                        <div className="flex justify-between">
                            <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={isSubmitting}>
                                Submit
                            </button>
                            <button type="button" onClick={() => handleRemoveTransaction(index)} className="bg-red-500 text-white p-1 rounded">
                                Remove Transaction
                            </button>
                        </div>
                    </form>
                    {message && (
                        <p className={`mt-2 ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500 font-bold'}`}>{message}</p>
                    )}
                </div>
            ))}
            <button onClick={handleAddTransaction} className="bg-blue-500 text-white p-2 rounded mt-4">
                Add Another Transaction
            </button>
        </div>
    );
};

export default TransactionForm;