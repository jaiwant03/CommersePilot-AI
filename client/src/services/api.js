import axios from 'axios';

const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Pre-configured Axios instance for CommercePilot AI
 * Includes withCredentials: true for secure HTTP-only cookies
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 35000, // 35s to comfortably accommodate cloud cold starts
  withCredentials: true, // Crucial for HTTP-only cookie exchange
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor: backup Authorization header if token exists in localStorage/session
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: structured error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      data: error.response?.data || null
    };
    return Promise.reject(customError);
  }
);

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const pingServer = async () => {
  const response = await api.get('/health/ping');
  return response.data;
};

export default api;
