'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import ReCAPTCHA from 'react-google-recaptcha'; // Import ReCAPTCHA

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(''); // State for reCAPTCHA token
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      setLoading(false);
      return;
    }

    if (!captchaToken) { // Validate reCAPTCHA token
      setErrorMessage('Please complete the reCAPTCHA.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch the user document to check the role
      const userDoc = await getDoc(doc(db, 'Users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role;

        if (userRole === 'supreme' || userRole === 'admin') {
          router.push('/admin');
        } else {
          router.push(`/dashboard/${user.uid}`);
        }
      } else {
        setErrorMessage('User not found. Please check your credentials.');
      }
    } catch (signInError) {
      setLoading(false);
      switch (signInError.code) {
        case 'auth/user-not-found':
          setErrorMessage('This account does not exist. Please create an account.');
          break;
        case 'auth/wrong-password':
          setErrorMessage('Incorrect password. Please try again.');
          break;
        case 'auth/too-many-requests':
          setErrorMessage('Too many unsuccessful login attempts. Please try again later.');
          break;
        default:
          setErrorMessage('An error occurred: ' + signInError.message);
      }
    }
  };

  return (
    <div className="sign-background flex items-center justify-center min-h-screen">
      <div className="signup p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-2xl mb-5">Sign In</h1>
        <form onSubmit={handleSubmit}>
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
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            required
          />
          <ReCAPTCHA 
            sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY} 
            onChange={setCaptchaToken} 
            className="mb-4" 
          />
          <button
            type="submit"
            className="submit-btn w-full p-3 rounded text-white"
            disabled={loading}
          >
            {loading ? 'Signing In... Hold On' : 'Sign In'}
          </button>
        </form>
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 font-bold px-4 py-3 rounded mt-4 relative" role="alert">
            <span className="block sm:inline">{errorMessage} <a href="/Sign-up" className="text-gray-700 hover:underline">Create an account</a></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignIn;