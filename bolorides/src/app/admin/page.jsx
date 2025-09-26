'use client';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
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
    const [showBookingHistory, setShowBookingHistory] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
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
        setSelectedCarName('');
        setSelectedUserName('');
    };

    const handleCarClick = (carId, carName, userName) => {
        setSelectedCarId(carId);
        setSelectedCarName(carName);
        setSelectedUserName(userName);
        setShowReports(true);
        setShowBookingHistory(false);
        fetchReports(carId);
        setSidebarOpen(false);
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
        setSidebarOpen(false);
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

    const deleteCar = async (carId) => {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'supreme')) {
            setError('You do not have permission to delete cars.');
            return;
        }
        setProcessing(true);
        try {
            await deleteDoc(doc(db, 'Cars', carId));

            const reportsQuery = query(collection(db, 'DailyReports'), where('carId', '==', carId));
            const reportsSnapshot = await getDocs(reportsQuery);
            await Promise.all(reportsSnapshot.docs.map(reportDoc => deleteDoc(doc(db, 'DailyReports', reportDoc.id))));

            await refetchUsers();
            resetSelections();

            setMessage('Car and associated reports deleted successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting car:', error);
            setError('Failed to delete the car: ' + error.message);
            setTimeout(() => setError(''), 3000);
        } finally {
            setProcessing(false);
        }
    };

    const resetSelections = () => {
        setSelectedCarId(null);
        setSelectedCarName('');
        setSelectedUserName('');
        setShowReports(false);
        setReports([]);
    };

    const refetchUsers = async () => {
        setLoading(true);
        try {
            const usersCollection = collection(db, 'Users');
            const usersSnapshot = await getDocs(usersCollection);
            const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersList);
            const allAdmins = usersList.filter(user => user.role === 'admin' || user.role === 'supreme');
            setAdmins(allAdmins.sort((a, b) => (a.role === 'supreme' ? -1 : 1)));
        } catch (err) {
            setError('Failed to refresh users.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCarClick = (carId) => {
        setSelectedCarId(carId);
        setShowDeleteModal(true);
    };

    const confirmDeleteCar = () => {
        if (selectedCarId) {
            deleteCar(selectedCarId);
            setShowDeleteModal(false);
        }
    };

    const cancelDeleteCar = () => {
        setShowDeleteModal(false);
    };

    const toggleBookingHistory = () => {
        setShowBookingHistory(prev => !prev);
        if (!showBookingHistory) {
            setSidebarOpen(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="flex flex-col md:flex-row">
            {/* Aside Navigation */}
            <aside className={`fixed inset-y-0 left-0 w-4/5 md:[width:calc(1.2/5*100%)] bg-gray-200 p-4 
            overflow-y-auto md:overflow-y-visible /* vertical scroll only on mobile */flow-x-hidden /* removes horizontal scrollbar on desktop */
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:translate-x-0 md:static`}>
                {currentUser ? (
                    <h1 className="text-xl text-[#9b2f2b] mb-4 mt-20">Welcome, {currentUser.name}!</h1>
                ) : (
                    <h1 className="text-xl text-[#9b2f2b] mb-4">Welcome, Supreme Admin!</h1>
                )}
                <InviteUser />
                <br />
                <hr />
                <br />
                <h3 className="text-[#9b2f2b] text-xl mb-2">List Of All Admins</h3>
                {admins.map(admin => (
                    <div key={admin.id} className="mb-2">
                        <span>{admin.name} ({admin.email})</span>
                    </div>
                ))}
                
                <br />
                <hr />
               
            
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
                <h3 className="text-[#9b2f2b] text-xl mb-2">List Of All Users</h3>
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
                            {(currentUser?.role === 'admin' || currentUser?.role === 'supreme') && selectedCarId && selectedUserName === user.name && (
                                <button 
                                    onClick={() => handleDeleteCarClick(selectedCarId)} 
                                    className="ml-1 bg-red-400 text-white p-1 rounded"
                                    disabled={processing}
                                >
                                    Delete Car
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
                <div className="flex items-center justify-center mb-2 pt-20 ">
                    <h1 className="text-2xl text-[#9b2f2b] pr-3 ">Admin Dashboard</h1>
                    
                    <button 
                        className="md:hidden p-2 text-white bg-[#9b2f2b] rounded z-50 mr-8"
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
                                {viewingMonthlyReport && <MonthlyReport carId={selectedCarId} carName={selectedCarName} year={reportYear} />}
                            </div>
                        )}
                        {message && <div className="mt-4 p-2 bg-green-200 text-green-800 rounded">{message}</div>}
                        {error && <div className="mt-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>}
                    </>
                )}
            </main>

            {/* Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#00000070' }}>
                    <div className="bg-white p-6 rounded shadow-md">
                        <h2 className="text-lg mb-4">Are you sure you want to delete this car?</h2>
                        <p className="mb-4">Once deleted, this action cannot be undone.</p>
                        <div className="flex justify-end">
                            <button onClick={cancelDeleteCar} className="mr-2 bg-gray-300 text-black p-2 rounded">No</button>
                            <button onClick={confirmDeleteCar} className="bg-red-500 text-white p-2 rounded">Yes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard