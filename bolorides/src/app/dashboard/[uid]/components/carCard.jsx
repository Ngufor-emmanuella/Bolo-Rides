// src/app/components/CarCard.jsx
import React from 'react';
import AllDailyReports from './AllDailyReports';
import TransactionForm from './TransactionForm';

const CarCard = ({ car, userId, onEditReport, activeCarId, setActiveCarId, showReports, setShowReports, transactions, handleAddReport, handleTransactionChange }) => {
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
                    setActiveCarId(car.id);
                }}
                className="bg-green-500 text-white p-2 rounded mb-2 ml-2"
            >
                {showReports ? 'Hide All Transactions' : 'See All Transactions'}
            </button>
            {showReports && activeCarId === car.id && (
                <AllDailyReports carId={car.id} userId={userId} onEdit={onEditReport} />
            )}
            {activeCarId === car.id && !showReports && (
                <TransactionForm 
                    transactions={transactions} 
                    handleAddReport={handleAddReport} 
                    handleTransactionChange={handleTransactionChange} // Ensure this is included
                />
            )}
        </div>
    );
};

export default CarCard;