import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
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

export const getCategories = async () => {
    const response = await api.get('/menu/categories');
    return response.data;
};

export const getMenuItems = async (categoryId) => {
    const response = await api.get('/menu/items', { params: { categoryId } });
    return response.data;
};

export const getItemModifiers = async (itemId) => {
    const response = await api.get(`/menu/items/${itemId}/modifiers`);
    return response.data;
};

export const submitOrder = async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

export const getPendingOrders = async () => {
    const response = await api.get('/kds/pending');
    return response.data;
};

export const updateItemStatus = async (itemId, status) => {
    const response = await api.put(`/kds/items/${itemId}/status`, { status });
    return response.data;
};

export const getPreConto = async (orderId) => {
    const response = await api.get(`/billing/pre-conto/${orderId}`);
    return response.data;
};

export const processPayment = async (paymentData) => {
    const response = await api.post('/billing/pay', paymentData);
    return response.data;
};

export default api;
