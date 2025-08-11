import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_COMPANY_CODE = "99999";
const DEFAULT_COMPANY_NAME = "Testers";

const Orginization = () => {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [companyCode, setCompanyCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoinClick = () => {
    setShowJoinForm(true);
    setError('');
    setCompanyCode('');
  };

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setCompanyName('');
    setCompanyCode(String(Math.floor(10000 + Math.random() * 90000))); // Generate random 5-digit code
    setError('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (companyCode === DEFAULT_COMPANY_CODE) {
      localStorage.setItem('company', DEFAULT_COMPANY_NAME);
      localStorage.setItem('isManager', 'false'); // Employee joining, not manager
      setShowJoinForm(false);
      navigate('/employee/home');
    } else {
      setError('Invalid company code. Please try again.');
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (companyName.trim() && companyCode) {
      localStorage.setItem('company', companyName.trim());
      localStorage.setItem('companyCode', companyCode);
      localStorage.setItem('isManager', 'true'); // Manager creating org
      setShowCreateForm(false);
      navigate('/manager/home');
    } else {
      setError('Please enter a valid company name.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-indigo-500 relative">
      <div className={`font-serif p-5 mx-auto text-center ${showJoinForm || showCreateForm ? 'blur-sm' : ''}`}>
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
          Create Orginization
          <h3 className="text-sm text-gray-400">
            I am a manager or business owner and want to create an orginization
          </h3>
          <img 
            src="/assets/orginization-create.png"
            alt="Create Orginization"
            className="w-40 h-45 mx-auto my-3"
          />
        </div>
        <div
          className="card hover:bg-indigo-100 active:bg-indigo-200 cursor-pointer"
          onClick={handleJoinClick}
        >
          Join Orginization
          <h3 className="text-sm text-gray-400">
            I am an employee and want to join my orginization
          </h3>
          <img 
            src="/assets/orginization-join.png"
            alt="Join Orginization"
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
            <h2 className="text-2xl font-bold mb-4 text-indigo-900">Join Company</h2>
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
            <h2 className="text-2xl font-bold mb-4 text-indigo-900">Create Company</h2>
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
                  onClick={() => setCompanyCode(String(Math.floor(10000 + Math.random() * 90000)))}
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
