import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, register } from '../api/auth';

// Create context
const AuthContext = createContext();

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = Boolean(token);

  // Login user
  const loginUser = async (credentials) => {
    try {
      const response = await login(credentials);
      const { user, token } = response.data.data;

      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // Register user
  const registerUser = async (userData) => {
    try {
      const response = await register(userData);
      const { user, token } = response.data.data;

      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Load user on mount or token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch current user data
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load user');
        }

        const data = await response.json();
        setUser(data.data.user);
      } catch (error) {
        console.error('Error loading user:', error);
        logout(); // Clear invalid token
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Context value
  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    loginUser,
    registerUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
