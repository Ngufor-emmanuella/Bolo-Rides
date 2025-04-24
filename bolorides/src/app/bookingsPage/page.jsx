'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import BookingModal from '../components/BookingModal';
import Sidebar from '../components/bookingsSideBar';
import RentalBookings from '../components/rentalBookings';
import Calendar from '../components/calender';

export default function BookingsPage() {
  const [cars, setCars] = useState([]);
  const [error, setError] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('cars'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const carCollection = collection(db, 'Cars');
        const carSnapshot = await getDocs(carCollection);
        const carList = carSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCars(carList);
      } catch (error) {
        setError('Error fetching cars: ' + error.message);
      }
    };

    fetchCars();
  }, []);

  const openModal = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavLinkClick = (view) => {
    setActiveView(view);
    setIsSidebarOpen(false); // Close the sidebar on nav link click
  };

  return (
    <div className="flex">
      <button 
        className="md:hidden p-2 text-white bg-[#9b2f2f] rounded fixed z-10 top-5 left-2"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? '✖' : '☰'}
      </button>

      <Sidebar 
        onSelect={handleNavLinkClick} 
        activeView={activeView} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} // Pass the close function
      />

      <main className={`flex-1 p-4 ${isSidebarOpen ? 'ml-64' : ''}`}>
        <h1 className="text-4xl text-[#9b2f2b] font-bold mb-4">
          {activeView === 'cars' ? 'Available Cars' : activeView === 'bookings' ? 'Rental Bookings' : 'Rental Calendar'}
        </h1>
        {error && <p className="text-red-500">{error}</p>}

        {activeView === 'cars' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cars.map(car => (
              <div key={car.id} className="border p-4 rounded shadow">
                <h2 className="text-xl font-semibold">{car.carName}</h2>
                <p>Type: {car.carType}</p>
                <p>Status: {car.status}</p>
                <button 
                  className="bg-[#9b2f2b] text-white p-2 rounded mt-2"
                  onClick={() => openModal(car)}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}

        {activeView === 'bookings' && <RentalBookings />}
        {activeView === 'calendar' && <Calendar />}
        {isModalOpen && <BookingModal car={selectedCar} onClose={closeModal} />}
      </main>
    </div>
  );
}