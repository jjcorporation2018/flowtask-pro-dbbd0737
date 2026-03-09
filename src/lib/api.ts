import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to inject JWT Token on every internal request
api.interceptors.request.use(
    (config) => {
        // If the token is saved in Zustand store, get it
        const token = useAuthStore.getState().jwtToken;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
