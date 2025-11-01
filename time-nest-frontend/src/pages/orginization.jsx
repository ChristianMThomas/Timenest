import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";

const Orginization = () => {
  const { isDarkMode } = useDarkMode();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [companyCode, setCompanyCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  //  Redirect if already in a company
  useEffect(() => {
    const role = localStorage.getItem("role");
    const company = localStorage.getItem("company");

    // If session is already hydrated, redirect immediately
    if (company && role === "executive") {
      navigate("/executive/home");
      return;
    } else if (company && role === "employee") {
      navigate("/employee/home");
      return;
    }

    // Otherwise, fetch user profile to restore session
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("http://localhost:8080/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        console.log("Restored user profile:", data);

        if (data.username) localStorage.setItem("username", data.username);
        if (data.role) localStorage.setItem("role", data.role.toLowerCase());
        if (data.company?.name)
          localStorage.setItem("company", data.company.name);
        if (data.company?.id)
          localStorage.setItem("companyId", data.company.id);

        // Redirect after restoring session
        if (data.role === "EXECUTIVE" && data.company?.name) {
          navigate("/executive/home");
        } else if (data.role === "EMPLOYEE" && data.company?.name) {
          navigate("/employee/home");
        }
      } catch (error) {
        console.error("Session restore error:", error);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const generateSixDigitCode = () =>
    String(Math.floor(100000 + Math.random() * 900000));

  const handleJoinClick = () => {
    setShowJoinForm(true);
    setError("");
    setCompanyCode("");
  };

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setCompanyName("");
    setCompanyCode(generateSixDigitCode());
    setError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8080/companies/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ joinCode: companyCode }),
      });

      if (!response.ok) {
        throw new Error("Invalid company code");
      }

      const data = await response.json();
      localStorage.setItem("company", data.name);
      localStorage.setItem("role", "employee");
      setShowJoinForm(false);
      navigate("/employee/home");
    } catch (err) {
      setError("Invalid company code. Please try again.");
      console.error("Join error:", err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8080/companies/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: companyName.trim(),
          joinCode: companyCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Company creation failed");
      }

      const data = await response.json();
      localStorage.setItem("company", data.name);
      localStorage.setItem("companyCode", data.joinCode);
      localStorage.setItem("role", "executive");
      setShowCreateForm(false);
      navigate("/executive/home");
    } catch (err) {
      setError("Failed to create company. Try again.");
      console.error("Create error:", err);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative px-4 transition-colors duration-300 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'
    }`}>
      <div
        className={`w-full max-w-5xl mx-auto text-center transition-all duration-300 ${
          showJoinForm || showCreateForm ? "blur-sm" : ""
        }`}
      >
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/assets/time-nest-icon.png"
              alt="TimeNest"
              className="h-20 w-20"
            />
          </div>
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to TimeNest!
          </h1>
          <p className="text-2xl text-gray-600 font-medium">
            Let's get you started on your journey
          </p>
          <p className="text-lg text-gray-500 mt-2">
            Choose your role to continue
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Organization Card */}
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-purple-200 border-4 border-transparent hover:border-purple-500"
            onClick={handleCreateClick}
          >
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-indigo-900">
              Create Organization
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              I'm a manager or business executive looking to create and manage my team
            </p>
            <img
              src="/assets/orginization-create.png"
              alt="Create Organization"
              className="w-48 h-48 mx-auto object-contain mb-4"
            />
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full font-bold text-lg inline-block">
              Get Started
            </div>
          </div>

          {/* Join Organization Card */}
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-blue-200 border-4 border-transparent hover:border-blue-500"
            onClick={handleJoinClick}
          >
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-blue-900">
              Join Organization
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              I'm an employee ready to join my company and start tracking time
            </p>
            <img
              src="/assets/orginization-join.png"
              alt="Join Organization"
              className="w-48 h-48 mx-auto object-contain mb-4"
            />
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-full font-bold text-lg inline-block">
              Join Now
            </div>
          </div>
        </div>
      </div>

      {/* Join Company Modal */}
      {showJoinForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative w-full max-w-md border-4 border-blue-200">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowJoinForm(false)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Join Your Company
              </h2>
              <p className="text-gray-600">Enter the code provided by your manager</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-left">
                  Company Join Code
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="w-full px-6 py-4 border-2 border-blue-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-center text-2xl font-mono font-bold"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value)}
                  maxLength="6"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Join Company
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Company Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative w-full max-w-md border-4 border-purple-200">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowCreateForm(false)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Create Your Company
              </h2>
              <p className="text-gray-600">Set up your organization to manage your team</p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-left">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your company name"
                  className="w-full px-6 py-4 border-2 border-purple-200 rounded-xl outline-none focus:border-purple-500 transition-colors text-lg"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2 text-left">
                  Employee Join Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-6 py-4 border-2 border-purple-200 rounded-xl bg-purple-50 text-center text-2xl font-mono font-bold text-purple-700"
                    value={companyCode}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => setCompanyCode(generateSixDigitCode())}
                    className="px-6 py-4 bg-purple-100 text-purple-700 font-bold rounded-xl hover:bg-purple-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-left">Share this code with your employees to let them join</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Create Company
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orginization;
