import axios from 'axios';
import { API_CONFIG } from '../config/api';

const api = axios.create({
  baseURL: API_CONFIG.USERS_SERVICE,
});

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  getUsers: async (pagina = 1, limite = 10) => {
    const response = await api.get(`/usuarios?pagina=${pagina}&limite=${limite}`);
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/usuarios/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  }
};