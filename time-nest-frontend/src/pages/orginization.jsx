import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Orginization = () => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-indigo-500 relative">
      <div
        className={`font-serif p-5 mx-auto text-center ${
          showJoinForm || showCreateForm ? "blur-sm" : ""
        }`}
      >
        <h1 className="text-white text-3xl font-serif">
          Hello👋 lets find out where you need to go.
        </h1>
        <h2 className="text-gray-400 text-lg font-serif">
          Please select your role
        </h2>

        <div
          className="card hover:bg-indigo-100 active:bg-indigo-200 cursor-pointer"
          onClick={handleCreateClick}
        >
          Create Organization
          <h3 className="text-sm text-gray-400">
            I am a manager or business executive and want to create an
            organization
          </h3>
          <img
            src="/assets/orginization-create.png"
            alt="Create Organization"
            className="w-40 h-45 mx-auto my-3"
          />
        </div>

        <div
          className="card hover:bg-indigo-100 active:bg-indigo-200 cursor-pointer"
          onClick={handleJoinClick}
        >
          Join Organization
          <h3 className="text-sm text-gray-400">
            I am an employee and want to join my organization
          </h3>
          <img
            src="/assets/orginization-join.png"
            alt="Join Organization"
            className="w-60 h-44 mx-auto my-3"
          />
        </div>
      </div>

      {showJoinForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 relative w-full max-w-sm">
            <button
              className="absolute top-2 right-2 text-xl font-bold text-gray-500 hover:text-black"
              onClick={() => setShowJoinForm(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-indigo-900">
              Join Company
            </h2>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter company code"
                className="px-4 py-2 border border-gray-300 rounded-md outline-none"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                required
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                className="py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 relative w-full max-w-sm">
            <button
              className="absolute top-2 right-2 text-xl font-bold text-gray-500 hover:text-black"
              onClick={() => setShowCreateForm(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-indigo-900">
              Create Company
            </h2>
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter company name"
                className="px-4 py-2 border border-gray-300 rounded-md outline-none"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Company code"
                  className="px-4 py-2 border border-gray-300 rounded-md outline-none flex-1"
                  value={companyCode}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setCompanyCode(generateSixDigitCode())}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
                >
                  Generate
                </button>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                className="py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orginization;
