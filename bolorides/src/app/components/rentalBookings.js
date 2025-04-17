// app/components/RentalBookings.js
'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const RentalBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // State to track loading
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [noBookingsMessage, setNoBookingsMessage] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true); // Start loading
      try {
        const bookingCollection = collection(db, 'RentalBookings');
        const bookingSnapshot = await getDocs(bookingCollection);
        const bookingList = bookingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter bookings for the current month and upcoming months
        const filteredBookings = bookingList.filter(booking => {
          const bookingDate = new Date(booking.startDate);
          return (
            (bookingDate.getFullYear() > currentYear) || 
            (bookingDate.getFullYear() === currentYear && bookingDate.getMonth() >= currentMonth)
          );
        });

        setBookings(filteredBookings);

        // Check for bookings in the current month
        const thisMonthBookings = filteredBookings.filter(booking => {
          const bookingDate = new Date(booking.startDate);
          return bookingDate.getFullYear() === currentYear && bookingDate.getMonth() === currentMonth;
        });

        if (thisMonthBookings.length === 0) {
          setNoBookingsMessage(`No bookings for the month of ${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())}.`);
        } else {
          setNoBookingsMessage('');
        }
      } catch (error) {
        setError('Error fetching bookings: ' + error.message);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchBookings();
  }, [currentMonth, currentYear]);

  const upcomingMonths = bookings.reduce((acc, booking) => {
    const bookingDate = new Date(booking.startDate);
    const month = bookingDate.toLocaleString('default', { month: 'long' });
    if (!acc.includes(month)) {
      acc.push(month);
    }
    return acc;
  }, []).filter(month => {
    const monthIndex = new Date(month + " 1").getMonth();
    return monthIndex > currentMonth || (currentMonth === monthIndex && currentYear === new Date().getFullYear());
  });

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-2">Rental Bookings</h2>
      {error && <p className="text-red-500">{error}</p>}
      {loading && <p className="text-yellow-500">Please hold on...</p>}
      {noBookingsMessage && <p className="text-yellow-500">{noBookingsMessage}</p>}
      {bookings.length === 0 && !noBookingsMessage && !loading ? (
        <p>No rentals available.</p>
      ) : (
        <>
          {upcomingMonths.length > 0 && <h3 className="text-xl font-semibold mt-4">Upcoming Rentals:</h3>}
          {upcomingMonths.map(month => (
            <div key={month}>
              <h4 className="text-lg font-semibold">{month}</h4>
              <table className="min-w-full bg-white border border-gray-200 mb-4">
                <thead>
                  <tr>
                    <th className="border-b p-2">Car Name</th>
                    <th className="border-b p-2">Car Type</th>
                    <th className="border-b p-2">Start Date & Time</th>
                    <th className="border-b p-2">End Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.filter(booking => {
                    const bookingDate = new Date(booking.startDate);
                    return bookingDate.toLocaleString('default', { month: 'long' }) === month;
                  }).map(booking => (
                    <tr key={booking.id}>
                      <td className="border-b p-2">{booking.carName}</td>
                      <td className="border-b p-2">{booking.carType}</td>
                      <td className="border-b p-2">{booking.startDate} {booking.startTime}</td>
                      <td className="border-b p-2">{booking.endDate} {booking.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default RentalBookings;