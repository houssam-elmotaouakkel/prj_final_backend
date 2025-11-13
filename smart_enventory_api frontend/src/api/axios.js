import axios from 'axios';
import useAuthStore from '../store/useAuthStore'; // Import inside the interceptor to avoid circular dependency issues

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Replace with your actual backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token; // Get token from the store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;