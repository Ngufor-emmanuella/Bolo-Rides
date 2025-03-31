import React, { useState } from 'react';
import AllDailyReports from './AllDailyReports';
import TransactionForm from './TransactionForm';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/app/firebase'; 

const CarCard = ({ car, userId, userName, activeCarId, setActiveCarId }) => {
    const [showReports, setShowReports] = useState(false);
    const [transactions, setTransactions] = useState([{ type: 'revenue', data: {} }]);

    const handleTransactionChange = (index, field, value) => {
        const newTransactions = [...transactions];
        if (field === 'type') {
            newTransactions[index].type = value;
        } else {
            newTransactions[index].data[field] = value;
        }
        setTransactions(newTransactions);
    };

    const handleRemoveTransaction = (index) => {
        const newTransactions = transactions.filter((_, i) => i !== index);
        setTransactions(newTransactions);
    };

    const handleAddTransaction = () => {
        setTransactions([...transactions, { type: 'revenue', data: {} }]);
    };

    const resetTransactionData = (index) => {
        const resetData = {
            transactionDate: '',
            destination: '',
            rentalRateAmount: '',
            numberOfRentalDays: '',
            paidAmount: '',
            amountDue: 0,
            balanceAmount: 0,
            driverIncome: '',
            carExpense: '',
            expenseDescription: '',
            comments: '',
        };

        const newTransactions = [...transactions];
        newTransactions[index].data = resetData;
        setTransactions(newTransactions);
    };

    const handleAddReport = async (transaction, index, carId, carName) => {
        // Ensure userName is used here
        const reportData = {
            ...transaction.data,
            type: transaction.type,
            userId,
            userName, // Use userName passed as a prop
            carId,
            carName,
            createdAt: new Date(),
        };

        try {
            await addDoc(collection(db, 'DailyReports'), reportData);
            resetTransactionData(index); // Reset transaction data after successful submission
        } catch (error) {
            console.error('Error adding report:', error.message);
        }
    };

    return (
        <div key={car.id} className="mb-4 border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{car.carName}</h2>
            <button
                onClick={() => setActiveCarId(car.id === activeCarId ? null : car.id)}
                className="bg-blue-500 text-white p-2 rounded mb-2"
            >
                {activeCarId === car.id ? 'Cancel Daily Report' : 'Add Daily Report'}
            </button>
            <button
                onClick={() => {
                    setShowReports(!showReports);
                }}
                className="bg-green-500 text-white p-2 rounded mb-2 ml-2"
            >
                {showReports ? 'Hide All Transactions' : 'See All Transactions'}
            </button>
            {showReports && activeCarId === car.id && (
                <AllDailyReports carId={car.id} userId={userId} />
            )}
            {activeCarId === car.id && !showReports && (
                <TransactionForm 
                    transactions={transactions} 
                    handleAddReport={(transaction, index) => handleAddReport(transaction, index, car.id, car.carName)} 
                    handleTransactionChange={handleTransactionChange} 
                    handleRemoveTransaction={handleRemoveTransaction} 
                    handleAddTransaction={handleAddTransaction} 
                />
            )}
        </div>
    );
};

export default CarCard;
