'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/firebase';
import { collection, getDocs, setDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState('user'); // default role
    const router = useRouter();
    const [adminName, setAdminName] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [tokenRefreshed, setTokenRefreshed] = useState(false);
    const [isLoading, setIsLoading] = useState(true)


    useEffect(() => {
      const checkAdmin = async () => {
          const user = auth.currentUser;
          if (!user) {
              router.push('/Sign-in');
              return;
          }
  
          try {
              const idTokenResult = await user.getIdTokenResult();
              console.log('User claims:', idTokenResult.claims);
  
              if (!idTokenResult.claims.admin) {
                  console.error('User does not have admin privileges');
                  router.push(`/dashboard/${user.uid}`);
                  return;
              }
  
              const docRef = doc(db, 'Users', user.uid);
              const docSnap = await getDoc(docRef);
              const userData = docSnap.data();
  
              if (!userData || userData.role !== 'admin') {
                  router.push(`/dashboard/${user.uid}`);
                  return;
              }
  
              // Fetch users if admin
              await fetchUsers();
          } catch (e) {
              console.error('Error checking admin privileges:', e);
          }
      };
  
      checkAdmin();
  }, [router]);
  
    const fetchUsers = async () => {
        try {
            const usersCollection = collection(db, 'Users');
            const userDocs = await getDocs(usersCollection);
            const userData = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(userData);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const res = await createUserWithEmailAndPassword(auth, newUserEmail, 'defaultPassword'); // Set a default password or prompt for one
            const user = res.user;

            // Add user data to Firestore with creation timestamp
            const docRef = doc(db, 'Users', user.uid);
            await setDoc(docRef, {
                name: newUserName,
                email: newUserEmail,
                role: newUserRole,
                createdAt: serverTimestamp(),
            });

            // Reset fields
            setNewUserEmail('');
            setNewUserName('');
            setNewUserRole('user');
            console.log("User added successfully!");

            // Refresh the user list
            fetchUsers();
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const promoteToAdmin = async (userId) => {
        const response = await fetch('/api/setAdminClaim', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uid: userId }),
        });

        const data = await response.json();
        if (response.ok) {
            console.log(data.message);
            // Force token refresh
            auth.currentUser.getIdToken(true).then(async (idToken) => {
                console.log('Token refreshed successfully!');
                const idTokenResult = await auth.currentUser.getIdTokenResult()
                console.log("Claims after refresh:", idTokenResult.claims);
                setTokenRefreshed(prev => !prev)
                fetchUsers(); // Refresh user list
            }).catch((error) => {
                console.error('Error refreshing token:', error);
            });
        } else {
            console.error(data.error);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>
    }


    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-5">
                Admin Dashboard  {adminName ? `, Welcome ${adminName}` : ''}
            </h1>

            {/* Form for Adding New Users */}
            <form onSubmit={handleAddUser} className="bg-white p-5 rounded-lg shadow-md mb-6">
                <h2 className="text-lg font-semibold mb-4">Add New User</h2>
                <input
                    type="text"
                    placeholder="Name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                    className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                    className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <button
                    type="submit"
                    className="w-full p-3 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition"
                >
                    Add User
                </button>
            </form>

            {/* Displaying Users */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="py-2 px-4 text-left">Name</th>
                            <th className="py-2 px-4 text-left">Email</th>
                            <th className="py-2 px-4 text-left">Role</th>
                            <th className="py-2 px-4 text-left">Date Created</th>
                            <th className="py-2 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-100">
                                <td className="py-2 px-4">{user.name}</td>
                                <td className="py-2 px-4">{user.email}</td>
                                <td className="py-2 px-4">{user.role}</td>
                                <td className="py-2 px-4">
                                    {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="py-2 px-4">
                                    <button
                                        onClick={() => promoteToAdmin(user.id)}
                                        className="text-blue-500 hover:underline"
                                    >
                                        Promote to Admin
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
