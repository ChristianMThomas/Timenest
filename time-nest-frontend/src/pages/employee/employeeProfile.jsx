import React, { useState } from "react";
import Navbar from "../../components/navbar";
import { useEffect } from "react";

const EmployeeProfile = () => {
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "Y/N"
  );
  const [editing, setEditing] = useState(false);
  const [userTimelogs, setUserTimeLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:8080/users/me", {
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

  const handleUsernameChange = (e) => setUsername(e.target.value);

  const handleSave = async () => {
    const formattedUsername = username.replace(/\s+/g, "_");

    try {
      const response = await fetch("http://localhost:8080/users/me/username", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newUsername: formattedUsername }),
      });

      if (!response.ok) throw new Error("Failed to update username");

      // ✅ Re-fetch profile to get updated username
      const profileResponse = await fetch("http://localhost:8080/users/me", {
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
      alert("Could not update username. Please try again.");
    }
  };

  const handleGetTimelogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8080/timelogs/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Repsonse was not ok");
      const result = await response.json();
      console.log(result);
      setUserTimeLogs(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex flex-col items-center pt-20">
        <div className="employee-card w-full max-w-lg flex flex-col items-center">
          <img
            src={userData?.profilePhoto || "/assets/user-icon.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-black mb-4 object-cover"
          />
          <div className="mb-4 text-center">
            {editing ? (
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className="px-4 py-2 border border-black rounded-full mb-2"
                />
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-black">{username}</h2>
                <button
                  className="mt-2 px-4 py-1 border border-black rounded-full text-black font-semibold bg-indigo-50 hover:bg-indigo-200 transition"
                  onClick={() => setEditing(true)}
                >
                  Change Username
                </button>
              </div>
            )}

            <p className="text-gray-600 text-lg mt-2.5 italic">
              Company: {localStorage.getItem("company")}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-black text-white rounded-full font-semibold hover:bg-gray-600 transition"
              onClick={handleGetTimelogs}
            >
              View Schedule
            </button>
          </div>
        </div>

        <div className="employee-card w-full max-w-lg mt-6">
          <h3 className="text-xl font-bold text-black mb-4">Work History</h3>
          {loading && <p>Fetching Work History...</p>}
          {error && (
            <p className="text-red-800 font-medium text-lg">Error: {error}</p>
          )}
          {!loading && userTimelogs.length === 0 && (
            <p className="text-gray-500 italic">No timelogs found.</p>
          )}
          <ul>
            {userTimelogs.map((log, idx) => (
              <li key={idx} className="mb-2 border-b border-gray-200 pb-2 flex flex-col m-3 p-2">
                <span className="font-semibold">Location: {log.location}</span>{" "}
                                                Shift Duration: {log.startTime} — {log.endTime} <br></br>
                                                Hours: {log.hours} 
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default EmployeeProfile;




//TODO LIST 
// MAKE TIME IN TIMEZONE BASED ON LOCATION
// MAKE WORK HISTORY SCROLL IF TOO MANY LOGS
// MAKE TIME CONTINUE TO TRACK EVEN NOT ON HOMEPAGE
// IMPROVE UI


