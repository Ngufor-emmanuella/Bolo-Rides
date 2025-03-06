'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h2>Welcome to Bolo Rides!</h2>
      {/* Additional content can go here */}
    </main>
  );
}