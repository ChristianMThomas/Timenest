import React from 'react';
import M_navbar from '../../components/M_navbar';

const ManagerHome = () => {
  return (
    <>
      <M_navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex flex-col items-center py-8 pt-20">
        <h1 className="text-4xl font-bold mb-6 text-indigo-900">Manager Dashboard</h1>
        <h2 className="text-2xl font-bold mb-6 text-black">
          Welcome back, {localStorage.getItem('username') || "Manager"}
        </h2>
        <div className='w-5/6 flex flex-row justify-around mb-8'>
          <div className="flex flex-col items-center">
            <img
              src='/assets/logs.png'
              alt='Team Management'
              className='w-16 h-16'
            />
            <h2 className='text-2xl mt-2'>Team Management</h2>
          </div>
          <div className="flex flex-col items-center">
            <img
              src='/assets/report-Icon.png'
              alt='Reports'
              className='w-16 h-16'
            />
            <h2 className='text-2xl mt-2'>Reports</h2>
          </div>
        </div>
        <div className="employee-card card mb-6 w-full max-w-md">
          <div className="flex items-center mb-2">
            <img
              src='/assets/notification-bell.png'
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
              src='/assets/clock-icon.png'
              alt="Clock"
              className="w-10 h-10 mr-2"
            />
            <p>
              Today's Overview: <span className="font-bold">No data yet</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerHome;