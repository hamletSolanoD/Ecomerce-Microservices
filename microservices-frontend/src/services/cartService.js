import axios from 'axios';
import { API_CONFIG } from '../config/api';

const api = axios.create({
  baseURL: API_CONFIG.CART_SERVICE,
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

export const cartService = {
  getCart: async () => {
    const response = await api.get('/carrito');
    return response.data;
  },

  addToCart: async (servicioId, tipoPlan) => {
    const response = await api.post('/carrito', { servicioId, tipoPlan });
    return response.data;
  },

  removeFromCart: async (itemId) => {
    const response = await api.delete(`/carrito/${itemId}`);
    return response.data;
  },

  processCheckout: async () => {
    const response = await api.post('/procesar-compra');
    return response.data;
  },

  getSubscriptions: async (incluirExpiradas = false) => {
    const response = await api.get(`/suscripciones?incluirExpiradas=${incluirExpiradas}`);
    return response.data;
  },

  checkAccess: async (servicioId) => {
    const response = await api.get(`/acceso/${servicioId}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/estadisticas');
    return response.data;
  },

  updateExpiredSubscriptions: async () => {
    const response = await api.post('/jobs/actualizar-expiradas');
    return response.data;
  }
};