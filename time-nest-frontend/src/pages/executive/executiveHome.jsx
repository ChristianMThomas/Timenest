import React, { useState, useEffect } from 'react';
import M_navbar from '../../components/M_navbar';
import { useDarkMode } from '../../context/DarkModeContext';

const ExecutiveHome = () => {
  const { isDarkMode } = useDarkMode();
  const [companyTimelogs, setCompanyTimelogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalHours: 0,
    activeEmployees: 0,
    todayHours: 0,
  });
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch user data to get company info
      const userResponse = await fetch("http://localhost:8080/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!userResponse.ok) throw new Error("Failed to fetch user data");
      const userData = await userResponse.json();

      // Fetch company info
      const companyResponse = await fetch(
        `http://localhost:8080/companies/${userData.company?.id}`,
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

      // Fetch company timelogs
      const timelogsResponse = await fetch(
        `http://localhost:8080/timelogs/company/${userData.company?.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!timelogsResponse.ok) throw new Error("Failed to fetch timelogs");

      const timelogsData = await timelogsResponse.json();
      // Sort by start time descending (most recent first)
      const sortedTimelogs = timelogsData.sort((a, b) =>
        new Date(b.startTime) - new Date(a.startTime)
      );
      setCompanyTimelogs(sortedTimelogs);

      // Calculate statistics
      const totalHours = timelogsData.reduce((sum, log) => sum + log.hours, 0);
      const uniqueEmployees = new Set(
        timelogsData.map((log) => log.username)
      ).size;

      const today = new Date().toISOString().split("T")[0];
      const todayHours = timelogsData
        .filter((log) => log.startTime.startsWith(today))
        .reduce((sum, log) => sum + log.hours, 0);

      setStats({
        totalHours: totalHours.toFixed(2),
        activeEmployees: uniqueEmployees,
        todayHours: todayHours.toFixed(2),
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching company data:", err);
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

  const displayedLogs = showAllLogs
    ? companyTimelogs
    : companyTimelogs.slice(0, 5);

  return (
    <>
      <M_navbar />
      <div className={`min-h-screen flex flex-col items-center py-8 pt-20 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'
      }`}>
        {/* Header Section with Animation */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Executive Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Welcome back, <span className="font-bold text-indigo-700">{localStorage.getItem("username") || "Manager"}</span>
          </p>
        </div>

        {/* Statistics Cards with Gradients */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Company Hours</p>
                <p className="text-4xl font-bold">{stats.totalHours}</p>
                <p className="text-blue-100 text-xs mt-2">All-time cumulative</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <img
                  src="/assets/clock-icon.png"
                  alt="Clock"
                  className="w-12 h-12"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Active Employees</p>
                <p className="text-4xl font-bold">{stats.activeEmployees}</p>
                <p className="text-purple-100 text-xs mt-2">Team members logging</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <img
                  src="/assets/logs.png"
                  alt="Employees"
                  className="w-12 h-12"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Today's Hours</p>
                <p className="text-4xl font-bold">{stats.todayHours}</p>
                <p className="text-green-100 text-xs mt-2">Logged today</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <img
                  src="/assets/clock-in-Icon.png"
                  alt="Today"
                  className="w-12 h-12"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Info Card - Enhanced */}
        {companyInfo && (
          <div className="bg-white rounded-2xl shadow-xl mb-8 w-full max-w-6xl p-8 border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-indigo-900 flex items-center">
                <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Company Information
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Company Name</p>
                <p className="text-xl font-bold text-indigo-900">{companyInfo.name}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Employee Join Code</p>
                <p className="text-xl font-mono font-bold text-blue-700 bg-white px-3 py-2 rounded-lg inline-block">
                  {companyInfo.joinCode}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Team Timelogs - Modern Design */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 w-full max-w-6xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-indigo-900 flex items-center">
              <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Team Time Logs
            </h3>
            {companyTimelogs.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
                {companyTimelogs.length} {companyTimelogs.length === 1 ? 'Entry' : 'Entries'}
              </span>
            )}
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 mt-4">Loading timelogs...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              Error: {error}
            </div>
          )}

          {!loading && !error && companyTimelogs.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-lg">No time logs found yet</p>
              <p className="text-gray-400 text-sm mt-2">Time entries will appear here once employees start logging hours</p>
            </div>
          )}

          {!loading && !error && companyTimelogs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-indigo-900">Employee</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-indigo-900">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-indigo-900">Start Time</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-indigo-900">End Time</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-indigo-900">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLogs.map((log, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold mr-3">
                            {(log.username || "U")[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{log.username || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {log.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(log.startTime)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(log.endTime)}</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                          {log.hours.toFixed(2)}h
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {companyTimelogs.length > 5 && (
                <div className="text-center mt-6">
                  <button
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-md"
                    onClick={() => setShowAllLogs(!showAllLogs)}
                  >
                    {showAllLogs ? "Show Less" : `Show All ${companyTimelogs.length} Entries`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Card */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 w-full max-w-md p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 rounded-full p-3 mr-3">
              <img
                src="/assets/notification-bell.png"
                alt="Notifications"
                className="w-6 h-6"
              />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
          </div>
          <div className="text-center py-4 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm">No new notifications</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExecutiveHome;