import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');

    // Don't auto-redirect if on login page or organization page
    const publicPaths = ['/login', '/', '/org'];
    if (publicPaths.includes(location.pathname) && !token) {
      setLoading(false);
      return;
    }

    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      // Redirect to login if not on a public path
      if (!publicPaths.includes(location.pathname)) {
        navigate('/login');
      }
      return;
    }

    try {
      // Validate token by fetching user data
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const userData = await response.json();

      // Store user data
      setUser(userData);
      setIsAuthenticated(true);

      // Update localStorage with fresh data
      if (userData.username) localStorage.setItem('username', userData.username);
      if (userData.role) localStorage.setItem('role', userData.role.toLowerCase());
      if (userData.company?.name) localStorage.setItem('company', userData.company.name);
      if (userData.company?.id) localStorage.setItem('companyId', userData.company.id);

      // Auto-navigate based on role and company (only if on login or root page)
      if (location.pathname === '/login' || location.pathname === '/' || location.pathname === '/org') {
        if (userData.company?.name) {
          if (userData.role?.toUpperCase() === 'EXECUTIVE') {
            navigate('/executive/home', { replace: true });
          } else if (userData.role?.toUpperCase() === 'EMPLOYEE') {
            navigate('/employee/home', { replace: true });
          }
        } else {
          // User needs to create/join a company
          navigate('/org', { replace: true });
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      localStorage.clear();
      setIsAuthenticated(false);
      setUser(null);
      // Only redirect if not already on login page
      if (location.pathname !== '/login' && location.pathname !== '/') {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    if (userData.username) localStorage.setItem('username', userData.username);
    if (userData.role) localStorage.setItem('role', userData.role.toLowerCase());
    if (userData.company?.name) localStorage.setItem('company', userData.company.name);

    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
