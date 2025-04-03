'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const supremeAdminId = process.env.NEXT_PUBLIC_SUPREME_ADMIN_ID;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, 'Users');
                const usersSnapshot = await getDocs(usersCollection);
                const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setUsers(usersList);

                // Include supreme admin in the admin list and ensure they are at the top
                const allAdmins = usersList.filter(user => user.role === 'admin' || user.role === 'supreme');
                setAdmins(allAdmins.sort((a, b) => (a.role === 'supreme' ? -1 : 1)));

                // Set current user details
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

    const toggleAdminRole = async (userId, isAdmin) => {
        if (userId === supremeAdminId) {
            setMessage('You cannot remove the supreme admin.');
            return;
        }

        setMessage(`Processing...`);

        const userRef = doc(db, 'Users', userId);
        try {
            await updateDoc(userRef, {
                role: isAdmin ? 'user' : 'admin' 
            });

            // Find the user whose role was changed
            const updatedUser = users.find(user => user.id === userId);
            const userName = updatedUser ? updatedUser.name : 'User';

            // Update local state for users and admins
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, role: isAdmin ? 'user' : 'admin' } : user
                )
            );

            // Update admins state
            setAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== userId));

            const action = isAdmin ? 'removed as admin' : 'added as admin';
            setMessage(`Successfully ${action} ${userName}`);
        } catch (error) {
            setMessage(`Failed to ${isAdmin ? 'remove' : 'add'} the user as admin.`);
        }

        setTimeout(() => {
            setMessage('');
        }, 5000);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1 className="text-2xl mb-4">Admin Dashboard</h1>
            {currentUser && <h2 className="text-xl mb-4">Welcome, {currentUser.name}!</h2>} 
            
            <h3 className="text-xl mb-2">List of All Admins</h3>
            {admins.length > 0 ? (
                admins.map(admin => (
                    <div key={admin.id} className="mb-4 p-4 border rounded">
                        <h2 className="text-xl">{admin.name} ({admin.email})</h2>
                        {admin.role !== 'supreme' && (
                            <button onClick={() => toggleAdminRole(admin.id, true)} className="text-red-500">Remove Admin</button>
                        )}
                    </div>
                ))
            ) : (
                <p>No admins found.</p>
            )}

            <h3 className="text-xl mb-2">List of All Users</h3>
            {users.length > 0 ? (
                users.map(user => (
                    <div key={user.id} className="mb-4 p-4 border rounded">
                        <h2 className="text-xl">{user.name} ({user.email})</h2>
                        {user.role !== 'admin' && user.id !== supremeAdminId && (
                            <button onClick={() => toggleAdminRole(user.id, false)} className="text-green-500">Make Admin</button>
                        )}
                    </div>
                ))
            ) : (
                <p>No users found.</p>
            )}

            {message && <div className="mt-4 p-2 bg-green-200 text-green-800 rounded">{message}</div>}
        </div>
    );
};

export default AdminDashboard;