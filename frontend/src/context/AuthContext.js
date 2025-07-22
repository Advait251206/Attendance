import React, { createContext, useState, useEffect, useContext } from 'react';
// Import both clients as named imports
import { publicApiClient, secureApiClient } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Use the SECURE client to check the user's token
          const response = await secureApiClient.get('/auth/users/me');
          setUser(response.data);
        } catch (error) {
          console.error("Session expired or invalid token.");
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    // Use the PUBLIC client for login
    const response = await publicApiClient.post('/auth/token', formData);
    const { access_token } = response.data;
    localStorage.setItem('accessToken', access_token);
    
    // Use the SECURE client to get user details after getting the token
    const userResponse = await secureApiClient.get('/auth/users/me');
    setUser(userResponse.data);
  };

   const register = async (username, email, password) => {
    // Use the PUBLIC client for registration
    await publicApiClient.post('/auth/register', { username, email, password });
    
    // If registration is successful, automatically log the user in
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