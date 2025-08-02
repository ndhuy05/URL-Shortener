import { api } from './api.js';

export const urlService = {
  async shortenUrl(urlData) {
    try {
      const response = await api.post('/api/urls/shorten', urlData);
      return response.data;
    } catch (error) {
      let errorMessage = 'Failed to shorten URL';
      
      if (error.response?.data) {
        errorMessage = error.response.data.error || error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  async getMyUrls(page = 1, pageSize = 10) {
    try {
      const response = await api.get(`/api/urls/my-urls?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch URLs');
    }
  },

  async getUrlStats(shortCode) {
    try {
      const response = await api.get(`/api/urls/stats/${shortCode}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get URL stats');
    }
  },

  async deleteUrl(id) {
    try {
      await api.delete(`/api/urls/${id}`);
    } catch (error) {
      throw new Error('Failed to delete URL');
    }
  },

  async toggleUrlStatus(id) {
    try {
      await api.put(`/api/urls/${id}/toggle`);
    } catch (error) {
      throw new Error('Failed to toggle URL status');
    }
  },
};
