import React, { useState } from "react";
import Navbar from "../../components/navbar";
import { useEffect } from "react";
import { useDarkMode } from "../../context/DarkModeContext";
import { API_BASE_URL } from "../../config/api";
import { useNotification } from "../../components/Notification";

const EmployeeProfile = () => {
  const { isDarkMode } = useDarkMode();
  const { showError, NotificationComponent } = useNotification();
  {
    /*  Variables */
  }

  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "Y/N"
  );
  const [editing, setEditing] = useState(false);
  const [userTimelogs, setUserTimeLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  {
    /*  UseEffect */
  }

  useEffect(() => {
    //Async function to GET the user's data from backend
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
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  {
    /*  Functions */
  }

  // Function to change username
  const handleUsernameChange = (e) => setUsername(e.target.value);

  //Async function that PUTs changed username to backend
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

      if (!response.ok) throw new Error("Failed to update username");

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

  //Async function that GETs timelogs from the backend
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

  {
    /*  JSX */
  }
  return (
    <>
      {NotificationComponent}
      <Navbar />
      <div className={`min-h-screen flex flex-col items-center pt-24 px-4 pb-8 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'
      }`}>
        {/* Profile Header Card */}
        <div className={`rounded-3xl shadow-2xl w-full max-w-3xl p-8 mb-8 border-4 transition-colors duration-300 ${
          isDarkMode
            ? 'bg-gray-800 border-purple-500'
            : 'bg-white border-indigo-200'
        }`}>
          <div className="flex flex-col items-center">
            {/* Profile Picture */}
            <div className="relative mb-6">
              <img
                src={userData?.profilePhoto || "/assets/user-icon.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full border-6 border-gradient-to-r from-indigo-500 to-purple-500 shadow-xl object-cover ring-4 ring-white"
              />
              <div className="absolute bottom-0 right-0 bg-green-500 w-8 h-8 rounded-full border-4 border-white"></div>
            </div>

            {/* Username Section */}
            <div className="text-center w-full mb-6">
              {editing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    className="px-6 py-3 border-2 border-indigo-300 rounded-xl text-center text-2xl font-bold focus:border-indigo-500 outline-none w-full max-w-md"
                  />
                  <div className="flex gap-3 justify-center">
                    <button
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
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
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    {username}
                  </h2>
                  <button
                    className="px-6 py-2 bg-indigo-100 text-indigo-700 rounded-full font-bold hover:bg-indigo-200 transition-all inline-flex items-center"
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
              <div className="mt-6 inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-full">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-gray-700 font-bold text-lg">
                  {localStorage.getItem("company") || "No Company"}
                </span>
              </div>
            </div>

            {/* View Schedule Button */}
            <button
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg inline-flex items-center"
              onClick={handleGetTimelogs}
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View My Schedule
            </button>
          </div>
        </div>

        {/* Work History Card */}
        <div className={`rounded-3xl shadow-2xl w-full max-w-3xl p-8 transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Work History
            </h3>
            {userTimelogs.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-bold">
                {userTimelogs.length} {userTimelogs.length === 1 ? 'Entry' : 'Entries'}
              </span>
            )}
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-100 hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-2 mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">{log.location}</p>
                      </div>
                    </div>
                    <div className={`${log.endTime ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} px-4 py-2 rounded-full font-bold text-lg`}>
                      {log.endTime && log.hours != null ? `${log.hours.toFixed(2)}h` : 'Active'}
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
                    <div>{log.endTime ? formatDateTime(log.endTime) : 'In Progress'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeProfile;
