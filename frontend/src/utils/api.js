import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Logs API
export const getLogs = async () => {
  const response = await api.get('/logs');
  return response.data;
};

export const createLog = async (logData) => {
  const response = await api.post('/logs', logData);
  return response.data;
};

export const updateLog = async (id, logData) => {
  const response = await api.put(`/logs/${id}`, logData);
  return response.data;
};

export const deleteLog = async (id) => {
  const response = await api.delete(`/logs/${id}`);
  return response.data;
};

// Subscription API
export const createCheckoutSession = async (priceId) => {
  const response = await api.post('/subscription/checkout', { priceId });
  return response.data;
};

export const createCustomerPortal = async () => {
  const response = await api.post('/subscription/portal');
  return response.data;
};

export const getSubscription = async () => {
  const response = await api.get('/subscription');
  return response.data;
};

// Weekly Briefs API
export const getWeeklyBriefs = async () => {
  const response = await api.get('/briefs');
  return response.data;
};

export const downloadBrief = async (id) => {
  const response = await api.get(`/briefs/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export default api;