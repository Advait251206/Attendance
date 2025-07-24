import axios from 'axios';

// The base URL for all API calls should start with /api.
// - On Vercel, vercel.json will route this to the backend.
// - In local development, package.json's proxy will forward it.
const apiUrl = '/api';

console.log(`>>> API requests will be prefixed with: ${apiUrl}`);

// 1. A public client for login and register.
export const publicApiClient = axios.create({
  baseURL: apiUrl,
});

// 2. A secure client for all other authenticated calls.
export const secureApiClient = axios.create({
  baseURL: apiUrl,
});

// This interceptor adds the auth token to every request made with secureApiClient.
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