import axios from 'axios';

const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sync_code_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  guest: (displayName) => api.post('/auth/guest', { displayName }),
  getMe: () => api.get('/auth/me'),
};

// Projects API
export const projectsAPI = {
  list: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  get: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Rooms API
export const roomsAPI = {
  create: (data) => api.post('/rooms', data),
  get: (roomId) => api.get(`/rooms/${roomId}`),
  getDoc: (roomId, fileId) => api.get(`/rooms/${roomId}/documents/${fileId}`),
  saveDoc: (roomId, fileId, data) => api.put(`/rooms/${roomId}/documents/${fileId}`, data),
};

// Code Execution API
export const executeAPI = {
  run: (data) => api.post('/execute', data),
};

export default api;
