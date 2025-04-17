'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/assets/bolo-logo1.jpeg';

export default function HomePage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Slider images array
  const sliderImages = [
    logo,
    logo,
    logo,
    logo,
    logo
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
    "Free Delivery",
    "Great Daily Deals",
    "Wide Assortment",
    "Secure and Easy Return"
  ];

  const firstGroupDescriptions = [
    "Get the best deals on car rentals!",
    "Delivered right to your door!",
    "Check out our daily offers!",
    "Explore our vast collection of vehicles and other services!",
    "Our experienced drivers ensure a safe and pleasant journey every time."
  ];

  const firstGroupImages = [
    logo,
    logo,
    logo,
    logo,
    logo
  ];

  // Define titles and descriptions for the second group of cards
  const secondGroupTitles = [
    "24/7 Customer Support",
    "Easy Booking",
    "Flexible Rental Options",
    "Wide Range of Vehicles",
    "Event & Group Transportation"
  ];

  const secondGroupDescriptions = [
    "Message us on Facebook or call us to schedule your ride.",
    "Our team is here to assist you at any time.",
    "Choose from a variety of rental options to fit your needs.",
    "We offer cars for every budget and occasion.",
    "Get great value with our competitive prices!"
  ];

  const secondGroupImages = [
    logo,
    logo,
    logo,
    logo,
    logo
  ];

  return (
    <div className="h-screen w-full mx-0 px-0 background-image flex flex-col">
      <div className="overlay flex flex-col justify-center items-center p-6">
        <h1 className="header-text text-white text-4xl font-bold text-center mb-6">Welcome to Bolo Rides!</h1>
        <h2 className="header-text text-white text-3xl font-bold text-center mb-6">BOLO CAR RENTALS</h2>
        <h5 className="header-add text-white text-2xl font-bold text-center mb-8">THE BEST CAR RENTALS IN CAMEROON!</h5>
        
        <Link className="header-btn btn btn-white inline-block mb-8" href="/bookingsPage">Book Us Now!!</Link>
      </div>

      {/* First Group of Cards */}
      <div className="flex justify-center flex-wrap mb-5">
        {firstGroupTitles.map((title, index) => (
          <div key={index} className="card w-52 bg-white shadow-xl mx-4 my-2 flex flex-col items-center justify-center rounded-lg">
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
              <h2 className="card-title">
                <a href="#" className="home-card">{title}</a>
              </h2>
              <p>{firstGroupDescriptions[index]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Objectives Section */}
      <div className="flex flex-col md:flex-row justify-center p-5 mt-10 mb-5 w-full">
          <div className="objectives w-full md:w-4/10 mb-4 md:mb-0 md:mr-12 h-34 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4" style={{ fontSize: '25px' }}>Our Mission</h2>
            <p className="text-lg" style={{ fontSize: '20px' }}>
              At Bolo Rides, our mission is to provide seamless, reliable, and personalized car rental experiences that unlock the freedom to explore.
            </p>
          </div>
          <div className="objectives w-full md:w-4/10 mb-4 md:mb-0 md:mr-12 h-34 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4" style={{ fontSize: '25px' }}>Our Vision</h2>
            <p className="text-lg" style={{ fontSize: '20px' }}>
              Our vision is to revolutionize the car rental industry by setting new standards in convenience, sustainability, and customer delight.
            </p>
          </div>
      </div>

      {/* About Section */}
      <div className="objectives text-center p-5 mb-8">
        <h2 className=" text-2xl font-bold mb-4" style={{ fontSize: '25px' }}>Your Reliable Ride Across Cameroon!</h2>
        <p className="text-lg" style={{ fontSize: '20px' }}>
          Whether you’re heading across town or traveling to a special event, BoloRides offers safe, comfortable, and affordable transportation. We pride ourselves on delivering top-notch service throughout Douala, Yaounde, and beyond.
        </p>
        <hr  className="mt-10"></hr>
      </div>

      {/* Second Group of Cards */}
      <h2 className="text-center text-2xl font-bold mb-4">Why We Are The Best</h2>
      <div className="flex justify-center flex-wrap mb-5">
        {secondGroupTitles.map((title, index) => (
          <div key={index} className="card w-52 bg-white shadow-xl mx-4 my-2 flex flex-col items-center justify-center rounded-lg">
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
              <h2 className="card-title">
                <a href="#" className="home-card">{title}</a>
              </h2>
              <p>{secondGroupDescriptions[index]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Image Slider Section */}
      <div className="objectives relative p-5">
        <h4 className="text-center text-xl font-bold mb-4">A Glimpse Of Our Cars</h4>
        <div className="flex justify-center">
          <div className="flex-none w-60 mx-2">
            <Image src={sliderImages[currentIndex]} alt={`Slider Image ${currentIndex + 1}`} className="object-cover w-full h-40 rounded-lg" />
            <p className="text-center mt-2">Caption for Image {currentIndex + 1}</p>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="objectives text-center p-5">
        <h2 className="about-welcome">Join Bolo Ride Today!</h2>
        <p className="text-lg" style={{ fontSize: '20px' }}>
          <strong className="about-header">Book Your Ride? </strong>
          Message us on Facebook or call <strong>+237 652 921000</strong> to book your next trip with BoloRides.
        </p>
      </div>
      
      {/* Footer */}

      <footer className="footer bg-gray-800 text-white">
          <section className="py-10">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-between">
                <div className="w-full md:w-1/4 mb-6">
                  <div className="widget-about text-md mb-4">
                    <div className="logo mb-6">
                      <Link href="index.html">
                        <Image
                          src="/images/bolo-logo1.jpeg"
                          alt="logo"
                          width={500}
                          height={300}
                          priority
                          className="mb-4"
                        />
                      </Link>
                    </div>
                    <ul className="contact-info">
                      <li className="flex items-center">
                        <Image
                          src="/images/brown.jpeg"
                          alt="brown round icon"
                          width={20}
                          height={20}
                          className="mr-2"
                        />
                        <strong>Address:</strong>
                        <span> Douala, Inbetween total Bonateki and Pharmacy Akwa Nord</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="footer-link-widget w-full md:w-1/4 mb-6">
                  <h4 className="widget-title text-lg font-semibold mb-3">Company</h4>
                  <ul className="footer-list">
                    <li><Link href="/about" className="hover:underline">About Us</Link></li>
                    <li><Link href="/contact" className="hover:underline">Contact Us</Link></li>
                    <li><Link href="#" className="hover:underline">Delivery Information</Link></li>
                    <li><Link href="#" className="hover:underline">Terms &amp; Conditions</Link></li>
                    <li className="flex items-center">
                      <Image
                        src="/images/brown.jpeg"
                        alt="brown round icon"
                        width={20}
                        height={20}
                        className="mr-2"
                      />
                      <strong>Call Us:</strong>
                      <span> +237 652921000 / 693333940</span>
                    </li>
                  </ul>
                </div>

                <div className="footer-link-widget w-full md:w-1/4 mb-6">
                  <h4 className="widget-title text-lg font-semibold mb-3">Account</h4>
                  <ul className="footer-list">
                    <li><Link href="/signup" className="hover:underline">Sign In</Link></li>
                   
                    <li className="flex items-center">
                      <Image
                        src="/images/brown.jpeg"
                        alt="brown round icon"
                        width={20}
                        height={20}
                        className="mr-2"
                      />
                      <strong>Email:</strong>
                      <span> BoloRides.com</span>
                    </li>
                    <li className="flex items-center">
                      <Image
                        src="/images/brown.jpeg"
                        alt="brown round icon"
                        width={20}
                        height={20}
                        className="mr-2"
                      />
                      <strong>Hours:</strong>
                      <span>8:00 - 18:00, Mon - Sat</span>
                    </li>
                  </ul>
                </div>

                <div className="footer-link-widget w-full md:w-1/4 mb-6">
                  <h4 className="widget-title text-lg font-semibold mb-3">Follow Us</h4>
                  <ul className="footer-list flex space-x-4">
                    <li className="mobile-social-icon">
                      <Link href="#">
                        <Image
                          src="/images/brown.jpeg"
                          alt="brown round icon"
                          width={20}
                          height={20}
                          className="brown-icon"
                        />
                      </Link>
                    </li>
                    <li className="mobile-social-icon">
                      <Link href="#">
                        <Image
                          src="/images/brown.jpeg"
                          alt="brown round icon"
                          width={20}
                          height={20}
                          className="brown-icon"
                        />
                      </Link>
                    </li>
                    <li className="mobile-social-icon">
                      <Link href="#">
                        <Image
                          src="/images/brown.jpeg"
                          alt="brown round icon"
                          width={20}
                          height={20}
                          className="brown-icon"
                        />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center mt-10">
                <h6 className="site-copyright text-sm">Copyright 2025 © Bolo Rides... All rights reserved.</h6>
              </div>
            </div>
          </section>
      </footer>
      
    </div>
  );
}