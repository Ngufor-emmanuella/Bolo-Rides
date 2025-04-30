'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Slider images array
  const sliderImages = [
    '/assets/prado-round.jpeg',
    '/assets/tesla-front.jpeg',
    '/assets/prado.jpeg',
    '/assets/prado2.jpeg',
    '/assets/prado-white.jpeg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Define titles and descriptions for the first group of cards
  const firstGroupTitles = [
    "Affordable Prices",
    "Free Delivery with our experienced drivers ensuring a safe and pleasant journey every time.",
    "Great Daily Deals",
    "Wide Assortment",
  ];

  const firstGroupDescriptions = [
    "Get the best deals on car rentals!",
    "Delivered right to your door!",
    "Check out our daily offers!",
    "Explore our vast collection of vehicles and other services!",
  ];

  const firstGroupImages = [
    '/assets/affordable-prices.jpeg',
    '/assets/delivery.jpeg',
    '/assets/great-deals.jpeg',
    '/assets/flexible-rental.jpg',
  ];

  // Define titles and descriptions for the second group of cards
  const secondGroupTitles = [
    "24/7 Customer Support",
    "Easy Booking",
    "Flexible Rental Options",
    "Wide Range of Vehicles",
  ];

  const secondGroupDescriptions = [
    "Message us on Facebook or call us to schedule your ride.",
    "Our team is here to assist you at any time.",
    "Choose from a variety of rental options to fit your needs.",
    "We offer cars for every budget and occasion.",
  ];

  const secondGroupImages = [
    '/assets/groups-transport.jpeg',
    '/assets/book-now.jpeg',
    '/assets/good-prices.jpeg',
    '/assets/flexible-rental.jpg',
  ];

  return (
    <div className="h-screen w-full mx-0 px-0 flex flex-col relative">
      <div className="relative flex flex-col justify-center items-center p-6">
        <Image
          src={sliderImages[currentIndex]}
          alt={`Slider Image ${currentIndex + 1}`}
          layout="fill"
          objectFit="contain"
          className="absolute inset-0 z-0"
        />
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <div className="relative z-20 text-center mt-20">
          <h1 className="header-text text-white text-3xl md:text-4xl font-bold mb-4">Welcome to Bolo Rides!</h1>
          <h2 className="header-text text-white text-2xl md:text-3xl font-bold mb-4">BOLO CAR RENTALS</h2>
          <h5 className="header-add text-white text-lg md:text-xl font-bold mb-6">THE BEST CAR RENTALS IN CAMEROON!</h5>

          <div className="relative">
          <Link className="header-btn inline-block mb-6" href="/bookingsPage">Book Us Now!!</Link>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-20">
                {!user ? (
                  <>
                    <Link href="/signin" className="block px-4 py-2 hover:bg-gray-100">Sign In</Link>
                    <Link href="/signup" className="block px-4 py-2 hover:bg-gray-100">Sign Up</Link>
                  </>
                ) : (
                  <button 
                    onClick={() => { /* Handle logout logic */ }} 
                    className="w-full text-left block px-4 py-2 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* First Group of Cards */}
      <div className="flex flex-wrap justify-center mb-5">
        {firstGroupTitles.map((title, index) => (
          <div key={index} className="card w-full sm:w-1/2 md:w-1/5 bg-white shadow-xl mx-2 my-2 flex flex-col items-center justify-center rounded-lg">
            <figure className="w-full">
              <Image
                src={firstGroupImages[index]}
                alt="Card Image"
                width={100}
                height={48}
                className="object-cover mx-auto"
              />
            </figure>
            <div className="card-body text-center p-4">
              <h2 className="card-title text-lg md:text-xl">
                <a href="#" className="home-card">{title}</a>
              </h2>
              <p className="text-sm md:text-base">{firstGroupDescriptions[index]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Objectives Section */}
      <div className="flex flex-col md:flex-row justify-center p-5 mt-10 mb-5 w-full">
        <div className="objectives w-full md:w-4/10 mb-4 md:mb-0 md:mr-12 flex flex-col items-center">
          <div className="flex md:flex-row justify-center p-5 mt-5 ">
            <Image src="/assets/mission.jpeg" alt="Mission" width={70} height={70} />
            <h2 className="text-2xl font-bold mb-4 ml-3">Our Mission</h2>
          </div>
          <p className="text-lg">
            At Bolo Rides, our mission is to provide seamless, reliable, and personalized car rental experiences that unlock the freedom to explore.
          </p>
        </div>
        <div className="objectives w-full md:w-4/10 mb-4 md:mb-0 md:mr-12 flex flex-col items-center">
          <div className="flex md:flex-row justify-center p-5 mt-5">
            <Image src="/assets/vision.jpeg" alt="Vision" width={50} height={50} />
            <h2 className="text-2xl font-bold mb-4 ml-3">Our Vision</h2>
          </div>
          <p className="text-lg">
            Our vision is to revolutionize the car rental industry by setting new standards in convenience, sustainability, and customer delight.
          </p>
        </div>
      </div>

      {/* About Section */}
      <div className="objectives text-center p-5 mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Reliable Ride Across Cameroon!</h2>
        <p className="text-lg">
          Whether you’re heading across town or traveling to a special event, BoloRides offers safe, comfortable, and affordable transportation. We pride ourselves on delivering top-notch service throughout Douala, Yaounde, and beyond.
        </p>
        <hr className="mt-10" />
      </div>

      {/* Second Group of Cards */}
      <h2 className="text-center text-2xl font-bold mb-4">Why We Are The Best</h2>
      <div className="flex justify-center flex-wrap mb-5">
        {secondGroupTitles.map((title, index) => (
          <div key={index} className="card w-52 md:w-60 bg-white shadow-xl mx-4 my-2 flex flex-col items-center justify-center rounded-lg">
            <figure className="w-full">
              <Image
                src={secondGroupImages[index]}
                alt="Card Image"
                width={100}
                height={48}
                className="object-cover mx-auto"
              />
            </figure>
            <div className="card-body text-center p-4">
              <h2 className="card-title text-lg md:text-xl">
                <a href="#" className="home-card">{title}</a>
              </h2>
              <p className="text-sm md:text-base">{secondGroupDescriptions[index]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Image Slider Section */}
      <div className="objectives relative p-5">
        <h4 className="text-center text-xl font-bold mb-4">A Glimpse Of Our Cars</h4>
        <div className="flex justify-center">
          <div className="flex-none w-2/5 mx-2"> 
            <Image
              src={sliderImages[currentIndex]}
              alt={`Slider Image ${currentIndex + 1}`}
              width={100}
              height={48}
              className="object-cover w-full h-auto rounded-lg" 
            />
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="objectives text-center p-5">
        <h2 className="about-welcome"><strong>Join Bolo Ride Today!</strong></h2>
        <p className="text-lg">
          <strong className="about-header">Book Your Ride?</strong>
          Message us on Facebook or call <strong>+237 652 921000</strong> to book your next trip with BoloRides.
        </p>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#9b2f2f] text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center md:justify-between">
            {/* Logo and Address */}
            <div className="w-full md:w-1/4 mb-6 text-center md:text-left">
              <Link href="/">
                <Image
                  src="/assets/bolo-logo1.jpeg"
                  alt="Bolo Rides Logo"
                  width={100}
                  height={100}
                  priority
                  className="mb-4 rounded-[15px]"
                />
              </Link>
              <p className="flex items-center justify-center md:justify-start">
                <span>Douala, Inbetween total Bonateki & Pharmacy Akwa Nord</span>
              </p>
            </div>

            {/* Company Links */}
            <div className="w-full md:w-1/4 mb-6 text-center">
              <h5 className="text-lg font-semibold mb-3">BOLO Rides Company</h5>
              <ul className="footer-list">
                <li><Link href="/about" className="hover:underline">About Us</Link></li>
                <li><Link href="/bookingsPage" className="hover:underline">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:underline">Terms & Conditions</Link></li>
                <li className="flex items-center justify-center md:justify-start">
                  <strong>Call Us:
                  <span> +237 652921000 / 693333940</span>
                  </strong>
                </li>
              </ul>
            </div>

            {/* Account Links */}
            <div className="w-full md:w-1/4 mb-6 text-center">
              <h4 className="text-lg font-semibold mb-3">Account</h4>
              <ul className="footer-list">
                <li><Link href="/signin" className="hover:underline">Sign In</Link></li>
                <li className="flex items-center justify-center md:justify-start">
                  <strong>Email:</strong>
                  <span> BoloRides.com</span>
                </li>
                <li className="flex items-center justify-center md:justify-start">
                  <strong>Hours:
                  <span>8:00 - 21:00, Mon - Sat</span>
                  </strong>
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div className="w-full md:w-1/4 mb-6 text-center">
              <h4 className="text-lg font-semibold mb-3">Follow Us</h4>
              <ul className="flex justify-center space-x-4">
                <li>
                  <Link href="#">
                    <Image
                      src="/assets/facebook.jpeg"
                      alt="Facebook"
                      width={25}
                      height={25}
                      className="brown-icon"
                    />
                  </Link>
                </li>
                <li>
                  <Link href="#">
                    <Image
                      src="/assets/instagram.jpeg"
                      alt="Instagram"
                      width={25}
                      height={25}
                      className="brown-icon"
                    />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-10">
            <h6 className="text-sm">Copyright 2025 © Bolo Rides... All rights reserved.</h6>
          </div>
        </div>
      </footer>
    </div>
  );
}