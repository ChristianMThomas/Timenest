import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [showRegister, setShowRegister] = useState(false);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isRegistering, setIsRegistering] = useState(false); // 🌀 Spinner state

  const generateUsername = (email) => {
    const namePart = email.split("@")[0].replace(/\d/g, "");
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    return `${namePart}${randomDigits}`;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const username = generateUsername(registerEmail);
    setIsRegistering(true); // 🌀 Show spinner

    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          username: username,
        }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      alert("Registration successful! Please log in.");
      setShowRegister(false);
    } catch (error) {
      alert("Registration error. Please try again.");
      console.error("Register error:", error);
    } finally {
      setIsRegistering(false); // 🌀 Reset spinner
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("companyId", data.companyId);

      navigate("/org");
    } catch (error) {
      alert("Invalid credentials or server error");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-indigo-600">
      <div className="bg-white mt-5 p-8 rounded-xl shadow-xl w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome to TimeNest</h1>
          <img
            src={isRegistering ? "./assets/Spinner.gif" : "./assets/time-nest-icon.png"}
            alt="TimeNest Logo"
            className="mx-auto"
          />
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
};

export default Login;