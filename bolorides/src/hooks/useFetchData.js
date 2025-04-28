import { useState, useEffect } from 'react';
import { db } from '@/app/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const useFetchData = (collectionName, userId) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (!userId) {
                    setError('No user ID provided.');
                    return;
                }

                const collectionRef = collection(db, collectionName);
                const q = query(collectionRef, where("userId", "==", userId));
                const querySnapshot = await getDocs(q);

                const results = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setData(results);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [collectionName, userId]);

    return { data, loading, error };
};

export default useFetchData;
