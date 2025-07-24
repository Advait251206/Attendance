// frontend/src/api/axios.js

import axios from 'axios';

// Use the Vercel environment variable for the deployed API URL, 
// otherwise fall back to a local URL for development.
const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

console.log(`>>> API is connecting to: ${apiUrl}`);

// 1. A public client for login and register.
// We remove the hardcoded 'Content-Type' header. Axios will now set it
// automatically based on the data being sent.
export const publicApiClient = axios.create({
  baseURL: apiUrl,
});

// 2. A secure client for all other authenticated calls.
export const secureApiClient = axios.create({
  baseURL: apiUrl,
});

// The interceptor ONLY applies to the secure client
secureApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // For secure calls, we DO want to specify the Content-Type,
      // and most importantly, the Authorization header.
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);