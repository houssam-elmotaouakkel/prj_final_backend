import apiClient from './axios';

export const getProducts = (params) => {
  return apiClient.get('/products', { params });
};

export const getProductById = (id) => {
  return apiClient.get(`/products/${id}`);
};

// Admin only routes
export const createProduct = (data) => {
  return apiClient.post('/products', data);
};

export const updateProduct = (id, data) => {
  return apiClient.put(`/products/${id}`, data);
};

export const deleteProduct = (id) => {
  return apiClient.delete(`/products/${id}`);
};