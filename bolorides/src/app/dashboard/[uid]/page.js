'use client';
import { useState, useEffect } from 'react';
import { auth } from '@/app/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { useRouter } from 'next/navigation';

const UserDashboard = ({ params }) => {
  const [userData, setUserData] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchUid = async () => {
      const resolvedParams = await params; 
      const uid = resolvedParams.uid; 

      if (!uid) {
        console.error('UID is undefined or null');
        router.push('/Sign-in'); 
        return;
      }

      const fetchUserData = async () => {
        try {
          const docRef = doc(db, 'Users', uid); 
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            router.push('/Sign-up');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();
    };
    
    fetchUid();
  }, [params, router]);

  return (
    <div>
      <h1>Welcome to your dashboard, {userData.name || 'User'}</h1>
     
    </div>
  );
};

export default UserDashboard;