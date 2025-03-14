'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/assets/bolo-logo1.jpeg';

export default function HomePage() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="h-screen w-full mx-0 px-0 background-image relative flex flex-col">
      <div className="absolute inset-0 overlay flex flex-col justify-center items-center p-6">
        <h1 className="text-white text-4xl font-bold text-center mb-6">Welcome to Bolo Rides!</h1>
        <h2 className="text-white text-3xl font-bold text-center mb-6">BOLO CAR RENTALS</h2>
        <h2 className="text-white text-3xl font-bold text-center mb-6">SERVICES -</h2>
        <h5 className="text-white text-2xl font-bold text-center mb-8">THE BEST CAR RENTALS IN CAMEROON!</h5>
        <Link className="btn btn-white inline-block mb-8" href="/contact">Book Us Now</Link>
     </div>

      {/* Cards */}

      <div className="relative top-full mb-5 flex-1">
  <div className="flex justify-center flex-1 -mt-20 ">
    <div className="card w-52 bg-white shadow-xl mx-4 flex flex-col items-center justify-center rounded-lg">
      <figure className="w-full">
        <Image
          src={logo}
          alt="Card Image"
          width={100}
          height={48}
          className="object-cover mx-auto"
        />
      </figure>
      <div className="card-body text-center p-4">
        <h2 className="card-title">
          <a href="#" className="home-card">Best prices <br /> & offers</a>
        </h2>
        <p>Get the best deals!</p>
      </div>
    </div>

    <div className="card w-52 bg-white shadow-xl mx-4 flex flex-col items-center justify-center rounded-lg">
      <figure className="w-full">
        <Image
          src={logo}
          alt="Card Image"
          width={100}
          height={48}
          className="object-cover mx-auto"
        />
      </figure>
      <div className="card-body text-center p-4">
        <h2 className="card-title">
          <a href="#" className="home-card">Free <br /> delivery</a>
        </h2>
        <p>Delivered right to your door!</p>
      </div>
    </div>

    <div className="card w-52 bg-white shadow-xl mx-4 flex flex-col items-center justify-center rounded-lg">
      <figure className="w-full">
        <Image
          src={logo}
          alt="Card Image"
          width={100}
          height={48}
          className="object-cover mx-auto"
        />
      </figure>
      <div className="card-body text-center p-4">
        <h2 className="card-title">
          <a href="#" className="home-card">Great Daily <br /> Deals</a>
        </h2>
        <p>Check out our daily offers!</p>
      </div>
    </div>

    <div className="card w-52 bg-white shadow-xl mx-4 flex flex-col items-center justify-center rounded-lg">
      <figure className="w-full">
        <Image
          src={logo}
          alt="Card Image"
          width={100}
          height={48}
          className="object-cover mx-auto"
        />
      </figure>
      <div className="card-body text-center p-4">
        <h2 className="card-title">
          <a href="#" className="home-card">We Offer Wide <br /> Assortment</a>
        </h2>
        <p>Explore our vast collection!</p>
      </div>
    </div>

    <div className="card w-52 bg-white shadow-xl mx-4 flex flex-col items-center justify-center rounded-lg">
      <figure className="w-full">
        <Image
          src={logo}
          alt="Card Image"
          width={100}
          height={48}
          className="object-cover mx-auto"
        />
      </figure>
      <div className="card-body text-center p-4">
        <h2 className="card-title">
          <a href="#" className="home-card">Secure Easy <br /> Returns</a>
        </h2>
        <p>Return with ease!</p>
      </div>
    </div>
  </div>
     </div>

     {/* objectives */}
     <div className="relative top-full mb-5 flex-1">
  <div className="flex justify-center flex-1 -mt-20 ">
    {/* Cards here */}
    <br></br>

  </div>
  <br></br>

  <div className="flex justify-between p-15">
    <div className="w-1/2">
      <h2 className="text-2xl font-bold mb-4">Our Mission
        <br></br>
        &quot; Empowering Freedom on the Road &quot;
      </h2>
      <br></br>
      <p className="text-lg">
      At Bolo Rides, our mission is to provide seamless, reliable, and personalized car rental experiences that unlock the freedom to explore. We are dedicated to delivering exceptional service, ensuring every journey is memorable, safe, and enjoyable. With a focus on quality, innovation, and customer satisfaction, we strive to be the trusted partner for all your travel needs
      </p>
    </div>

    <div className="w-1/2">
  <h2 className="text-2xl font-bold mb-8"> Our Vision
    <br></br>
    &quot; Transforming Travel, Enriching Lives &quot;
  </h2>
  <p className="text-lg">
    Our vision is to revolutionize the car rental industry by setting new standards in convenience, sustainability, and customer delight. We envision a future where every traveler can experience the thrill of exploration with ease, comfort, and peace of mind. By fostering a culture of innovation, inclusivity, and excellence, we aim to be the global leader in car rental services, making every journey a remarkable one.
  </p>
   </div>

  </div>
</div>
    
    </div>
  );
}
