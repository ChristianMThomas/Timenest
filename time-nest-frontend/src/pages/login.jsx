import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { checkAuth } = useAuth();

  const [showRegister, setShowRegister] = useState(false);
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

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

    console.log("=== FRONTEND LOGIN DEBUG ===");
    console.log("Email:", email);
    console.log("Password:", password ? "***" : "(empty)");
    console.log("Request body:", JSON.stringify({ email, password }));

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Login failed:", response.status, errorText);
        throw new Error(`Login failed (${response.status}): ${errorText || 'Invalid credentials'}`);
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

      //  Fetch company name from /companies/me (optional - user might not have joined a company yet)
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

      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        console.log("Fetched company:", companyData);

        if (companyData.name) {
          localStorage.setItem("company", companyData.name);
        } else {
          console.warn("Company name not found in response");
        }
      } else if (companyResponse.status === 404) {
        console.log("User has not joined a company yet");
        // This is okay - user will create/join company on /org page
      } else {
        console.warn("Failed to fetch company:", companyResponse.status);
      }

      console.log("=== LOGIN SUCCESSFUL ===");
      console.log("Token and user data stored in localStorage");

      // Trigger auth check which will handle navigation
      await checkAuth();
    } catch (error) {
      alert(`Login failed: ${error.message}`);
      console.error("Login error:", error);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      const response = await fetch("http://localhost:8080/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reset link");
      }

      alert("Password reset link sent to your email!");
      setShowForgotPassword(false);
      setShowResetPassword(true);
    } catch (error) {
      alert("Error sending reset link. Please try again.");
      console.error("Forgot password error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsRegistering(true);

    try {
      const response = await fetch("http://localhost:8080/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword: newPassword }),
      });

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      alert("Password reset successful! You can now log in.");
      setShowResetPassword(false);
      setResetToken("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      alert("Error resetting password. Please check your token.");
      console.error("Reset password error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob top-0 -left-4"></div>
        <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 top-0 -right-4"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bottom-8 left-20"></div>
      </div>

      {/* Main Login Container */}
      <div className="relative z-10 w-full max-w-6xl mx-4 grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:block text-white space-y-8">
          <div className="space-y-4">
            <img
              src="./assets/time-nest-icon.png"
              alt="TimeNest Logo"
              className="w-35 h-35 mx-auto md:mx-0"
            />
            <h1 className="text-6xl font-extrabold leading-tight">
              Welcome to<br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                TimeNest
              </span>
            </h1>
            <p className="text-2xl text-purple-200 font-medium">
              Professional time tracking for modern teams
            </p>
          </div>

          <div className="space-y-4 mt-12">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Accurate Tracking</h3>
                <p className="text-purple-200">Track hours with precision</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Team Management</h3>
                <p className="text-purple-200">Organize your workforce</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg className="w-8 h-8 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Powerful Analytics</h3>
                <p className="text-purple-200">Insights at your fingertips</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-xl mx-auto backdrop-blur-sm bg-opacity-95">
          <div className="text-center mb-8">
            <div className="md:hidden mb-6">
              <img
                src={
                  isRegistering
                    ? "./assets/Spinner.gif"
                    : "./assets/time-nest-icon.png"
                }
                alt="TimeNest Logo"
                className="mx-auto w-30 h-30"
              />
            </div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {showRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-gray-600 text-lg">
              {showRegister
                ? "Join TimeNest and start tracking today"
                : "Sign in to manage your time efficiently"}
            </p>
          </div>

        {showVerifyForm ? (
          <form
            className="space-y-6"
            onSubmit={handleVerify}
            autoComplete="off"
          >
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-left">Email</label>
              <input
                type="email"
                value={registerEmail}
                disabled
                className="w-full px-6 py-4 bg-gray-100 border-2 border-gray-300 rounded-xl text-lg"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-left">Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                className="w-full px-6 py-4 border-2 border-indigo-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-lg text-center font-mono font-bold"
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength="6"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all text-lg shadow-lg transform hover:scale-105"
            >
              Verify Account
            </button>
          </form>
        ) : !showRegister ? (
          <form
            className="space-y-6"
            onSubmit={handleSubmit}
            autoComplete="on"
          >
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-left">Email Address</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-lg"
                onChange={(e) => setEmail(e.target.value)}
                onInput={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-left">Password</label>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-lg"
                onChange={(e) => setPassword(e.target.value)}
                onInput={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all text-lg shadow-lg transform hover:scale-105"
            >
              Sign In
            </button>
          </form>
        ) : (
          <form
            className="space-y-6"
            onSubmit={handleRegister}
            autoComplete="on"
          >
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-left">Email Address</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={registerEmail}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-lg"
                onChange={(e) => setRegisterEmail(e.target.value)}
                onInput={(e) => setRegisterEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-left">Password</label>
              <input
                type="password"
                name="new-password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={registerPassword}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-lg"
                onChange={(e) => setRegisterPassword(e.target.value)}
                onInput={(e) => setRegisterPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-left">Confirm Password</label>
              <input
                type="password"
                name="confirm-password"
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-lg"
                onChange={(e) => setConfirmPassword(e.target.value)}
                onInput={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all text-lg shadow-lg transform hover:scale-105"
            >
              Create Account
            </button>
          </form>
        )}

        {!showVerifyForm && (
          <div className="flex justify-between text-base mt-6">
            <button
              className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>
            <button
              className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
              onClick={() => setShowRegister(!showRegister)}
            >
              {showRegister ? "Back to Login" : "Create Account"}
            </button>
          </div>
        )}
      </div>
    </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative w-full max-w-md border-4 border-indigo-200">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowForgotPassword(false)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Forgot Password
              </h2>
              <p className="text-gray-600">We'll send you a reset token via email</p>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-left">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-6 py-4 border-2 border-indigo-200 rounded-xl outline-none focus:border-indigo-500 transition-colors text-lg"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all text-lg shadow-lg transform hover:scale-105"
              >
                Send Reset Token
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative w-full max-w-md border-4 border-green-200">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowResetPassword(false)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Reset Password
              </h2>
              <p className="text-gray-600">Create a new secure password</p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-left">Reset Token</label>
                <input
                  type="text"
                  placeholder="Enter reset token from email"
                  className="w-full px-6 py-4 border-2 border-green-200 rounded-xl outline-none focus:border-green-500 transition-colors text-lg"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-left">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-6 py-4 border-2 border-green-200 rounded-xl outline-none focus:border-green-500 transition-colors text-lg"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-left">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-6 py-4 border-2 border-green-200 rounded-xl outline-none focus:border-green-500 transition-colors text-lg"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all text-lg shadow-lg transform hover:scale-105"
              >
                Reset Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
