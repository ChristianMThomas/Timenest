import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Orginization from './pages/orginization';
import Chat from './pages/gloabal/Chat';
import EmployeeHome from './pages/employee/employeeHome';
import EmployeeProfile from './pages/employee/employeeProfile';
import ManagerHome from './pages/manager/managerHome'; 
import ManagerProfile from './pages/manager/managerProfile';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/org" element={<Orginization />} />
        <Route path="/employee/home" element={<EmployeeHome />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/employee/profile" element={<EmployeeProfile />} />
        <Route path="/manager/home" element={<ManagerHome />} />
        <Route path="/manager/profile" element={<ManagerProfile />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;