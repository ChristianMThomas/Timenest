import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const generateUsername = (email) => {
    const namePart = email.split('@')[0].replace(/\d/g, ''); // Remove numeric digits
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5 digits
    return `${namePart}${randomDigits}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // prevents the page from automatically reloading
    const username = generateUsername(email);
    localStorage.setItem('username', username);
    navigate('/org'); // Redirect to organization selection page after login

  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-indigo-600">
      <div className="bg-white mt-5 p-8 rounded-xl shadow-xl w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome to TimeNest
          </h1>
          <img
            src="./assets/time-nest-icon.png"
            alt="TimeNest Logo"
          />
          <p className="text-sm text-gray-500">
            Manage your buisness schedules with ease!
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-400 outline-none"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
          >
            Log In
          </button>
        </form>
        <div className="flex justify-between text-sm mt-4  text-indigo-600">
          <a href="/forgot">Forgot Password?</a>
          <a href="/register">Sign Up</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
