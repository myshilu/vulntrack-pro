import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the context
export const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If a token exists attempt to fetch the current user
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        } catch {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, formData);
    setToken(res.data.access_token);
    localStorage.setItem('token', res.data.access_token);
    // load user
    const me = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${res.data.access_token}` },
    });
    setUser(me.data);
  };

  const register = async (email, password) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
      email,
      password,
    });
    // Immediately log in after registering
    await login(email, password);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = { user, token, loading, login, logout, register };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
