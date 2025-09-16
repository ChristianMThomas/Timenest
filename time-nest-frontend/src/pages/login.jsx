import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [showRegister, setShowRegister] = useState(false);
  const [showVerifyForm, setShowVerifyForm] = useState(false);

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [isRegistering, setIsRegistering] = useState(false);

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
    setIsRegistering(true);

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

      alert("Registration successful! Please verify your account.");
      setShowVerifyForm(true);
    } catch (error) {
      alert("Registration error. Please try again.");
      console.error("Register error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      const response = await fetch("http://localhost:8080/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          verificationCode: verificationCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      alert("Your account has been verified! You can now log in.");
      setShowVerifyForm(false);
      setShowRegister(false);
    } catch (error) {
      alert("Verification error. Please check your code.");
      console.error("Verify error:", error);
    } finally {
      setIsRegistering(false);
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

      //  Fetch actual username from /users/me
      const profileResponse = await fetch("http://localhost:8080/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!profileResponse.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const profileData = await profileResponse.json();
      console.log("Fetched profile:", profileData);

      if (profileData.username) {
        localStorage.setItem("username", profileData.username);
      } else {
        console.warn("Username not found in profile response");
      }

      //  Fetch company name from /companies/me
      const companyResponse = await fetch(
        "http://localhost:8080/companies/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!companyResponse.ok) {
        throw new Error("Failed to fetch company name");
      }

      const companyData = await companyResponse.json();
      console.log("Fetched company:", companyData);

      if (companyData.name) {
        localStorage.setItem("company", companyData.name);
      } else {
        console.warn("Company name not found in response");
      }

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
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome to TimeNest
          </h1>
          <img
            src={
              isRegistering
                ? "./assets/Spinner.gif"
                : "./assets/time-nest-icon.png"
            }
            alt="TimeNest Logo"
            className="mx-auto"
          />
          <p className="text-sm text-gray-500">
            Manage your business schedules with ease!
          </p>
        </div>

        {showVerifyForm ? (
          <form
            className="space-y-4"
            onSubmit={handleVerify}
            autoComplete="off"
          >
            <input
              type="email"
              value={registerEmail}
              disabled
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Verification Code"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
            >
              Verify Account
            </button>
          </form>
        ) : !showRegister ? (
          <form
            className="space-y-4"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
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
          <form
            className="space-y-4"
            onSubmit={handleRegister}
            autoComplete="off"
          >
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

        {!showVerifyForm && (
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
        )}
      </div>
    </div>
  );
};

export default Login;
