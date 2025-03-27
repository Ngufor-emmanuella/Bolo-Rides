// src/app/components/CarList.jsx
import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';

const CarList = ({ userId, userName }) => {
    const [cars, setCars] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeCarId, setActiveCarId] = useState(null);
    const [transactions, setTransactions] = useState([{ type: 'revenue', data: {} }]);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const carQuery = query(collection(db, 'Cars'), where('userId', '==', userId));
                const carSnapshot = await getDocs(carQuery);
                const carList = carSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCars(carList);
            } catch (error) {
                setError('Error fetching cars: ' + error.message);
            }
        };

        fetchCars();
    }, [userId]);

    const handleTransactionChange = (index, field, value) => {
        const newTransactions = [...transactions];
        newTransactions[index].data[field] = value;
        setTransactions(newTransactions);
    };

    const handleAddTransaction = () => {
        setTransactions([...transactions, { type: 'revenue', data: {} }]);
    };

    const handleRemoveTransaction = (index) => {
        const newTransactions = transactions.filter((_, i) => i !== index);
        setTransactions(newTransactions);
    };

    const handleTransactionTypeChange = (index, type) => {
        const newTransactions = [...transactions];
        newTransactions[index].type = type;
        setTransactions(newTransactions);
    };

    const handleAddReport = async (carId, index) => {
        const { type, data } = transactions[index];

        try {
            const carName = cars.find(car => car.id === carId)?.carName; // Get the carName here

            if (type === 'revenue') {
                const { destination, rentalRateAmount, numberOfRentalDays, paidAmount, transactionDate } = data;

                // Validate revenue fields
                if (!destination || rentalRateAmount <= 0 || numberOfRentalDays <= 0 || paidAmount < 0 || !transactionDate) {
                    setError('Please fill in all required fields with positive numbers.');
                    return;
                }

                const amountDue = rentalRateAmount * numberOfRentalDays;
                const balanceAmount = amountDue - paidAmount;

                const report = {
                    transaction_date: transactionDate,
                    destination,
                    rental_rate_amount: rentalRateAmount,
                    number_of_rental_days: numberOfRentalDays,
                    paid_amount: paidAmount,
                    balance_amount: balanceAmount < 0 ? 0 : balanceAmount,
                    carId,
                    carName,
                    userId,
                    userName,
                    created_at: new Date(),
                };

                await addDoc(collection(db, 'DailyReports'), report);
                setSuccess('Daily report added successfully!');
            } else {
                const { driverIncome, carExpense, expenseDescription, comments, transactionDate } = data;

                const report = {
                    driver_income: driverIncome,
                    car_expense: carExpense,
                    expense_description: expenseDescription,
                    comments,
                    transaction_date: transactionDate,
                    carId,
                    carName,
                    userId,
                    userName,
                    created_at: new Date(),
                };

                await addDoc(collection(db, 'DailyReports'), report);
                setSuccess('Expense report added successfully!');
            }

            // Reset fields for the specific transaction
            const newTransactions = [...transactions];
            newTransactions[index].data = {};
            setTransactions(newTransactions);
        } catch (error) {
            setError('Error: ' + error.message);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Cars Owned by {userName}</h1>
            {cars.length > 0 ? (
                cars.map(car => (
                    <div key={car.id} className="mb-4 border p-4 rounded shadow">
                        <h2 className="text-xl font-semibold">{car.carName}</h2>
                        <button
                            onClick={() => setActiveCarId(car.id === activeCarId ? null : car.id)}
                            className="bg-blue-500 text-white p-2 rounded mb-2"
                        >
                            {activeCarId === car.id ? 'Cancel Daily Report' : 'Add Daily Report'}
                        </button>
                        {activeCarId === car.id && (
                            <div>
                                {transactions.map((transaction, index) => (
                                    <div key={index} className="mb-4">
                                        <div className="flex items-center mb-4">
                                            <label className="mr-4">
                                                <input
                                                    type="radio"
                                                    value="revenue"
                                                    checked={transaction.type === 'revenue'}
                                                    onChange={() => handleTransactionTypeChange(index, 'revenue')}
                                                />
                                                Revenue
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    value="expenses"
                                                    checked={transaction.type === 'expenses'}
                                                    onChange={() => handleTransactionTypeChange(index, 'expenses')}
                                                />
                                                Expenses
                                            </label>
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTransaction(index)}
                                                    className="ml-4 text-red-500"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        {transaction.type === 'revenue' && (
                                            <form onSubmit={(e) => { e.preventDefault(); handleAddReport(car.id, index); }} className="flex flex-col space-y-4">
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
                                                
                                                <div className="flex flex-col">
                                                    <label>Amount Due: {transaction.data.rentalRateAmount * transaction.data.numberOfRentalDays || 0}</label>
                                                    <label style={{ color: (transaction.data.rentalRateAmount * transaction.data.numberOfRentalDays - (transaction.data.paidAmount || 0)) > 0 ? 'red' : 'black' }}>
                                                        Balance Amount: {Math.max(transaction.data.rentalRateAmount * transaction.data.numberOfRentalDays - (transaction.data.paidAmount || 0), 0)}
                                                    </label>
                                                </div>
                                                {error && <p className="text-red-500">{error}</p>}
                                                {success && <p className="text-green-500">{success}</p>}
                                                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit Daily Report</button>
                                            </form>
                                        )}

                                        {transaction.type === 'expenses' && (
                                            <form onSubmit={(e) => { e.preventDefault(); handleAddReport(car.id, index); }} className="flex flex-col space-y-4">
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
                                                <label>Transaction date:</label>
                                                <input
                                                    type="date"
                                                    value={transaction.data.transactionDate || ''}
                                                    onChange={(e) => handleTransactionChange(index, 'transactionDate', e.target.value)}
                                                    className="border p-2 rounded"
                                                />
                                                {error && <p className="text-red-500">{error}</p>}
                                                {success && <p className="text-green-500">{success}</p>}
                                                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit Expense Report</button>
                                            </form>
                                        )}
                                    </div>
                                ))}
                                <button onClick={handleAddTransaction} className="bg-blue-500 text-white p-2 rounded mt-4">Add Another Transaction</button>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No cars found.</p>
            )}
        </div>
    );
};

export default CarList;