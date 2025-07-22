import React, { createContext, useState, useEffect, useContext } from 'react';
import { publicApiClient, secureApiClient } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('accessToken');

      // If there is no token, we don't need to do anything.
      // Just finish loading and let the user see the login page.
      if (!token) {
        setLoading(false);
        return;
      }

      // If a token exists, THEN we try to validate it with the server.
      try {
        const response = await secureApiClient.get('/auth/users/me');
        setUser(response.data);
      } catch (error) {
        console.error("Token found but is invalid or expired. Clearing token.");
        localStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        // This will run regardless of success or failure.
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await publicApiClient.post('/auth/token', formData);
    const { access_token } = response.data;
    localStorage.setItem('accessToken', access_token);
    
    const userResponse = await secureApiClient.get('/auth/users/me');
    setUser(userResponse.data);
  };

  const register = async (username, email, password) => {
    await publicApiClient.post('/auth/register', { username, email, password });
    await login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};