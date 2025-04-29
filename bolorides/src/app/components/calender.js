'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Calendar = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const bookingCollection = collection(db, 'RentalBookings');
        const bookingSnapshot = await getDocs(bookingCollection);
        const bookingList = bookingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(bookingList);
      } catch (error) {
        console.error('Error fetching bookings: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const isBooked = (date) => {
    return bookings.filter(booking => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const calendarDays = [];

    // Add empty divs for days before the start of the month
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="border p-2"></div>);
    }

    // Fill in the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const booked = isBooked(date);
      const isPast = date < new Date();
      const isFutureMonth = currentDate.getMonth() !== month;

      const className = booked.length > 0
        ? (isFutureMonth ? 'border p-2 bg-red-600 text-white' : 'border p-2 bg-green-600 text-white') // Booked in future months (red) or current month (green)
        : (isPast ? 'border p-2' : 'border p-2 bg-green-200'); // Future unbooked days

      calendarDays.push(
        <div key={day} className={className}>
          <div>{day}</div>
        </div>
      );
    }

    return (
      <div className="mt-4">
        <h2 className="text-xl text-[#9b2f2b] font-bold">
          {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}
        </h2>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>
      </div>
    );
  };

  const renderUpcomingMonths = () => {
    const upcomingMonths = [];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    for (let i = 1; i <= 3; i++) { // Check for the next three months
      const month = (currentMonth + i) % 12;
      const year = currentYear + Math.floor((currentMonth + i) / 12);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const hasUpcomingBookings = bookings.some(booking => {
        const startDate = new Date(booking.startDate);
        return startDate.getFullYear() === year && startDate.getMonth() === month;
      });

      if (hasUpcomingBookings) {
        upcomingMonths.push(
          <div key={month} className="mt-4"> 
            <h2 className="text-xl text-[#9b2f2b] font-bold">
              Upcoming Rentals for {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(year, month))}
            </h2>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: daysInMonth }, (_, day) => {
                const date = new Date(year, month, day + 1);
                const booked = isBooked(date);
                const className = booked.length > 0 ? 'border p-2 bg-red-600 text-white' : 'border p-2'; // Highlight booked days red

                return (
                  <div key={day} className={className}>
                    <div>{day + 1}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
    }

    if (upcomingMonths.length === 0) {
      upcomingMonths.push(
        <p key="no-upcoming" className="mt-4">Waiting for upcoming rentals, none yet!</p>
      );
    }

    return upcomingMonths;
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl text-[#9b2f2b] font-bold mb-2">
        Bookings for {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}
      </h2>
      {loading ? (
        <p className="text-lg">Please hold on...</p>
      ) : (
        <div>
          {renderCalendar()} {/* Render current month */}
          <br />
          {renderUpcomingMonths()} {/* Render upcoming months */}
          <br />
        </div>
      )}
    </div>
  );
};

export default Calendar;