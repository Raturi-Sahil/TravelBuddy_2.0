import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/admin`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) => api.post('/login', { email, password });
export const verifyToken = () => api.get('/verify');

// Dashboard
export const getDashboardStats = () => api.get('/dashboard');

// Users
export const getUsers = (params) => api.get('/users', { params });
export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Posts
export const getPosts = (params) => api.get('/posts', { params });
export const deletePost = (id) => api.delete(`/posts/${id}`);

// Articles
export const getArticles = (params) => api.get('/articles', { params });
export const deleteArticle = (id) => api.delete(`/articles/${id}`);

// Activities
export const getActivities = (params) => api.get('/activities', { params });
export const cancelActivity = (id, reason) => api.put(`/activities/${id}/cancel`, { reason });
export const deleteActivity = (id) => api.delete(`/activities/${id}`);

// Guides
export const getGuides = (params) => api.get('/guides', { params });
export const verifyGuide = (id, isVerified) => api.put(`/guides/${id}/verify`, { isVerified });
export const toggleGuideStatus = (id) => api.put(`/guides/${id}/toggle-status`);

// Bookings
export const getGuideBookings = (params) => api.get('/bookings', { params });

export default api;
