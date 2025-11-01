import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DarkModeProvider } from './context/DarkModeContext';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/login';
import Orginization from './pages/orginization';
import EmployeeHome from './pages/employee/employeeHome';
import EmployeeProfile from './pages/employee/employeeProfile';
import ExecutiveProfile from './pages/executive/executiveProfile';
import ExecutiveHome from './pages/executive/executiveHome';
import ExecutiveWorkAreas from './pages/executive/executiveWorkAreas';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/org"
              element={
                <ProtectedRoute>
                  <Orginization />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/home"
              element={
                <ProtectedRoute>
                  <EmployeeHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/profile"
              element={
                <ProtectedRoute>
                  <EmployeeProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/executive/home"
              element={
                <ProtectedRoute>
                  <ExecutiveHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/executive/profile"
              element={
                <ProtectedRoute>
                  <ExecutiveProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/executive/workareas"
              element={
                <ProtectedRoute>
                  <ExecutiveWorkAreas />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </DarkModeProvider>
  );
};

export default App;