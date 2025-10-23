import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

// Helper function to format numbers with commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const TransactionForm = ({
  handleAddReport,
  carId,
  carName,
  userId,
  userName,
}) => {
  const emptyTransactionData = {
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

  const [transactions, setTransactions] = useState([{ type: 'revenue', data: { ...emptyTransactionData } }]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const resetTimeoutRef = useRef(null);

  const validateFields = () => {
    for (const transaction of transactions) {
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
        if (transaction.data.driverIncome === undefined) {
          setMessage('Driver Income must be a valid number.');
          return false;
        }
        if (transaction.data.carExpense === undefined) {
          setMessage('Car Expense must be a valid number.');
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateFields()) {
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
      const reportDataList = transactions.map(transaction => {
        const rentalRateAmount = transaction.data.rentalRateAmount || 0;
        const numberOfRentalDays = transaction.data.numberOfRentalDays || 0;
        const paidAmount = transaction.data.paidAmount || 0;

        const amountDue = rentalRateAmount * numberOfRentalDays;
        const balanceAmount = Math.max(0, amountDue - paidAmount);

        return {
          ...transaction.data,
          carId,
          carName,
          userId,
          userName,
          amountDue,
          balanceAmount,
          createdAt: new Date(),
          captchaToken,
        };
      });

      for (const reportData of reportDataList) {
        await handleAddReport(reportData);
      }

      // Clear all form fields upon success
      setTransactions([{ type: 'revenue', data: { ...emptyTransactionData } }]);
      setCaptchaToken('');
      setMessage('Reports submitted successfully!');

      // Reset timeout for the message
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => {
        setMessage('');
      }, 60000); // 1 minute

    } catch (error) {
      setMessage('Error adding report: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNumberChange = (index, field, value) => {
    const cleanedValue = value.replace(/[^0-9]/g, '');
    const numberValue = cleanedValue === '' ? '' : Math.max(0, Number(cleanedValue));
    setTransactions(prev => {
      const newTransactions = [...prev];
      newTransactions[index].data[field] = numberValue;
      return newTransactions;
    });
  };

  const handleStringChange = (index, field, value) => {
    setTransactions(prev => {
      const newTransactions = [...prev];
      newTransactions[index].data[field] = value;
      return newTransactions;
    });
  };

  const handleTypeChange = (index, type) => {
    setTransactions(prev => {
      const newTransactions = [...prev];
      newTransactions[index].type = type;
      newTransactions[index].data = { ...emptyTransactionData };
      return newTransactions;
    });
  };

  const handleAddTransaction = () => {
    if (transactions.length < 3) {
      setTransactions(prev => [...prev, { type: 'revenue', data: { ...emptyTransactionData } }]);
    } else {
      setMessage('You can only add up to 3 transactions.');
    }
  };

  const handleRemoveTransaction = (index) => {
    setTransactions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col w-full">
        {transactions.map((transaction, index) => (
          <div key={index} className="mb-4 w-full">
            <div className="flex justify-between mb-4">
              <div>
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
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTransaction(index)}
                  className="bg-red-500 text-white p-1 rounded"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="flex flex-col">
              {transaction.type === 'revenue' && (
                <>
                  <label>Transaction Date:</label>
                  <input
                    type="date"
                    value={transaction.data.transactionDate || ''}
                    onChange={(e) => handleStringChange(index, 'transactionDate', e.target.value)}
                    required
                    className="border p-2 rounded mb-2"
                  />
                  <label>Destination:</label>
                  <input
                    type="text"
                    placeholder="Destination"
                    value={transaction.data.destination || ''}
                    onChange={(e) => handleStringChange(index, 'destination', e.target.value)}
                    required
                    className="border p-2 rounded mb-2"
                  />
                  <label>Rental Rate Amount:</label>
                  <input
                    type="text"
                    placeholder="Rental Rate Amount"
                    value={transaction.data.rentalRateAmount ? formatNumber(transaction.data.rentalRateAmount) : ''}
                    onChange={(e) => handleNumberChange(index, 'rentalRateAmount', e.target.value)}
                    required
                    className="border p-2 rounded mb-2"
                  />
                  <label>Number of Rental Days:</label>
                  <input
                    type="text"
                    placeholder="Number of Rental Days"
                    value={transaction.data.numberOfRentalDays ? formatNumber(transaction.data.numberOfRentalDays) : ''}
                    onChange={(e) => handleNumberChange(index, 'numberOfRentalDays', e.target.value)}
                    required
                    className="border p-2 rounded mb-2"
                  />
                  <label>Paid Amount:</label>
                  <input
                    type="text"
                    placeholder="Paid Amount"
                    value={transaction.data.paidAmount ? formatNumber(transaction.data.paidAmount) : ''}
                    onChange={(e) => handleNumberChange(index, 'paidAmount', e.target.value)}
                    className="border p-2 rounded mb-2"
                  />
                  <label>Amount Due:</label>
                  <input
                    type="text"
                    value={formatNumber(transaction.data.rentalRateAmount * transaction.data.numberOfRentalDays || 0)}
                    readOnly
                    className="border p-2 rounded bg-gray-100 mb-2"
                  />
                  <label>Balance Amount:</label>
                  <input
                    type="text"
                    value={formatNumber(Math.max(0, (transaction.data.rentalRateAmount * transaction.data.numberOfRentalDays || 0) - (transaction.data.paidAmount || 0)))}
                    readOnly
                    className="border p-2 rounded bg-gray-100 mb-2"
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
                    className="border p-2 rounded mb-2"
                  />
                  <label>Driver Income:</label>
                  <input
                    type="text"
                    placeholder="Driver Income"
                    value={transaction.data.driverIncome !== undefined ? formatNumber(transaction.data.driverIncome) : ''}
                    onChange={(e) => handleNumberChange(index, 'driverIncome', e.target.value)}
                    className="border p-2 rounded mb-2"
                  />
                  <label>Car Expense:</label>
                  <input
                    type="text"
                    placeholder="Car Expense"
                    value={transaction.data.carExpense !== undefined ? formatNumber(transaction.data.carExpense) : ''}
                    onChange={(e) => handleNumberChange(index, 'carExpense', e.target.value)}
                    className="border p-2 rounded mb-2"
                  />
                  <label>Expense Description:</label>
                  <textarea
                    placeholder="Expense Description"
                    value={transaction.data.expenseDescription || ''}
                    onChange={(e) => handleStringChange(index, 'expenseDescription', e.target.value)}
                    className="border p-2 rounded mb-2"
                  />
                  <label>Comments:</label>
                  <textarea
                    placeholder="Comments"
                    value={transaction.data.comments || ''}
                    onChange={(e) => handleStringChange(index, 'comments', e.target.value)}
                    className="border p-2 rounded mb-2"
                  />
                </>
              )}
            </div>
          </div>
        ))}

        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}
          onChange={setCaptchaToken}
          className="mb-4"
        />

        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit All'}
          </button>
          {transactions.length < 3 && (
            <button
              type="button"
              onClick={handleAddTransaction}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Add Another Transaction
            </button>
          )}
        </div>

        {message && (
          <p className={`mt-2 ${message.startsWith('Error') ? 'text-red-500' : 'text-green-600 font-bold'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default TransactionForm;