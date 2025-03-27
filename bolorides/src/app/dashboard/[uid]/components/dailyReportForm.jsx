// // src/app/components/DailyReportForm.jsx
// import React, { useState } from 'react';
// import { db } from '@/app/firebase';
// import { collection, addDoc } from 'firebase/firestore';

// const DailyReportForm = ({ carId, carName }) => {
//     const [transactionDate, setTransactionDate] = useState('');
//     const [destination, setDestination] = useState('');
//     const [rentalRateAmount, setRentalRateAmount] = useState(0);
//     const [numberOfRentalDays, setNumberOfRentalDays] = useState(1);
//     const [paidAmount, setPaidAmount] = useState(0);
//     const [driverIncome, setDriverIncome] = useState(0);
//     const [carExpense, setCarExpense] = useState(0);
//     const [expenseDescription, setExpenseDescription] = useState('');
//     const [comments, setComments] = useState('');
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');

//     const handleAddReport = async (e) => {
//         e.preventDefault();
//         setError('');
//         setSuccess('');

//         // Basic validation
//         if (!transactionDate || !destination || !expenseDescription) {
//             setError('Please fill in all required fields.');
//             return;
//         }

//         try {
//             const report = {
//                 transaction_date: transactionDate,
//                 destination,
//                 rental_rate_amount: rentalRateAmount,
//                 number_of_rental_days: numberOfRentalDays,
//                 paid_amount: paidAmount,
//                 driver_income: driverIncome,
//                 car_expense: carExpense,
//                 expense_description: expenseDescription,
//                 comments,
//                 carId,
//                 carName,
//                 created_at: new Date(),
//             };

//             await addDoc(collection(db, 'DailyReports'), report);
//             setSuccess('Daily report added successfully!');

//             // Reset fields
//             setTransactionDate('');
//             setDestination('');
//             setRentalRateAmount(0);
//             setNumberOfRentalDays(1);
//             setPaidAmount(0);
//             setDriverIncome(0);
//             setCarExpense(0);
//             setExpenseDescription('');
//             setComments('');
//         } catch (error) {
//             setError('Error: ' + error.message);
//         }
//     };

//     return (
//         <form onSubmit={handleAddReport} className="flex flex-col space-y-4 p-4 bg-white shadow-md rounded">
//           <label> Transaction Date : </label>
//             <input
//                 type="date"
//                 value={transactionDate}
//                 onChange={(e) => setTransactionDate(e.target.value)}
//                 required
//                 className="border p-2 rounded"
//             />
//              <label>Destination:</label>
//             <input
//                 type="text"
//                 placeholder="Destination"
//                 value={destination}
//                 onChange={(e) => setDestination(e.target.value)}
//                 required
//                 className="border p-2 rounded"
//             />
//              <label>Rental Rate Amount</label>
//             <input
//                 type="number"
//                 placeholder="Rental Rate Amount"
//                 value={rentalRateAmount}
//                 onChange={(e) => setRentalRateAmount(Number(e.target.value))}
//                 className="border p-2 rounded"
//             />
//              <label>Num of rental days:</label>
//             <input
//                 type="number"
//                 placeholder="Number of Rental Days"
//                 value={numberOfRentalDays}
//                 onChange={(e) => setNumberOfRentalDays(Number(e.target.value))}
//                 className="border p-2 rounded"
//             />
//              <label> Paid amount </label>
//             <input
//                 type="number"
//                 placeholder="Paid Amount"
//                 value={paidAmount}
//                 onChange={(e) => setPaidAmount(Number(e.target.value))}
//                 className="border p-2 rounded"
//             />
//              <label> Driver Income</label>
//             <input
//                 type="number"
//                 placeholder="Driver Income"
//                 value={driverIncome}
//                 onChange={(e) => setDriverIncome(Number(e.target.value))}
//                 className="border p-2 rounded"
//             />
//              <label> Car expense:</label>
//             <input
//                 type="number"
//                 placeholder="Car Expense"
//                 value={carExpense}
//                 onChange={(e) => setCarExpense(Number(e.target.value))}
//                 className="border p-2 rounded"
//             />
//              <label> Expense Desciption:</label>
//             <textarea
//                 placeholder="Expense Description"
//                 value={expenseDescription}
//                 onChange={(e) => setExpenseDescription(e.target.value)}
//                 required
//                 className="border p-2 rounded"
//             />
//             <textarea
//                 placeholder="Comments"
//                 value={comments}
//                 onChange={(e) => setComments(e.target.value)}
//                 className="border p-2 rounded"
//             />
//             <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Daily Report</button>
//             {success && <p className="text-green-500 mt-2">{success}</p>}
//             {error && <p className="text-red-500 mt-2">{error}</p>}
//         </form>
//     );
// };

// export default DailyReportForm;