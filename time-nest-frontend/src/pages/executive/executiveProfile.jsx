import React, { useState, useEffect } from "react";
import M_navbar from "../../components/M_navbar";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../../context/DarkModeContext";
import { API_BASE_URL } from "../../config/api";
import { useNotification } from "../../components/Notification";

const ExecutiveProfile = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const { showError, showSuccess, NotificationComponent } = useNotification();
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "Y/N"
  );
  const [editing, setEditing] = useState(false);
  const [userTimelogs, setUserTimeLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showDisbandModal, setShowDisbandModal] = useState(false);

  useEffect(() => {
    fetchUserData();
    handleGetTimelogs();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user data");

      const data = await response.json();
      setUserData(data);
      if (data.username) {
        setUsername(data.username);
        localStorage.setItem("username", data.username);
      }

      // Fetch company info
      if (data.company?.id) {
        const companyResponse = await fetch(
          `${API_BASE_URL}/companies/${data.company.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          setCompanyInfo(companyData);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleUsernameChange = (e) => setUsername(e.target.value);

  const handleSave = async () => {
    const formattedUsername = username.replace(/\s+/g, "_");

    try {
      const response = await fetch(`${API_BASE_URL}/users/me/username`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newUsername: formattedUsername }),
      });

      if (!response.ok) throw new Error("Failed to change username");

      //  Re-fetch profile to get updated username
      const profileResponse = await fetch(`${API_BASE_URL}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const updatedUser = await profileResponse.json();
      setUsername(updatedUser.username);
      localStorage.setItem("username", updatedUser.username);
      setUserData(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error("Username update error:", error);
      showError("Could not update username. Please try again.");
    }
  };

  const handleGetTimelogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/timelogs/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Response was not ok");
      const result = await response.json();
      setUserTimeLogs(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisbandCompany = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/companies/${companyInfo.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to disband company");

      showSuccess("Company disbanded successfully");
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Error disbanding company:", error);
      showError("Could not disband company. Please try again.");
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSuccess("Join code copied to clipboard!");
  };

  return (
    <>
      {NotificationComponent}
      <M_navbar />
      <div className={`min-h-screen flex flex-col items-center pt-24 px-4 pb-8 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'
      }`}>
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-8 mb-8 border-4 border-purple-200">
          <div className="flex flex-col items-center">
            {/* Profile Picture with Executive Badge */}
            <div className="relative mb-6">
              <img
                src={userData?.profilePhoto || "/assets/user-icon.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full border-6 border-gradient-to-r from-purple-500 to-indigo-500 shadow-xl object-cover ring-4 ring-white"
              />
              <div className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 p-2 rounded-full border-4 border-white">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>

            {/* Username Section */}
            <div className="text-center w-full mb-6">
              {editing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    className="px-6 py-3 border-2 border-purple-300 rounded-xl text-center text-2xl font-bold focus:border-purple-500 outline-none w-full max-w-md"
                  />
                  <div className="flex gap-3 justify-center">
                    <button
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
                      onClick={handleSave}
                    >
                      Save Changes
                    </button>
                    <button
                      className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center mb-3">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mr-3">
                      {username}
                    </h2>
                    <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      EXECUTIVE
                    </span>
                  </div>
                  <button
                    className="px-6 py-2 bg-purple-100 text-purple-700 rounded-full font-bold hover:bg-purple-200 transition-all inline-flex items-center"
                    onClick={() => setEditing(true)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Username
                  </button>
                </div>
              )}

              {/* Company Info */}
              <div className="mt-6 inline-flex items-center bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-3 rounded-full">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-gray-700 font-bold text-lg">
                  {companyInfo?.name || userData?.company?.name || "No Company"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              <button
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg inline-flex items-center"
                onClick={() => setShowManageModal(true)}
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Company
              </button>
              <button
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg inline-flex items-center"
                onClick={() => setShowDisbandModal(true)}
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Disband Company
              </button>
            </div>
          </div>
        </div>

        {/* Work History Card */}
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
              <svg className="w-8 h-8 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Work History
            </h3>
            {userTimelogs.length > 0 && (
              <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-bold">
                {userTimelogs.length} {userTimelogs.length === 1 ? 'Entry' : 'Entries'}
              </span>
            )}
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-4 font-medium">Loading your work history...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && userTimelogs.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">No work history yet</p>
              <p className="text-gray-400 text-sm mt-2">Your time logs will appear here after you complete shifts</p>
            </div>
          )}

          {!loading && !error && userTimelogs.length > 0 && (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {userTimelogs.map((log, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-100 hover:border-purple-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full p-2 mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">{log.location}</p>
                      </div>
                    </div>
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-lg">
                      {log.hours.toFixed(2)}h
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm space-x-4 ml-14">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDateTime(log.startTime)}
                    </div>
                    <span>→</span>
                    <div>{formatDateTime(log.endTime)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Manage Company Modal */}
      {showManageModal && companyInfo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative w-full max-w-lg border-4 border-green-200">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowManageModal(false)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Company Management
              </h2>
              <p className="text-gray-600">View and manage your company settings</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyInfo.name}
                  readOnly
                  className="w-full px-6 py-3 border-2 border-purple-200 rounded-xl bg-white font-bold text-gray-800 text-lg"
                />
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Employee Join Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={companyInfo.joinCode}
                    readOnly
                    className="flex-1 px-6 py-3 border-2 border-blue-200 rounded-xl bg-white font-mono font-bold text-blue-700 text-xl text-center"
                  />
                  <button
                    onClick={() => copyToClipboard(companyInfo.joinCode)}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-bold"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Share this code with employees to join</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Created On
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="text"
                    value={formatDateTime(companyInfo.createdAt)}
                    readOnly
                    className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-700"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowManageModal(false)}
                className="w-full py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-bold text-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disband Company Modal */}
      {showDisbandModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative w-full max-w-md border-4 border-red-200">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowDisbandModal(false)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="bg-red-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-red-600 mb-3">
                Disband Company?
              </h2>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
              <p className="text-gray-700 font-medium mb-2">
                ⚠️ This action <strong>cannot be undone</strong>.
              </p>
              <p className="text-gray-600 text-sm">
                All employee access will be revoked and company data will be permanently deleted.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleDisbandCompany}
                className="flex-1 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold text-lg shadow-lg"
              >
                Yes, Disband
              </button>
              <button
                onClick={() => setShowDisbandModal(false)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-bold text-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExecutiveProfile;