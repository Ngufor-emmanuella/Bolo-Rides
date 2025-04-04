'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { collection, getDocs } from 'firebase/firestore';
import UserCars from './UserCars';
import UserReports from './UserReports';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [selectedCarId, setSelectedCarId] = useState(null);
    const [selectedCarName, setSelectedCarName] = useState('');
    const [selectedUserName, setSelectedUserName] = useState('');
    const [showReports, setShowReports] = useState(false);
    const [reports, setReports] = useState([]);

    const supremeAdminId = process.env.NEXT_PUBLIC_SUPREME_ADMIN_ID;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, 'Users');
                const usersSnapshot = await getDocs(usersCollection);
                const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setUsers(usersList);
                const allAdmins = usersList.filter(user => user.role === 'admin' || user.role === 'supreme');
                setAdmins(allAdmins.sort((a, b) => (a.role === 'supreme' ? -1 : 1)));

                const loggedInUser = usersList.find(user => user.id === supremeAdminId);
                if (loggedInUser) {
                    setCurrentUser(loggedInUser);
                }
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleUserClick = (userId) => {
        setExpandedUserId(expandedUserId === userId ? null : userId);
        setSelectedCarId(null);
        setShowReports(false); 
        setReports([]);
    };

    const handleCarClick = (carId, carName, userName) => {
        setSelectedCarId(carId);
        setSelectedCarName(carName);
        setSelectedUserName(userName);
        setShowReports(false); 
    };

    const fetchReports = async (carId) => {
        const reportsCollection = collection(db, 'DailyReports');
        const reportsSnapshot = await getDocs(reportsCollection);
        const userReports = reportsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(report => report.carId === carId); 

        setReports(userReports);
    };

    const handleViewReports = async () => {
        if (selectedCarId) {
            await fetchReports(selectedCarId);
            setShowReports(prev => !prev); 
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="flex">
            <aside className={`transition-all duration-300 ${showReports ? 'w-1/5' : 'w-1/4'} bg-gray-200 p-4`}>
                <h1 className="text-2xl mb-4">Dashboard</h1>
                <h3 className="text-xl mb-2">Admins</h3>
                {admins.map(admin => (
                    <div key={admin.id} className="mb-2">
                        <span>{admin.name} ({admin.email})</span>
                    </div>
                ))}
                
                <h3 className="text-xl mb-2">Users</h3>
                {users.map(user => (
                    <div key={user.id} className="mb-2">
                        <button onClick={() => handleUserClick(user.id)} className="w-full text-left">
                            {user.name} ({user.email})
                        </button>
                        {expandedUserId === user.id && (
                            <UserCars 
                                userId={user.id} 
                                onCarClick={(carId, carName) => handleCarClick(carId, carName, user.name)} 
                                activeCarId={selectedCarId} 
                            />
                        )}
                    </div>
                ))}
            </aside>

            <main className="flex-1 p-4">
                <h1 className="text-2xl mb-4">Admin Dashboard</h1>
                {currentUser && <h2 className="text-xl mb-4">Welcome, {currentUser.name}!</h2>}
                
                {selectedCarId && (
                    <div>
                        <h2 className="text-xl mb-4">Actions for Selected Car: {selectedUserName} ; {selectedCarName}</h2>
                        <button
                            onClick={handleViewReports}
                            className="bg-green-500 text-white p-2 rounded"
                        >
                            {showReports ? 'Hide All Transactions' : 'View All Transactions'}
                        </button>
                        {showReports && <UserReports reports={reports} />}
                    </div>
                )}

                {message && <div className="mt-4 p-2 bg-green-200 text-green-800 rounded">{message}</div>}
            </main>
        </div>
    );
};

export default AdminDashboard;