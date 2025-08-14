import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

// This is the login page and the first page the user sees
// after they open the app. The user can log in with their email
// and password. After logging in, they are redirected to the
// organization selection page.

const Login = () => {
  //Login state variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Registration state variables
  const [showRegister, setShowRegister] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');



  // Function to generate a defualt username from email
  // by removing numeric digits and appending 5 random digits

  const generateUsername = (email) => {
    const namePart = email.split('@')[0].replace(/\d/g, ''); // Remove numeric digits
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5 digits
    return `${namePart}${randomDigits}`;
  };


  // Function to handle register
  const handleRegister = (e) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Here you would typically send the registration data to your backend
    alert("Registration successful! Please log in.");
  }

  // Handle form submission
  // Store the generated username in localStorage
  // Redirect to organization selection page

  const handleSubmit = (e) => {
    e.preventDefault(); // prevents the page from automatically reloading
    const username = generateUsername(email);
    localStorage.setItem('username', username);
    navigate('/org'); // Redirect to organization selection page after login

  };

  // JSX for the login form with Tailwind CSS styling

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-indigo-600">
      <div className="bg-white mt-5 p-8 rounded-xl shadow-xl w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome to TimeNest</h1>
          <img src="./assets/time-nest-icon.png" alt="TimeNest Logo" />
          <p className="text-sm text-gray-500">Manage your business schedules with ease!</p>
        </div>

        {!showRegister ? (
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
        ) : (
          <form className="space-y-4" onSubmit={handleRegister}>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-400 outline-none"
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
            >
              Register
            </button>
          </form>
        )}

        <div className="flex justify-between text-sm mt-4 text-indigo-600">
          <button
            className="hover:underline"
            onClick={() => alert("Forgot password flow coming soon!")}
          >
            Forgot Password?
          </button>
          <button
            className="hover:underline"
            onClick={() => setShowRegister(!showRegister)}
          >
            {showRegister ? "Back to Login" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

// Note: The handleLogin function is not defined in the provided code snippet.
// It should be defined to handle the login logic, similar to handleRegister.