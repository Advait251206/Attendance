// frontend/src/api/axios.js

import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

console.log(`>>> API is connecting to: ${apiUrl}`);

// 1. A public client for login and register. No headers needed here.
export const publicApiClient = axios.create({
  baseURL: apiUrl,
});

// 2. A secure client for authenticated calls. We create it without default headers.
export const secureApiClient = axios.create({
  baseURL: apiUrl,
});

// The interceptor is the single source of truth for adding auth tokens.
// It runs before every request made with `secureApiClient`.
secureApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // If a token exists, add the Authorization header.
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);