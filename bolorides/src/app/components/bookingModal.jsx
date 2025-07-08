'use client';

import React, { useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import ReCAPTCHA from 'react-google-recaptcha'; // Correct import for reCAPTCHA

const BookingModal = ({ car, onClose }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    destination: '',
    phoneNumber1: '',
    phoneNumber2: '',
    countryCode: '+237',
    email: '',
    name: '',
  });
  const [loadingMessage, setLoadingMessage] = useState('');
  const [feedback, setFeedback] = useState({ error: '', success: '' });
  const [recaptchaToken, setRecaptchaToken] = useState(null); // State to hold the reCAPTCHA token
  const recaptchaRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCaptchaChange = (token) => {
    setRecaptchaToken(token); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!recaptchaToken) { // Check if the reCAPTCHA token is present
      setFeedback({ error: 'Please verify that you are a human.', success: '' });
      return;
    }

    setLoadingMessage('Hold on, booking is being registered...');

    try {
      const bookingData = {
        ...formData,
        carId: car.id,
        carName: car.carName,
        carType: car.carType,
        createdAt: new Date(),
      };

      // Save booking data to Firestore
      await addDoc(collection(db, 'RentalBookings'), bookingData);

      // Submit data to Formspree
      const response = await fetch('https://formspree.io/f/xovdqbpd', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...bookingData, recaptchaToken }), 
      });

      if (response.ok) {
        setFeedback({ success: 'Booking successfully registered!', error: '' });
      } else {
        throw new Error('Failed to submit to Formspree');
      }

      // Reset form fields
      setFormData({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        destination: '',
        phoneNumber1: '',
        phoneNumber2: '',
        email: '',
        name: '',
        countryCode: '+237',
      });
      setRecaptchaToken(null); 

      setTimeout(() => {
        setFeedback({ ...feedback, success: '' });
        onClose();
      }, 5000);
    } catch (error) {
      console.error("Error saving booking:", error);
      setFeedback({ error: 'Failed to register booking. Please try again.', success: '' });
    } finally {
      setLoadingMessage('');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="modal-content bg-[#9b2f2f] p-6 rounded-lg w-11/12 max-w-lg overflow-y-auto" style={{ maxHeight: '80vh' }}>
        <span className="close text-white cursor-pointer" onClick={onClose} style={{ fontSize: '2rem' }}>&times;</span>
        <h2 className="text-white text-2xl mb-4">Rent {car.carName}</h2>

        <form onSubmit={handleSubmit}> 
          <div className="flex mb-4">
            <div className="flex-1 mr-2">
              <label className="text-white">Rental Start Date</label>
              <input type="date" name="startDate" required className="w-full p-2 rounded bg-white" value={formData.startDate} onChange={handleChange} />
            </div>
            <div className="flex-1 ml-2">
              <label className="text-white">Rental Start Time</label>
              <input type="time" name="startTime" required className="w-full p-2 rounded bg-white" value={formData.startTime} onChange={handleChange} />
            </div>
          </div>

          <div className="flex mb-4">
            <div className="flex-1 mr-2">
              <label className="text-white">Rental Finish Date</label>
              <input type="date" name="endDate" required className="w-full p-2 rounded bg-white" value={formData.endDate} onChange={handleChange} />
            </div>
            <div className="flex-1 ml-2">
              <label className="text-white">Rental Finish Time</label>
              <input type="time" name="endTime" required className="w-full p-2 rounded bg-white" value={formData.endTime} onChange={handleChange} />
            </div>
          </div>

          <label className="text-white">Destination</label>
          <input type="text" name="destination" placeholder="Rental Destination" required className="mb-4 w-full p-2 rounded bg-white" value={formData.destination} onChange={handleChange} />

          <label className="text-white">Phone Number</label>
          <div className="flex mb-4">
            <select name="countryCode" className="p-2 rounded-l bg-white" value={formData.countryCode} onChange={handleChange}>
              <option value="+237">+237 (Cameroon)</option>
              <option value="+1">+1 (USA)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+234">+234 (Nigeria)</option>
              <option value="+1">+1 (Canada)</option>
              <option value="">Custom Code</option>
            </select>
            <input 
              type="text" 
              placeholder="Phone Number 1" 
              name="phoneNumber1" 
              required 
              className="w-full p-2 rounded-r bg-white" 
              value={formData.phoneNumber1} 
              onChange={handleChange} 
              pattern="\d*" // Only accept numbers
            />
          </div>

          <label className="text-white">Phone Number 2 (optional)</label>
          <input 
            type="text" 
            name="phoneNumber2" 
            placeholder="Phone Number 2" 
            className="mb-4 w-full p-2 rounded bg-white" 
            value={formData.phoneNumber2} 
            onChange={handleChange} 
            pattern="\d*" // Only accept numbers
          />

          <label className="text-white">Email (optional)</label>
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            className="mb-4 w-full p-2 rounded bg-white" 
            value={formData.email} 
            onChange={handleChange} 
          />

          <label className="text-white">Name</label>
          <input 
            type="text" 
            name="name" 
            placeholder="Name" 
            className="mb-4 w-full p-2 rounded bg-white" 
            value={formData.name} 
            onChange={handleChange} 
          />
          <br></br>

          {loadingMessage && <p className="text-yellow-200">{loadingMessage}</p>}
          {feedback.error && <p className="text-red-200">{feedback.error}</p>}
          {feedback.success && <h5 className="text-green-200">{feedback.success}</h5>}
          
          <ReCAPTCHA 
            ref={recaptchaRef} 
            sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY} 
            onChange={handleCaptchaChange} 
          />

          <button type="submit" className="w-full bg-white text-[#9b2f2f] p-2 rounded">Create Booking</button>
          <br></br>
          <br></br>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;