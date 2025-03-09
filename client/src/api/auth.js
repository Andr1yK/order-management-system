import axios from 'axios';

const API_URL = '/api/auth';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - Axios response
 */
export const register = async (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};

/**
 * Login a user
 * @param {Object} credentials - User credentials
 * @returns {Promise} - Axios response
 */
export const login = async (credentials) => {
  return axios.post(`${API_URL}/login`, credentials);
};
