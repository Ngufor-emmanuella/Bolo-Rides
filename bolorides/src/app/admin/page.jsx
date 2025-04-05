'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import UserCars from './userCars';
import UserReports from './userReports';
import MonthlyReport from './monthlyReports'; 

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
    const [viewingMonthlyReport, setViewingMonthlyReport] = useState(false); // State for monthly report visibility
    const [processing, setProcessing] = useState(false);

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
        setViewingMonthlyReport(false); // Reset monthly report visibility
    };

    const handleCarClick = (carId, carName, userName) => {
        setSelectedCarId(carId);
        setSelectedCarName(carName);
        setSelectedUserName(userName);
        setShowReports(false);
        setViewingMonthlyReport(false); // Reset monthly report visibility
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
            setViewingMonthlyReport(false); 
        }
    };

    const handleViewMonthlyReports = () => {
        setViewingMonthlyReport(prev => !prev); 
        setShowReports(false);
    };

    const promoteUserToAdmin = async (userId) => {
        setProcessing(true);
        const userRef = doc(db, 'Users', userId);
        try {
            await updateDoc(userRef, { role: 'admin' });
            const updatedUsers = users.map(user => 
                user.id === userId ? { ...user, role: 'admin' } : user
            );
            setUsers(updatedUsers);
            const newAdmin = updatedUsers.find(user => user.id === userId);
            if (newAdmin) {
                setAdmins(prev => [...prev, newAdmin]);
            }
            setMessage(`User promoted to admin successfully!`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error promoting user:', error);
            setMessage('Failed to promote user.');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setProcessing(false);
        }
    };

    const demoteUserFromAdmin = async (userId) => {
        setProcessing(true);
        const userRef = doc(db, 'Users', userId);
        try {
            await updateDoc(userRef, { role: 'user' });
            const updatedUsers = users.map(user => 
                user.id === userId ? { ...user, role: 'user' } : user
            );
            setUsers(updatedUsers);
            setAdmins(prev => prev.filter(admin => admin.id !== userId));
            setMessage(`User demoted from admin successfully!`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error demoting user:', error);
            setMessage('Failed to demote user.');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="flex">
            <aside className={`transition-all duration-300 ${showReports || viewingMonthlyReport ? 'w-1/5' : 'w-1/4'} bg-gray-200 p-4`}>
                
                {currentUser && <h1 className="text-xl mb-4">Welcome, {currentUser.name}!</h1>}
                <h3 className="text-xl mb-2">List Of All Admins</h3>
                {admins.map(admin => (
                    <div key={admin.id} className="mb-2">
                        <span>{admin.name} ({admin.email})</span>
                    </div>
                ))}
                
                <br />
                <hr />
                <br />

                <h3 className="text-xl mb-2">List Of All Users</h3>
                {users.map(user => (
                    <div key={user.id} className="mb-2">
                        <div className="flex justify-between items-center">
                            <button 
                                onClick={() => handleUserClick(user.id)} 
                                className="w-full text-left"
                            >
                                {user.name} ({user.email})
                            </button>
                            {user.role === 'user' && (
                                <button 
                                    onClick={() => promoteUserToAdmin(user.id)} 
                                    className="ml-2 bg-blue-500 text-white p-1 rounded"
                                    disabled={processing}
                                >
                                    Promote to Admin
                                </button>
                            )}
                            {user.role === 'admin' && user.id !== supremeAdminId && (
                                <button 
                                    onClick={() => demoteUserFromAdmin(user.id)} 
                                    className="ml-2 bg-red-500 text-white p-1 rounded"
                                    disabled={processing}
                                >
                                    Remove Admin
                                </button>
                            )}
                        </div>
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
                
                {selectedCarId && (
                    <div>
                        <h2 className="text-xl mb-4">Actions for Selected Car: {selectedUserName} ; {selectedCarName}</h2>
                        
                        <button
                            onClick={handleViewReports}
                            className="bg-green-500 text-white p-2 rounded mr-2"
                        >
                            {showReports ? 'Hide All Transactions' : 'View All Transactions'}
                        </button>

                        <button
                            onClick={handleViewMonthlyReports}
                            className="bg-blue-500 text-white p-2 rounded"
                        >
                            {viewingMonthlyReport ? 'Hide Monthly Reports' : 'View Monthly Reports'}
                        </button>

                        {/* Show UserReports if selected */}
                        {showReports && <UserReports reports={reports} />}
                        
                        {/* Show MonthlyReport if selected */}
                        {viewingMonthlyReport && <MonthlyReport carId={selectedCarId} />}
                    </div>
                )}

                {message && <div className="mt-4 p-2 bg-green-200 text-green-800 rounded">{message}</div>}
            </main>
        </div>
    );
};

export default AdminDashboard;