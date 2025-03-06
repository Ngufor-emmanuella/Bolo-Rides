'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';


export default function DashboardPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  if (!user) {
    router.push('/Sign-up'); 
    return null; 
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h2>Cars Dashboard</h2>
      <p className="text-lg">Welcome, {user.email}!</p> 
      <p className="text-md">Bolo Rides car services</p>
      <button onClick={() => {
        signOut(auth);
        router.push('/'); 
      }}>
        Log out
      </button>
    

    </main>
  );
}