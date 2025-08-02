import { api } from './api.js';

export const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/api/users/auth/login', credentials);
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/api/users/auth/register', userData);
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/api/users/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get profile');
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },
};
