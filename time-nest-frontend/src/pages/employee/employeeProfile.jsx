import React, { useState } from "react";
import Navbar from "../../components/navbar";

const mockUser = {
  joinDate: "20XX-XX-XX",
  company: localStorage.getItem('company') || "N/A",
  profilePhoto: "/assets/user-icon.png",
  workHistory: [
    { date: "20XX:XX:XX", hours: 0, description: "N/A" },
    { date: "20XX:XX:XX", hours: 0, description: "N/A" },
    { date: "20XX:XX:XX", hours: 0, description: "N/A" },
  ],
};

const EmployeeProfile = () => {
  const [username, setUsername] = useState(localStorage.getItem('username') || "Y/N");
  const [editing, setEditing] = useState(false);

  const handleUsernameChange = (e) => setUsername(e.target.value);

  const handleSave = () => {
    const formattedUsername = username.replace(/\s+/g, '_'); // Replace spaces with underscores
    localStorage.setItem('username', formattedUsername); // Save formatted username
    setUsername(formattedUsername); // Update state with formatted username
    setEditing(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex flex-col items-center pt-20">
        <div className="employee-card w-full max-w-lg flex flex-col items-center">
          <img
            src={mockUser.profilePhoto}
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
            <p className="mt-2 text-gray-600">Joined: {mockUser.joinDate}</p>
            <p className="text-gray-600">Company: {mockUser.company}</p>
            <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition">
              Leave Company
            </button>
          </div>
        </div>
        <div className="employee-card w-full max-w-lg mt-6">
          <h3 className="text-xl font-bold text-black mb-4">Work History</h3>
          <ul>
            {mockUser.workHistory.map((entry, idx) => (
              <li key={idx} className="mb-2 border-b border-gray-200 pb-2">
                <span className="font-semibold">{entry.date}</span> — {entry.hours} hrs — {entry.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default EmployeeProfile;