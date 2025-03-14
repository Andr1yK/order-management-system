import axios from 'axios';

const API_URL = '/api/users';

// Create axios instance with auth token
const authAxios = () => {
  const token = localStorage.getItem('token');

  return axios.create({
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

/**
 * Get all users
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} - Axios response
 */
export const getUsers = async (page = 1, limit = 10) => {
  return authAxios().get(`${API_URL}?page=${page}&limit=${limit}`);
};

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise} - Axios response
 */
export const getUserById = async (id) => {
  return authAxios().get(`${API_URL}/${id}`);
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise} - Axios response
 */
export const createUser = async (userData) => {
  return authAxios().post(API_URL, userData);
};

/**
 * Update a user
 * @param {number} id - User ID
 * @param {Object} userData - User data
 * @returns {Promise} - Axios response
 */
export const updateUser = async (id, userData) => {
  return authAxios().patch(`${API_URL}/${id}`, userData);
};

/**
 * Update user password
 * @param {number} id - User ID
 * @param {Object} passwordData - Password data
 * @returns {Promise} - Axios response
 */
export const updatePassword = async (id, passwordData) => {
  return authAxios().patch(`${API_URL}/${id}/password`, passwordData);
};

/**
 * Delete a user
 * @param {number} id - User ID
 * @returns {Promise} - Axios response
 */
export const deleteUser = async (id) => {
  return authAxios().delete(`${API_URL}/${id}`);
};

/**
 * Get current user
 * @returns {Promise} - Axios response
 */
export const getCurrentUser = async () => {
  return authAxios().get(`${API_URL}/me`);
};
