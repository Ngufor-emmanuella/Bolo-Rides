import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const UserCars = ({ userId, onCarClick, activeCarId }) => {
    const [cars, setCars] = useState([]);

    useEffect(() => {
        const fetchCars = async () => {
            const carsCollection = collection(db, 'Cars');
            const carsSnapshot = await getDocs(carsCollection);
            const userCars = carsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(car => car.userId === userId);
            setCars(userCars);
        };

        fetchCars();
    }, [userId]);

    return (
        <ul className="ml-4 admin-cars space-y-2">
            {cars.length > 0 ? (
                cars.map(car => (
                    <li key={car.id}>
                        <button
                            className={`text-left w-full p-2 rounded transition-colors duration-300 ${activeCarId === car.id ? 'bg-[#9b2f2f] text-white' : 'bg-blue-500 text-white'}`}
                            onClick={() => onCarClick(car.id, car.carName)} 
                        >
                            {car.carName}
                        </button>
                    </li>
                ))
            ) : (
                <p className="text-center text-gray-500">No cars found for this user.</p>
            )}
        </ul>
    );
};

export default UserCars;