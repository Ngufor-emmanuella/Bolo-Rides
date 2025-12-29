'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import BookingModal from '../components/bookingModal';
import Sidebar from '../components/bookingsSideBar';
import RentalBookings from '../components/rentalBookings';
import Calendar from '../components/calender';

export default function BookingsPage() {
  const [cars, setCars] = useState([]);
  const [error, setError] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('cars'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

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
    setIsSidebarOpen(false); 
  };

  return (
    <div className="flex justify-end">
      <button 
         className="absolute left-2 mt-15 p-2 text-white bg-[#9b2f2b] h-20" onClick={toggleSidebar}
      >
        {isSidebarOpen ? '✖' : '☰'}
      </button>

      {/* <button className="md:hidden p-2 mt-5 text-white bg-[#9b2f2b] rounded z-50 ml-4"
       onClick={() => setSidebarOpen(!sidebarOpen)}> {sidebarOpen ? 'X' : '☰'}
      </button> */}

      <Sidebar 
        onSelect={handleNavLinkClick} 
        activeView={activeView} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} // Pass the close function
      />

      <main className={`flex-1 p-4 mt-20 ${isSidebarOpen ? 'ml-64' : ''}`}>
        <h1 className="text-4xl text-[#9b2f2b] ml-10 font-bold mb-4">
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