import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ServicesList from './components/services/ServicesList';
import Cart from './components/cart/Cart';
import MyServices from './components/subscriptions/MyServices';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <Layout>
                  <ServicesList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Layout>
                  <Cart />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-services"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyServices />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/services" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;