import React, { useState, useRef, useEffect } from "react";
import Navbar from "../../components/navbar";

const EmployeeHome = () => {
  const [isShiftActive, setIsShiftActive] = useState(
    localStorage.getItem("isShiftActive") === "true"
  );
  const [seconds, setSeconds] = useState(
    parseInt(localStorage.getItem("shiftSeconds") || "0", 10)
  );
  const [shiftStartTime, setShiftStartTime] = useState(
    localStorage.getItem("shiftStartTime") || null
  );
  const [location, setLocation] = useState(
    localStorage.getItem("shiftLocation") || "N/A"
  );
  const [showLogForm, setShowLogForm] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isShiftActive && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isShiftActive && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isShiftActive]);

  useEffect(() => {
    localStorage.setItem("isShiftActive", isShiftActive);
    localStorage.setItem("shiftSeconds", seconds);
  }, [isShiftActive, seconds]);

  useEffect(() => {
    localStorage.setItem("shiftLocation", location);
  }, [location]);

  useEffect(() => {
    if (shiftStartTime) {
      localStorage.setItem("shiftStartTime", shiftStartTime);
    }
  }, [shiftStartTime]);

  const handleStartShift = () => {
    if (!isShiftActive) {
      const startTime = new Date().toISOString();
      setShiftStartTime(startTime);
      localStorage.setItem("shiftStartTime", startTime);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              const address = data.address;
              const locationString = `${address.road || ""}, ${
                address.city || address.town || address.village || ""
              }, ${address.state || ""}`;
              setLocation(locationString.trim() || "Address unavailable");
            } catch {
              setLocation("Address unavailable");
            }
          },
          () => {
            setLocation("Location unavailable");
          }
        );
      } else {
        setLocation("Geolocation not supported");
      }

      setIsShiftActive(true);
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleStopShift = () => {
    setIsShiftActive(false);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setShowLogForm(true);
  };

  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleSubmitHours = async (e) => {
    e.preventDefault();

    const endTime = new Date();
    const startTime = new Date(shiftStartTime);
    const durationMs = endTime - startTime;
    const hours = +(durationMs / (1000 * 60 * 60)).toFixed(2); // decimal hours

    const payload = {
      location,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      hours,
    };

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8080/timelogs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to log shift");
      }

      console.log("Shift logged:", payload);
    } catch (error) {
      console.error("Error logging shift:", error);
      alert("Could not log shift. Please try again.");
    }

    setShowLogForm(false);
    setSeconds(0);
    setIsShiftActive(false);
    setShiftStartTime(null);
    localStorage.removeItem("isShiftActive");
    localStorage.removeItem("shiftSeconds");
    localStorage.removeItem("shiftLocation");
    localStorage.removeItem("shiftStartTime");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex flex-col items-center py-8 pt-20">
        <h1 className="text-4xl font-bold mb-6 text-indigo-900">
          Employee Dashboard
        </h1>
        <h2 className="text-2xl font-bold mb-6 text-black">
          Welcome back, {localStorage.getItem("username") || "New User"}
        </h2>

        <div className="w-5/6 flex flex-row justify-around">
          <div className="flex flex-col items-center">
            <img
              src="/assets/clock-in-Icon.png"
              alt="Clock In"
              className="w-16 h-16 cursor-pointer"
              onClick={isShiftActive ? handleStopShift : handleStartShift}
              style={{ opacity: isShiftActive ? 0.5 : 1 }}
            />
            <h2
              className={`text-2xl mt-2 ${
                isShiftActive ? "text-red-600 font-bold" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={isShiftActive ? handleStopShift : handleStartShift}
            >
              {isShiftActive ? "Stop Shift" : "Start Shift"}
            </h2>
          </div>
          <div className="flex flex-col items-center">
            <img
              src="/assets/report-Icon.png"
              alt="Report Issue"
              className="w-16 h-16"
            />
            <h2 className="text-2xl mt-2">Report Issue</h2>
          </div>
        </div>

        <div className="employee-card card mb-6 w-full max-w-md">
          <div className="flex items-center mb-2">
            <img
              src="/assets/notification-bell.png"
              alt="Notification Bell"
              className="w-10 h-10 mr-2"
            />
            <ul>
              <li>No notifications yet.</li>
            </ul>
          </div>
        </div>

        <div className="employee-card card mb-6 w-full max-w-md">
          <div className="flex items-center mb-2">
            <img
              src="/assets/clock-icon.png"
              alt="Clock"
              className="w-10 h-10 mr-2"
            />
            <p>
              Hours worked:{" "}
              <span className="font-bold">{formatTime(seconds)}</span>
            </p>
          </div>
        </div>

        <div className="employee-card mb-6 card w-full max-w-md">
          <div className="flex items-center mb-2">
            <img
              src="/assets/location-pin.png"
              alt="Location Pin"
              className="w-10 h-10 mr-2"
            />
            <p>
              Current location: <span className="font-bold">{location}</span>
            </p>
          </div>
        </div>
      </div>

      {showLogForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 relative w-full max-w-sm">
            <button
              className="absolute top-2 right-2 text-xl font-bold text-gray-500 hover:text-black"
              onClick={() => setShowLogForm(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-indigo-900">
              Log Your Hours
            </h2>
            <form onSubmit={handleSubmitHours} className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Time Worked
                </label>
                <input
                  type="text"
                  value={formatTime(seconds)}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <button
                type="submit"
                className="py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeHome;
