import React, { createContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/auth/login', { email, password });
      
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      setLoading(false);
      
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred during login');
      throw err;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/auth/register', userData);
      
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      setLoading(false);
      
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred during registration');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/api/auth/me');
      
      setUser(response.data);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (err) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/auth/forgot-password', { email });
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(`/api/auth/reset-password/${token}`, { password });
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    }
  }, []);

  const updateProfile = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put('/api/auth/profile', userData);
      
      setUser(response.data);
      setLoading(false);
      
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put('/api/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        checkAuth,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
