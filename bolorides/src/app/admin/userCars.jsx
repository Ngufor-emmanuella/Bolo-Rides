import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { collection, getDocs } from 'firebase/firestore';
import UserReports from './userReports'; 

const UserCars = ({ userId }) => {
    const [cars, setCars] = useState([]);

    useEffect(() => {
        const fetchCars = async () => {
            const carsCollection = collection(db, 'Cars');
            const carsSnapshot = await getDocs(carsCollection);
            const userCars = carsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(car => car.userId === userId); // Filter cars by userId
            setCars(userCars);
        };

        fetchCars();
    }, [userId]);

    return (
        <div>
            {cars.length > 0 ? (
                cars.map(car => (
                    <div key={car.id} className="ml-4">
                        <h3>{car.carName}</h3>
                        <UserReports carId={car.id} /> {/* Render UserReports for each car */}
                    </div>
                ))
            ) : (
                <p>No cars found for this user.</p>
            )}
        </div>
    );
};

export default UserCars;