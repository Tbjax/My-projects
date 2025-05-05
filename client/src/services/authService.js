import api from './api';

const authService = {
  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Promise with user data and token
   */
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Promise with user data and token
   */
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  /**
   * Get the current user's profile
   * @returns {Promise} - Promise with user data
   */
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} userData - User profile data to update
   * @returns {Promise} - Promise with updated user data
   */
  updateProfile: async (userData) => {
    const response = await api.put('/api/auth/profile', userData);
    return response.data;
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} - Promise with success message
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} - Promise with success message
   */
  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise} - Promise with success message
   */
  resetPassword: async (token, password) => {
    const response = await api.post(`/api/auth/reset-password/${token}`, { password });
    return response.data;
  },

  /**
   * Logout user (client-side only)
   */
  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export default authService;
