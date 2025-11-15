import React, { useState, useRef, useEffect } from "react";
import Navbar from "../../components/navbar";
import { useDarkMode } from "../../context/DarkModeContext";
import { API_BASE_URL } from "../../config/api";
import { useNotification } from "../../components/Notification";

const EmployeeHome = () => {
  const { isDarkMode } = useDarkMode();
  const { showError, showSuccess, NotificationComponent } = useNotification();
  const [isShiftActive, setIsShiftActive] = useState(
    localStorage.getItem("isShiftActive") === "true"
  );
  const [seconds, setSeconds] = useState(0);
  const [shiftStartTime, setShiftStartTime] = useState(
    localStorage.getItem("shiftStartTime") || null
  );
  const [location, setLocation] = useState(
    localStorage.getItem("shiftLocation") || "N/A"
  );
  const [showLogForm, setShowLogForm] = useState(false);
  const intervalRef = useRef(null);

  // Work area states
  const [workAreas, setWorkAreas] = useState([]);
  const [selectedWorkArea, setSelectedWorkArea] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("pending"); // pending, checking, in-range, out-of-range
  const [showWorkAreaModal, setShowWorkAreaModal] = useState(false);
  const [distanceToWorkArea, setDistanceToWorkArea] = useState(null);

  // Fetch work areas on mount
  useEffect(() => {
    fetchWorkAreas();
  }, []);

  // Calculate elapsed time on mount if shift is active
  useEffect(() => {
    if (isShiftActive && shiftStartTime) {
      const startTime = new Date(shiftStartTime);
      const now = new Date();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      setSeconds(elapsedSeconds);
    }
  }, []);

  const fetchWorkAreas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/workareas/active`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch work areas");

      const data = await response.json();
      setWorkAreas(data);
    } catch (error) {
      console.error("Error fetching work areas:", error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  const checkGeofence = (workArea, userLat, userLon) => {
    const distance = calculateDistance(
      workArea.latitude,
      workArea.longitude,
      userLat,
      userLon
    );
    setDistanceToWorkArea(distance);
    return distance <= workArea.radiusMeters;
  };

  // Timer interval to update seconds
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
  }, [isShiftActive]);

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
      // Show work area selection modal
      setShowWorkAreaModal(true);
      setLocationStatus("pending");
      setDistanceToWorkArea(null);
    }
  };

  const handleWorkAreaSelect = async (workArea) => {
    setSelectedWorkArea(workArea);
    setLocationStatus("checking");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation({ latitude, longitude });

          // Check if within geofence
          const isInRange = checkGeofence(workArea, latitude, longitude);

          if (isInRange) {
            setLocationStatus("in-range");
            // Auto-start shift after successful validation
            setTimeout(() => {
              confirmStartShift(workArea, latitude, longitude);
            }, 1500);
          } else {
            setLocationStatus("out-of-range");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          showError("Could not get your location. Please enable location services.");
          setLocationStatus("pending");
        }
      );
    } else {
      showError("Geolocation is not supported by your browser.");
      setLocationStatus("pending");
    }
  };

  const confirmStartShift = (workArea, latitude, longitude) => {
    const startTime = new Date().toISOString();
    setShiftStartTime(startTime);
    localStorage.setItem("shiftStartTime", startTime);
    localStorage.setItem("workAreaId", workArea.id);
    localStorage.setItem("checkInLatitude", latitude);
    localStorage.setItem("checkInLongitude", longitude);

    setLocation(workArea.name);
    localStorage.setItem("shiftLocation", workArea.name);

    setIsShiftActive(true);
    setShowWorkAreaModal(false);

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
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
      workAreaId: parseInt(localStorage.getItem("workAreaId")),
      checkInLatitude: parseFloat(localStorage.getItem("checkInLatitude")),
      checkInLongitude: parseFloat(localStorage.getItem("checkInLongitude")),
    };

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/timelogs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to log shift");
      }

      showSuccess("Shift logged successfully!");
      console.log("Shift logged:", payload);
    } catch (error) {
      console.error("Error logging shift:", error);
      showError(`Could not log shift: ${error.message}`);
      return;
    }

    setShowLogForm(false);
    setSeconds(0);
    setIsShiftActive(false);
    setShiftStartTime(null);
    localStorage.removeItem("isShiftActive");
    localStorage.removeItem("shiftLocation");
    localStorage.removeItem("shiftStartTime");
    localStorage.removeItem("workAreaId");
    localStorage.removeItem("checkInLatitude");
    localStorage.removeItem("checkInLongitude");
  };

  return (
    <>
      {NotificationComponent}
      <Navbar />
      <div className={`min-h-screen flex flex-col items-center py-8 pt-20 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'
      }`}>
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Employee Dashboard
          </h1>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Welcome back, <span className={`font-bold ${isDarkMode ? 'text-purple-400' : 'text-indigo-700'}`}>{localStorage.getItem("username") || "New User"}</span>
          </p>
        </div>

        {/* Main Timer Display */}
        <div className={`rounded-3xl shadow-2xl p-8 mb-8 w-full max-w-2xl border-4 transition-colors duration-300 ${
          isDarkMode
            ? 'bg-gray-800 border-purple-500'
            : 'bg-white border-indigo-200'
        }`}>
          <div className="text-center mb-6">
            <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Shift Duration</p>
            <div className={`text-6xl font-bold font-mono ${
              isShiftActive
                ? 'text-green-500'
                : isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {formatTime(seconds)}
            </div>
            {isShiftActive && (
              <div className="flex items-center justify-center mt-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-green-600 font-semibold">Shift Active</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={isShiftActive ? handleStopShift : handleStartShift}
            className={`w-full py-6 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
              isShiftActive
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
            }`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isShiftActive ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                )}
              </svg>
              {isShiftActive ? "Stop Shift" : "Start Shift"}
            </div>
          </button>
        </div>

        {/* Info Cards */}
        <div className="w-full max-w-2xl px-4 space-y-4 mb-8">
          {/* Location Card */}
          <div className={`rounded-2xl shadow-lg p-6 border transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
              : 'bg-white border-gray-100 hover:border-indigo-200'
          }`}>
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-3 mr-4">
                <img
                  src="/assets/location-pin.png"
                  alt="Location"
                  className="w-6 h-6"
                />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Current Location</h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{location}</p>
                {isShiftActive && (
                  <div className="mt-2 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-green-600 font-semibold">Tracking active</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clock Icon Card */}
          <div className={`rounded-2xl shadow-lg p-6 border transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
              : 'bg-white border-gray-100 hover:border-indigo-200'
          }`}>
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-3 mr-4">
                <img
                  src="/assets/clock-icon.png"
                  alt="Clock"
                  className="w-6 h-6"
                />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Time Tracking</h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {isShiftActive ? (
                    <>Currently tracking: <span className="font-bold text-green-600">{formatTime(seconds)}</span></>
                  ) : (
                    "Start your shift to begin tracking time"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className={`rounded-2xl shadow-lg p-6 border transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
              : 'bg-white border-gray-100 hover:border-indigo-200'
          }`}>
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-3 mr-4">
                <img
                  src="/assets/notification-bell.png"
                  alt="Notifications"
                  className="w-6 h-6"
                />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Notifications</h3>
                <div className="text-center py-4">
                  <svg className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No new notifications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Hours Modal */}
      {showLogForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative w-full max-w-md border-4 border-indigo-200 animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowLogForm(false)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Log Your Hours
              </h2>
              <p className="text-gray-600">Great work on completing your shift!</p>
            </div>

            <form onSubmit={handleSubmitHours} className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  Location
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <input
                    type="text"
                    value={location}
                    readOnly
                    className="flex-1 px-4 py-2 border-2 border-indigo-200 rounded-lg bg-white font-medium text-gray-700"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  Time Worked
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <input
                    type="text"
                    value={formatTime(seconds)}
                    readOnly
                    className="flex-1 px-4 py-2 border-2 border-green-200 rounded-lg bg-white font-bold text-2xl text-green-600 text-center font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Submit Time Log
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Work Area Selection Modal */}
      {showWorkAreaModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative w-full max-w-2xl my-8 border-4 border-indigo-200">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowWorkAreaModal(false)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Select Work Area
              </h2>
              <p className="text-gray-600">Choose your work location to start your shift</p>
            </div>

            {workAreas.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <p className="text-gray-500 font-medium">No work areas available</p>
                <p className="text-gray-400 text-sm mt-2">Contact your manager to set up work areas</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {workAreas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => handleWorkAreaSelect(area)}
                    disabled={locationStatus === "checking"}
                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
                      selectedWorkArea?.id === area.id
                        ? locationStatus === "checking"
                          ? "border-yellow-400 bg-yellow-50"
                          : locationStatus === "in-range"
                          ? "border-green-400 bg-green-50"
                          : locationStatus === "out-of-range"
                          ? "border-red-400 bg-red-50"
                          : "border-indigo-400 bg-indigo-50"
                        : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50"
                    } ${locationStatus === "checking" ? "opacity-75" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{area.name}</h3>
                        {area.address && (
                          <p className="text-gray-600 text-sm mb-2">{area.address}</p>
                        )}
                        <div className="flex items-center text-gray-500 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <span>Within {area.radiusMeters}m</span>
                        </div>

                        {/* Status indicators */}
                        {selectedWorkArea?.id === area.id && (
                          <div className="mt-3">
                            {locationStatus === "checking" && (
                              <div className="flex items-center text-yellow-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                                <span className="font-semibold">Checking location...</span>
                              </div>
                            )}
                            {locationStatus === "in-range" && (
                              <div className="flex items-center text-green-600">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold">
                                  You're in range! ({distanceToWorkArea?.toFixed(0)}m away)
                                </span>
                              </div>
                            )}
                            {locationStatus === "out-of-range" && (
                              <div className="flex items-col text-red-600">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold">
                                  Too far away ({distanceToWorkArea?.toFixed(0)}m). You must be within {area.radiusMeters}m.
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {selectedWorkArea?.id === area.id && locationStatus === "in-range" && (
                        <div className="ml-4">
                          <div className="bg-green-500 rounded-full p-2">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-blue-800 font-semibold text-sm">Location Required</p>
                  <p className="text-blue-600 text-xs mt-1">
                    You must be within the work area's radius to start your shift. Make sure location services are enabled.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeHome;
