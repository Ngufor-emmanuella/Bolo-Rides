// app/components/bookingsSideBar.js

import React from 'react';

const Sidebar = ({ onSelect, activeView, isOpen, onClose }) => {
  return (
    <aside className={`fixed inset-y-0 left-0 bg-gray-800 text-white p-4 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:flex md:flex-col`}>
      {/* Close button, only visible on mobile screens */}
      <button
        className="text-white mb-4 md:hidden" 
        onClick={onClose} 
      >
        ✖
      </button>
      <h2 className="text-lg text-[#9b2f2b] font-semibold mb-4">More Car Details...</h2>
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