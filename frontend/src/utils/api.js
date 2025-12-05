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

// Helper to extract data from backend response
// Backend returns { success: true, data: { ... } }
const extractData = (response) => {
  if (response.data && response.data.success && response.data.data !== undefined) {
    return response.data.data;
  }
  return response.data;
};

// Auth API
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return extractData(response);
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return extractData(response);
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return extractData(response);
};

// Logs API
export const getLogs = async (params = {}) => {
  const response = await api.get('/logs', { params });
  const data = extractData(response);
  // Backend returns { logs: [...], pagination: {...} }
  // Return just the logs array for backward compatibility
  return data.logs || data || [];
};

export const createLog = async (logData) => {
  const response = await api.post('/logs', logData);
  return extractData(response);
};

export const updateLog = async (id, logData) => {
  const response = await api.put(`/logs/${id}`, logData);
  return extractData(response);
};

export const deleteLog = async (id) => {
  const response = await api.delete(`/logs/${id}`);
  return extractData(response);
};

// Subscription API
export const createCheckoutSession = async (priceId) => {
  const response = await api.post('/subscription/checkout', { priceId });
  return extractData(response);
};

export const createCustomerPortal = async () => {
  const response = await api.post('/subscription/portal');
  return extractData(response);
};

export const getSubscription = async () => {
  const response = await api.get('/subscription');
  return extractData(response);
};

// Weekly Briefs API
export const getWeeklyBriefs = async () => {
  const response = await api.get('/briefs');
  const data = extractData(response);
  // Return briefs array
  return data.briefs || data || [];
};

export const generateBrief = async () => {
  const response = await api.post('/briefs/generate');
  return extractData(response);
};

export const downloadBrief = async (id) => {
  const response = await api.get(`/briefs/${id}/download`, {
    responseType: 'blob',
  });
  // Blob responses don't have the same structure
  return response.data;
};

export default api;