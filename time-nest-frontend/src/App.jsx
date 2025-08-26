import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Orginization from './pages/orginization';
import EmployeeHome from './pages/employee/employeeHome';
import EmployeeProfile from './pages/employee/employeeProfile';
import ExecutiveProfile from './pages/executive/executiveProfile';
import ExecutiveHome from './pages/executive/executiveHome';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/org" element={<Orginization />} />
        <Route path="/employee/home" element={<EmployeeHome />} />
        <Route path="/employee/profile" element={<EmployeeProfile />} />
        <Route path="/executive/home" element={<ExecutiveHome />} />
        <Route path="/executive/profile" element={<ExecutiveProfile />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;