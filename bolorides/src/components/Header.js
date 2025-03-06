'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user] = useAuthState(auth);
  const router = useRouter();

  const handleLogout = () => {
    signOut(auth);
    router.push('/'); // Redirect after logout
  };

  return (
    <header className="p-4 sm:p-8 flex items-center justify-between gap-4">
      <h1 className="text-base sm:text-lg">Bolo Rides</h1>
      <div className="relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)} 
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Menu
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
            {!user ? (
              <>
                <a href="/Sign-in" className="block px-4 py-2 hover:bg-gray-100">Sign In</a>
                <a href="/Sign-up" className="block px-4 py-2 hover:bg-gray-100">Sign Up</a>
              </>
            ) : (
              <button 
                onClick={handleLogout} 
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
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