'use client'
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/assets/bolo-logo1.jpeg';

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user] = useAuthState(auth);
  const router = useRouter();

  const handleLogout = () => {
    signOut(auth);
    router.push('/'); // Redirect after logout
  };

  return (
    <header className="p-2 sm:p-2 flex items-center justify-between gap-4">
      <div className="flex items-center gap-1">
        <Image src={logo} alt="Logo" width={100} height={100} />
        <h1 className="logo-header text-base sm:text-lg">
          <Link href="/">Bolo Rides</Link>
        </h1>
      </div>
      <div className="accounts relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)} 
          className="px-4 py-2 rounded"
        >
          User Accounts
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
            {!user ? (
              <>
                <a href="/Sign-in" className="account-details block px-4 py-2 hover:bg-gray-100">Sign In</a>
                <a href="/Sign-up" className="account-details block px-4 py-2 hover:bg-gray-100">Sign Up</a>
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
