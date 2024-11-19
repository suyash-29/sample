import axios from 'axios';

// Base URL for all API requests
const BASE_URL = 'https://localhost:7270/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor to add the Authorization token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
