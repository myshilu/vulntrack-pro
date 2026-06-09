import axios from 'axios';

// Create an Axios instance with default configuration.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
});

// Attach the Authorization header to each request if a token is stored.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;