import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor to add JWT token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('riva_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const loginUser = async (pin) => {
    const response = await api.post('/users/login', { pin });
    return response.data;
};

export const getZones = async () => {
    const response = await api.get('/tables/zones');
    return response.data;
};

export const getTables = async () => {
    const response = await api.get('/tables');
    return response.data;
};

export default api;
