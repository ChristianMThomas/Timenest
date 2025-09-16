import React, { useState, useEffect } from "react";
import M_navbar from "../../components/M_navbar";

const ExecutiveProfile = () => {
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "Y/N"
    
  );
  const [editing, setEditing] = useState(false);

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

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

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

      if (!response.ok) {
        throw new Error("Failed to change username");
      }

      
      const updatedUser = await response.json();
      setUsername(updatedUser.username);
      localStorage.setItem("username", updatedUser.username);
      setEditing(false);
    } catch (error) {
      console.error("Username update error:", error);
      alert("Could not update username. Please try again.");
    }
  };

  return (
    <>
      <M_navbar />
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
            <p className="mt-2 text-gray-600">
              Joined: {userData?.joinDate || "N/A"}
            </p>
            <p className="text-gray-600">
              Company: {userData?.company?.name || "N/A"}
            </p>
            <button className="mt-4 mx-5 px-4 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition">
              Manage Company
            </button>
            <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition">
              Disband Company
            </button>
          </div>
        </div>

        <div className="employee-card w-full max-w-lg mt-6">
          <h3 className="text-xl font-bold text-black mb-4">Work History</h3>
          <ul>
            {(userData?.workHistory || []).map((entry, idx) => (
              <li key={idx} className="mb-2 border-b border-gray-200 pb-2">
                <span className="font-semibold">{entry.date}</span> —{" "}
                {entry.hours} hrs — {entry.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default ExecutiveProfile;



//START WORKING ON LOGS