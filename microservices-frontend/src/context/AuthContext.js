import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      authService.setAuthToken(token);
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(userData);
    }
    setLoading(false);
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { token: newToken, usuario } = response;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(usuario));
      authService.setAuthToken(newToken);
      
      setToken(newToken);
      setUser(usuario);
      
      return { success: true };
    } catch (error) {
      console.error('Error de login:', error);
      
      let errorMessage = 'Error de autenticación';
      
      if (error.response) {
        const { data, status } = error.response;
        
        if (data && data.mensaje) {
          errorMessage = data.mensaje;
        } else if (data && data.error) {
          errorMessage = data.error;
        } else if (data && data.message) {
          errorMessage = data.message;
        } else if (status === 400) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (status === 401) {
          errorMessage = 'Credenciales inválidas';
        }
      } else if (error.request) {
        errorMessage = 'No se puede conectar con el servidor';
      } else {
        errorMessage = error.message || 'Error de configuración';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { token: newToken, usuario } = response;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(usuario));
      authService.setAuthToken(newToken);
      
      setToken(newToken);
      setUser(usuario);
      
      return { success: true };
    } catch (error) {
      console.error('Error de registro:', error);
      
      let errorMessage = 'Error en el registro';
      
      if (error.response) {
        // El servidor respondió con un error
        const { data, status } = error.response;
        
        if (data && data.mensaje) {
          errorMessage = data.mensaje;
        } else if (data && data.error) {
          errorMessage = data.error;
        } else if (data && data.message) {
          errorMessage = data.message;
        } else if (status === 400) {
          // Errores específicos para código 400
          if (error.config.data) {
            const requestData = JSON.parse(error.config.data);
            if (requestData.email) {
              errorMessage = 'Email ya registrado o datos inválidos';
            }
          }
        }
      } else if (error.request) {
        // La petición se hizo pero no se recibió respuesta
        errorMessage = 'No se puede conectar con el servidor';
      } else {
        // Error al configurar la petición
        errorMessage = error.message || 'Error de configuración';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authService.setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => {
    return user?.tipo === 'ADMIN';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};