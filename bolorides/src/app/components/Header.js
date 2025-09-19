'use client';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user] = useAuthState(auth);
  const router = useRouter();

  const handleLogout = () => {
    signOut(auth);
    router.push('/'); 
  };

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  useEffect(() => {
    let timer;
    if (showDropdown) {
      // Set a timer to hide the dropdown after 3 seconds
      timer = setTimeout(() => {
        setShowDropdown(false);
      }, 3000);
    }

    // Clear the timer if the dropdown is closed or component unmounts
    return () => clearTimeout(timer);
  }, [showDropdown]);

  return (
    <header className="relative p-2 sm:p-2 flex items-center justify-between gap-4 z-20">
      <div className="car-logo flex items-center gap-1">
        <Image src="/assets/bolo_log.jpeg" alt="Logo" width={100} height={100} />
        <h1 className="logo-header text-base sm:text-lg">
          <Link href="/">Bolo Ridess</Link>
        </h1>
      </div>
      <div className="accounts relative">
        <button 
          onClick={toggleDropdown} 
          className="px-4 py-2 rounded"
        >
          User Accounts
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-30">
            {!user ? (
              <>
                <Link href="/Sign-in" className="account-details block px-4 py-2 hover:bg-gray-100">Sign In</Link>
                <Link href="/Sign-up" className="account-details block px-4 py-2 hover:bg-gray-100">Sign Up</Link>
              </>
            ) : (
              <button 
                onClick={handleLogout} 
                className="account-details block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Log Out
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}