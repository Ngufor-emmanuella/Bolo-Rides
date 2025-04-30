"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth, db } from '../firebase';
import { setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import ReCAPTCHA from 'react-google-recaptcha';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false); // New state to track token validity
  const router = useRouter();

  useEffect(() => {
    const checkInviteLink = async () => {
      const token = new URLSearchParams(window.location.search).get('token');

      if (!token) {
        setError('Cannot access sign-up page. Please contact administrators to gain access.');
        return;
      }

      const inviteDocRef = doc(db, 'Invitations', token);
      const inviteDoc = await getDoc(inviteDocRef);

      if (!inviteDoc.exists()) {
        setError('Invalid invite link. Please contact the administrators of BoloRides.');
        return;
      }

      const inviteData = inviteDoc.data();
      const currentTime = new Date();
      const expiresAt = inviteData.expiresAt ? inviteData.expiresAt.toDate() : null;

      if (!expiresAt) {
        setIsTokenValid(true); // Allow access if there's no expiration
        return;
      }

      if (inviteData.used) {
        setError('This invite link has already been used. Please contact the administrators of BoloRides.');
        return;
      }

      if (expiresAt < currentTime) {
        setError('Invalid invite link, already expired. Please contact the administrators of BoloRides.');
      } else {
        setIsTokenValid(true); // Set token as valid if it hasn't expired
      }
    };

    checkInviteLink();
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check the passwords.');
      return;
    }

    if (!captchaToken) {
      setError('Please complete the reCAPTCHA.');
      return;
    }

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setError('Email already exists. Please choose another email.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'Users', user.uid), {
        name,
        email,
        created_at: new Date(),
        role: 'user',
      });

      const token = new URLSearchParams(window.location.search).get('token');
      if (token) {
        await updateDoc(doc(db, 'Invitations', token), { used: true });
      }

      router.push(`/dashboard/${user.uid}`);
    } catch (error) {
      console.error('Error signing up:', error);
      setError('Error signing up: ' + error.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="signup p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-2xl mb-5">Sign Up</h1>
        {error && <p className="text-red-500">{error}</p>}
        {isTokenValid && ( // Only show the form if the token is valid
          <form onSubmit={handleSignUp}>
            <label>UserName:</label>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
              required
            />
            <label>Email:</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
              required
            />
            <label>Password:</label>
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'See'}
              </button>
            </div>
            <label>Repeat Password:</label>
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'See'}
              </button>
            </div>
            <ReCAPTCHA 
              sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY} 
              onChange={setCaptchaToken} 
              className="mb-4" 
            />
            <button
              type="submit"
              className="submit-btn w-full p-3 rounded text-white"
            >
              Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;