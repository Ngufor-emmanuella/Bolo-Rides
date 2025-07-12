// src/app/components/CarList.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import CarCard from './CarCard';

const CarList = ({ userId, userName }) => {
    const [cars, setCars] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeCarId, setActiveCarId] = useState(null);
    const [transactions, setTransactions] = useState([{ type: 'revenue', data: {} }]);
    const [showReports, setShowReports] = useState(false); 

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
        if (field === 'type') {
            newTransactions[index].type = value;
        } else {
            newTransactions[index].data[field] = value;
        }
        setTransactions(newTransactions);
    };

    const handleAddTransaction = () => {
        setTransactions([...transactions, { type: 'revenue', data: {} }]);
    };

    const handleRemoveTransaction = (index) => {
        const newTransactions = transactions.filter((_, i) => i !== index);
        setTransactions(newTransactions);
    };

    const handleAddReport = async (transaction, index) => {
        try {
            const reportData = {
                ...transaction.data,
                userId,
                carId: activeCarId,
                createdAt: new Date(),
            };

            await addDoc(collection(db, 'DailyReports'), reportData);
            setTransactions(transactions.filter((_, i) => i !== index)); // Remove the submitted transaction
            setSuccess('Report submitted successfully!'); // Show success message
        } catch (error) {
            console.error('Error adding report:', error.message);
            setError('Error adding report: ' + error.message); // Show error message
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Cars Owned by {userName}</h1>
            {cars.length > 0 ? (
                cars.map(car => (
                    <CarCard
                        key={car.id}
                        car={car}
                        userId={userId} 
                        userName={userName} 
                        activeCarId={activeCarId}
                        setActiveCarId={setActiveCarId}
                        showReports={showReports}
                        setShowReports={setShowReports}
                        transactions={transactions}
                        handleAddReport={handleAddReport}
                        handleAddTransaction={handleAddTransaction}
                        handleTransactionChange={handleTransactionChange}
                        handleRemoveTransaction={handleRemoveTransaction}
                    />
                ))
            ) : (
                <p className="text-gray-500">No cars found...</p>
            )}
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
        </div>
    );
};

export default CarList;