import axios from 'axios';
import { API_CONFIG } from '../config/api';

const api = axios.create({
  baseURL: API_CONFIG.SERVICES_SERVICE,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const servicesService = {
  getServices: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/servicios?${queryParams}`);
    return response.data;
  },

  getService: async (id) => {
    const response = await api.get(`/servicios/${id}`);
    return response.data;
  },

  createService: async (serviceData) => {
    const response = await api.post('/servicios', serviceData);
    return response.data;
  },

  updateService: async (id, serviceData) => {
    const response = await api.put(`/servicios/${id}`, serviceData);
    return response.data;
  },

  deleteService: async (id, hard = false) => {
    const response = await api.delete(`/servicios/${id}?hard=${hard}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categorias');
    return response.data;
  },

  getServicesByCategory: async (categoria, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/categorias/${categoria}?${queryParams}`);
    return response.data;
  },

  searchServices: async (query, params = {}) => {
    const queryParams = new URLSearchParams({ q: query, ...params }).toString();
    const response = await api.get(`/busqueda?${queryParams}`);
    return response.data;
  }
};