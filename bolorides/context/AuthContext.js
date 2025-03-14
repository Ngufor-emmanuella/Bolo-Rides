'use client'
import React, { useContext, useState, useEffect } from 'react'
import { auth, db } from '@/app/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'  // <--- ADD THIS IMPORT

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {

    const [currentUser, setCurrentUser] = useState(null)
    const [userDataObj, setUserDataObj] = useState({})
    const [loading, setLoading] = useState(true)

    // Auth handlers
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    function logout() {
        setUserDataObj({})
        setCurrentUser(null)
        return signOut(auth)
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async user => {
            try {
                setLoading(true);
                setCurrentUser(user);
                if (!user) {
                    return; // Early return if user is null
                }
    
                // Fetch user data from Firestore
                console.log('fetching user data');
                const docRef = doc(db, 'Users', user.uid);
                const docSnap = await getDoc(docRef);
                let firebaseData = {};
                if (docSnap.exists()) {
                    console.log('found user data');
                    firebaseData = docSnap.data();
                    console.log(firebaseData);
                }
    
                setUserDataObj(firebaseData);
    
            } catch (err) {
                console.log(err.message);
            } finally {
                setLoading(false);
            }
    
        });
    
        return unsubscribe;
    
    }, []);

    const value = {
        currentUser,
        userDataObj,
        signup,
        logout,
        login,
        loading,

    }
    return (
        <AuthContext.Provider value={value}>
        {children}
        </AuthContext.Provider>

    )
}
