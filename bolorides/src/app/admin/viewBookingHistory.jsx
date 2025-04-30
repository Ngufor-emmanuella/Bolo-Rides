'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const ViewBookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filteredMonth, setFilteredMonth] = useState(''); // State for filtering by month

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const bookingsCollection = collection(db, 'RentalBookings');
        const bookingsSnapshot = await getDocs(bookingsCollection);
        const bookingList = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter bookings for the current year
        const currentYear = new Date().getFullYear();
        const filteredBookings = bookingList.filter(booking => {
          const bookingDate = new Date(booking.startDate);
          return bookingDate.getFullYear() === currentYear;
        });

        setBookings(filteredBookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load booking history.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const groupByMonth = (bookings) => {
    return bookings.reduce((acc, booking) => {
      const bookingDate = new Date(booking.startDate);
      const month = bookingDate.toLocaleString('default', { month: 'long' });
      if (!acc[month]) acc[month] = [];
      acc[month].push(booking);
      return acc;
    }, {});
  };

  const groupedBookings = groupByMonth(bookings);

  // Filtered bookings based on user input
  const filteredGroupedBookings = filteredMonth
    ? { [filteredMonth]: groupedBookings[filteredMonth] }
    : groupedBookings;

  return (
    <div className="p-4">
      <h1 className="text-2xl text-[#9b2f2f] mb-4">Booking History for {new Date().getFullYear()}</h1>

      {/* Filter Form */}
      {/* <div className="mb-4">
        <input
          type="text"
          placeholder="Enter Month (e.g., January)"
          value={filteredMonth}
          onChange={(e) => setFilteredMonth(e.target.value)}
          className="border p-2 rounded mr-2"
        />
        <button
          onClick={() => setFilteredMonth('')}
          className="bg-red-500 text-white p-2 rounded"
        >
          Reset Filter
        </button>
      </div> */}

      {Object.entries(filteredGroupedBookings).map(([month, bookings]) => (
        <div key={month} className="mb-4"> 
          <br></br>
          <h2 className="text-xl text-[#9b2f2f] mb-2">For the Month of {month} :</h2>
          
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-[#9b2f2f] text-white">
              <tr>
                <th className="border border-gray-300 p-2">Created At</th>
                <th className="border border-gray-300 p-2">Car Name</th>
                <th className="border border-gray-300 p-2">Car Type</th>
                <th className="border border-gray-300 p-2">Destination</th>
                <th className="border border-gray-300 p-2">Email</th>
                <th className="border border-gray-300 p-2">Phone Number</th>
                <th className="border border-gray-300 p-2">Start Date</th>
                <th className="border border-gray-300 p-2">End Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td className="border border-gray-300 p-2">{new Date(booking.createdAt).toLocaleDateString()}</td>
                  <td className="border border-gray-300 p-2">{booking.carName}</td>
                  <td className="border border-gray-300 p-2">{booking.carType}</td>
                  <td className="border border-gray-300 p-2">{booking.destination}</td>
                  <td className="border border-gray-300 p-2">{booking.email}</td>
                  <td className="border border-gray-300 p-2">({booking.countryCode}) {booking.phoneNumber}</td>
                  <td className="border border-gray-300 p-2">{booking.startDate} | {booking.startTime}</td>
                  <td className="border border-gray-300 p-2">{booking.endDate} | {booking.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ViewBookingHistory;