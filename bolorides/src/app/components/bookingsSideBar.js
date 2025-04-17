// app/components/bookingsSideBar.js
import React from 'react';
import Link from 'next/link';

const Sidebar = ({ onSelect, activeView }) => {
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <h2 className="text-lg font-semibold mb-4">Navigation</h2>
      <ul>
        <li className={`mb-2 ${activeView === 'cars' ? 'font-bold' : ''}`}>
          <button className="text-gray-300 hover:text-white" onClick={() => onSelect('cars')}>View Cars</button>
        </li>
        <li className={`mb-2 ${activeView === 'bookings' ? 'font-bold' : ''}`}>
          <button className="text-gray-300 hover:text-white" onClick={() => onSelect('bookings')}>View Bookings</button>
        </li>
        <li className={`mb-2 ${activeView === 'calendar' ? 'font-bold' : ''}`}>
          <button className="text-gray-300 hover:text-white" onClick={() => onSelect('calendar')}>See Calendar</button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;