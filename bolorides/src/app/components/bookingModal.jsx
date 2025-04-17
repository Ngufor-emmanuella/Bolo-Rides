'use client';

import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const BookingModal = ({ car, onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [destination, setDestination] = useState('');
  const [phoneNumber1, setPhoneNumber1] = useState('');
  const [phoneNumber2, setPhoneNumber2] = useState('');
  const [countryCode, setCountryCode] = useState('+1'); // Default to US
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingMessage('Hold on, booking is being registered...');

    try {
      const bookingData = {
        carId: car.id,
        carName: car.carName,
        carType: car.carType,
        startDate,
        startTime,
        endDate,
        endTime,
        destination,
        phoneNumber1,
        phoneNumber2,
        countryCode,
        email,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'RentalBookings'), bookingData);
      setSuccess('Success! Booking has been successfully registered. Our team will get in touch with you shortly.');
      
      // Clear form fields
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setDestination('');
      setPhoneNumber1('');
      setPhoneNumber2('');
      setEmail('');

      // Close the modal after 5 seconds
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 5000);
    } catch (error) {
      setError('Error: Failed to register booking. Please try again.');
    } finally {
      setLoadingMessage('');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="modal-content bg-[#9b2f2f] p-6 rounded-lg w-11/12 max-w-lg overflow-y-auto" style={{ maxHeight: '80vh' }}>
        <span 
          className="close text-white cursor-pointer" 
          onClick={onClose} 
          style={{ fontSize: '2rem' }} // Increase the size to 2rem
        >
          &times;
        </span>
        <h2 className="text-white text-2xl mb-4">Rent {car.carName}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="flex mb-4">
            <div className="flex-1 mr-2">
              <label className="text-white">Rental Start Date</label>
              <input type="date" required className="w-full p-2 rounded bg-white" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex-1 ml-2">
              <label className="text-white">Rental Start Time</label>
              <input type="time" required className="w-full p-2 rounded bg-white" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>

          <div className="flex mb-4">
            <div className="flex-1 mr-2">
              <label className="text-white">Rental Finish Date</label>
              <input type="date" required className="w-full p-2 rounded bg-white" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex-1 ml-2">
              <label className="text-white">Rental Finish Time</label>
              <input type="time" required className="w-full p-2 rounded bg-white" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <label className="text-white">Destination</label>
          <input type="text" placeholder="Rental Destination" required className="mb-4 w-full p-2 rounded bg-white" value={destination} onChange={(e) => setDestination(e.target.value)} />

          <label className="text-white">Phone Number</label>
          <div className="flex mb-4">
            <select className="p-2 rounded-l bg-white" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
              <option value="+237">+237 (Cameroon)</option>
              <option value="+1">+1 (USA)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+234">+234 (Nigeria)</option>
              <option value="+1">+1 (Canada)</option>
              <option value="">Custom Code</option>
            </select>
            <input type="text" placeholder="Country Code (if custom)" className="w-1/3 p-2 rounded bg-white" onChange={(e) => setCountryCode(e.target.value)} />
            <input type="text" placeholder="Phone Number 1" required className="w-full p-2 rounded-r bg-white" value={phoneNumber1} onChange={(e) => setPhoneNumber1(e.target.value)} />
          </div>

          <label className="text-white">Phone Number 2 (optional)</label>
          <input type="text" placeholder="Phone Number 2" className="mb-4 w-full p-2 rounded bg-white" value={phoneNumber2} onChange={(e) => setPhoneNumber2(e.target.value)} />

          <label className="text-white">Email (optional)</label>
          <input type="email" placeholder="Email" className="mb-4 w-full p-2 rounded bg-white" value={email} onChange={(e) => setEmail(e.target.value)} />
          <br />

          {loadingMessage && <p className="text-yellow-200">{loadingMessage}</p>}
          {error && <p className="text-red-200">{error}</p>}
          {success && <h5 className="text-green-200">{success}</h5>}
          <br />
          <button type="submit" className="w-full bg-white text-[#9b2f2f] p-2 rounded">Create Booking</button>
          <br />
        </form>
        <br />
        <br />       
      </div>
    </div>
  );
};

export default BookingModal;