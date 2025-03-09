import axios from 'axios';

const API_URL = '/api/orders';

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
 * Get all orders
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} - Axios response
 */
export const getOrders = async (filters = {}, page = 1, limit = 10) => {
  const { status, user_id } = filters;
  let url = `${API_URL}?page=${page}&limit=${limit}`;

  if (status) url += `&status=${status}`;
  if (user_id) url += `&user_id=${user_id}`;

  return authAxios().get(url);
};

/**
 * Get order by ID
 * @param {number} id - Order ID
 * @returns {Promise} - Axios response
 */
export const getOrderById = async (id) => {
  return authAxios().get(`${API_URL}/${id}`);
};

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise} - Axios response
 */
export const createOrder = async (orderData) => {
  return authAxios().post(API_URL, orderData);
};

/**
 * Update order status
 * @param {number} id - Order ID
 * @param {string} status - New status
 * @returns {Promise} - Axios response
 */
export const updateOrderStatus = async (id, status) => {
  return authAxios().patch(`${API_URL}/${id}/status`, { status });
};

/**
 * Delete an order
 * @param {number} id - Order ID
 * @returns {Promise} - Axios response
 */
export const deleteOrder = async (id) => {
  return authAxios().delete(`${API_URL}/${id}`);
};
