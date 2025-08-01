const SHORTEN_API_URL = 'http://localhost:5002/api';

export const urlService = {
  async shortenUrl(urlData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${SHORTEN_API_URL}/url/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(urlData),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to shorten URL';
      
      try {
        const errorText = await response.text();
        console.log('Error response text:', errorText); // Debug log
        
        if (errorText) {
          try {
            const error = JSON.parse(errorText);
            console.log('Parsed error:', error); // Debug log
            errorMessage = error.error || error.message || errorText;
          } catch (parseError) {
            console.log('JSON parse failed, using raw text:', errorText); // Debug log
            errorMessage = errorText;
          }
        }
      } catch (readError) {
        console.log('Failed to read response:', readError); // Debug log
        errorMessage = response.statusText || 'Network error';
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async getMyUrls(page = 1, pageSize = 10) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${SHORTEN_API_URL}/url/my-urls?page=${page}&pageSize=${pageSize}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch URLs');
    }

    return response.json();
  },

  async getUrlStats(shortCode) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${SHORTEN_API_URL}/url/stats/${shortCode}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get URL stats');
    }

    return response.json();
  },

  async deleteUrl(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${SHORTEN_API_URL}/url/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete URL');
    }
  },

  async toggleUrlStatus(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${SHORTEN_API_URL}/url/${id}/toggle`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to toggle URL status');
    }
  },
};
