'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import UserCars from './userCars';
import UserReports from './userReports';
import MonthlyReport from './monthlyReports'; 
import ViewBookingHistory from './viewBookingHistory';
import InviteUser from './inviteUser';
import { useRouter } from 'next/navigation'; 
import { useSearchParams } from 'next/navigation';

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
    const [viewingMonthlyReport, setViewingMonthlyReport] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [reportYear, setReportYear] = useState(new Date().getFullYear());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showBookingHistory, setShowBookingHistory] = useState(true); // Default to true to show booking history

    const searchParams = useSearchParams();
    
    const supremeAdminId = process.env.NEXT_PUBLIC_SUPREME_ADMIN_ID;
    const router = useRouter(); 

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, 'Users');
                const usersSnapshot = await getDocs(usersCollection);
                const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setUsers(usersList);
                const allAdmins = usersList.filter(user => user.role === 'admin' || user.role === 'supreme');
                setAdmins(allAdmins.sort((a, b) => (a.role === 'supreme' ? -1 : 1)));

                const userId = searchParams.get('userId');
                if (userId) {
                    const loggedInUser = usersList.find(user => user.id === userId);
                    if (loggedInUser) {
                        setCurrentUser(loggedInUser); 
                    }
                }
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [router.query]); 

    const handleUserClick = (userId) => {
        setExpandedUserId(expandedUserId === userId ? null : userId);
        setSelectedCarId(null);
        setShowReports(false);
        setReports([]);
        setViewingMonthlyReport(false);
    };

    const handleCarClick = (carId, carName, userName) => {
        setSelectedCarId(carId);
        setSelectedCarName(carName);
        setSelectedUserName(userName);
        setShowReports(true); // Show reports for the selected car
        setShowBookingHistory(false); // Close booking history if open
        fetchReports(carId); // Fetch reports for the selected car
        setSidebarOpen(false); // Close the sidebar
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

    const handleViewBookingHistory = () => {
        setShowBookingHistory(true);
        setSidebarOpen(false); // Close sidebar when viewing booking history
    };

    const handleViewMonthlyReports = () => {
        setViewingMonthlyReport(prev => !prev); 
        setShowReports(false);
    };

    const handleYearChange = (event) => {
        setReportYear(event.target.value);
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

    const toggleBookingHistory = () => {
        setShowBookingHistory(prev => !prev);
        if (!showBookingHistory) {
            setSidebarOpen(false); // Close sidebar when opening booking history
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="flex flex-col md:flex-row">
           
            {/* Aside Navigation */}
            <aside className={`fixed inset-y-0 left-0 w-3/5 pt-23 md:pt-4 bg-gray-200 p-4 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:translate-x-0 md:static md:w-1/4`}>
                {currentUser ? (
                    <h1 className="text-xl text-[#9b2f2b] mb-4">Welcome, {currentUser.name}!</h1>
                ) : (
                    <h1 className="text-xl text-[#9b2f2b] mb-4">Welcome, Supreme Admin!</h1>
                )}

                <InviteUser />
                <br />
                <hr />
                <br />

                <h3 className="text-xl mb-2">List Of All Admins</h3>
                {admins.map(admin => (
                    <div key={admin.id} className="mb-2">
                        <span>{admin.name} ({admin.email})</span>
                    </div>
                ))}
                
                <br />
                <hr />
                <br />

                {/* Button to toggle booking history */}
                <button 
                    onClick={handleViewBookingHistory} 
                    className="mt-4 bg-[#9b2f2b] text-white p-2 rounded w-full"
                >
                    {showBookingHistory ? 'Hide Booking History' : 'View Booking History'}
                </button>

                {/* button to return to driver's account */}

                {currentUser?.role === 'admin' && (
                    <button
                        onClick={() => {
                            router.push(`/dashboard/${currentUser.id}`); 
                        }}
                        className="mt-4 bg-green-500 text-white p-2 rounded w-full"
                    >
                        Return to Driver's Account
                    </button>
                )}

                <br />
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
                                    className="ml-2 bg-[#9b2f2b] text-white p-1 rounded"
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
                        <br />
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
                <div className="flex items-center justify-center mb-4">
                    <h1 className="text-2xl text-[#9b2f2b] pr-3">Admin Dashboard</h1>
                    
                    <button 
                        className="md:hidden p-2 text-white bg-[#9b2f2b] rounded z-50"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? 'X' : '☰'}
                    </button>
                </div>

                {showBookingHistory ? (
                    <ViewBookingHistory /> 
                ) : (
                    <>
                        {selectedCarId && (
                            <div>
                                <h2 className="text-xl mb-4">Actions for Selected Car: {selectedUserName} ; {selectedCarName}</h2>
                                
                                <div className="flex items-center mb-4">
                                    <button
                                        onClick={handleViewReports}
                                        className="bg-green-500 text-white p-2 rounded mr-2"
                                    >
                                        {showReports ? 'Hide All Transactions' : 'View All Transactions'}
                                    </button>

                                    <button
                                        onClick={() => setViewingMonthlyReport(true)}
                                        className="bg-[#9b2f2b] text-white p-2 rounded mr-2"
                                    >
                                        Fetch Monthly Report
                                    </button>
                                </div>

                                {showReports && <UserReports reports={reports} />}
                                {viewingMonthlyReport && <MonthlyReport carId={selectedCarId} year={reportYear} />}
                            </div>
                        )}

                        {message && <div className="mt-4 p-2 bg-green-200 text-green-800 rounded">{message}</div>}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;