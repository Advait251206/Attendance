// frontend/src/api/axios.js

import axios from 'axios';

// The base URL should be a relative path. This allows Vercel's routing
// rules to correctly forward requests starting with /api to the backend.
// In local development, the package.json "proxy" field will handle this.
const apiUrl = '/';

console.log(`>>> API is connecting to: ${apiUrl}`);

// 1. A public client for login and register.
export const publicApiClient = axios.create({
  baseURL: apiUrl,
});

// 2. A secure client for authenticated calls.
export const secureApiClient = axios.create({
  baseURL: apiUrl,
});

// The interceptor adds the auth token to every request made with secureApiClient
secureApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);