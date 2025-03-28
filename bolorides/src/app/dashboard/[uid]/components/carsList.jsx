// src/app/components/CarList.jsx
import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
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
            const carName = cars.find(car => car.id === carId)?.carName;

            if (type === 'revenue') {
                const { destination, rentalRateAmount, numberOfRentalDays, paidAmount, transactionDate } = data;

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

            const newTransactions = [...transactions];
            newTransactions[index].data = {};
            setTransactions(newTransactions);
        } catch (error) {
            setError('Error: ' + error.message);
        }
    };

    const handleEditReport = (report) => {
        const index = transactions.length; // Set index to the next transaction
        const type = report.driver_income ? 'expenses' : 'revenue'; // Determine type based on report data
        const data = {
            transactionDate: report.transaction_date,
            destination: report.destination,
            rentalRateAmount: report.rental_rate_amount,
            numberOfRentalDays: report.number_of_rental_days,
            paidAmount: report.paid_amount,
            driverIncome: report.driver_income,
            carExpense: report.car_expense,
            expenseDescription: report.expense_description,
            comments: report.comments,
        };

        setTransactions([{ type, data }]); // Use an array with a single transaction for editing
        setActiveCarId(report.carId); // Set the car ID to the one being edited
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
                        onEditReport={handleEditReport}
                        activeCarId={activeCarId}
                        setActiveCarId={setActiveCarId}
                        showReports={showReports}
                        setShowReports={setShowReports}
                        transactions={transactions}
                        handleAddReport={handleAddReport}
                        handleAddTransaction={handleAddTransaction}
                    />
                ))
            ) : (
                <p className="text-gray-500">No cars found.</p>
            )}
        </div>
    );
};

export default CarList;