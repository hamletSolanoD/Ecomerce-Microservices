import React, { useState, useEffect } from 'react';
import { servicesService } from '../../services/servicesService';
import { cartService } from '../../services/cartService';
import { PlusIcon, SearchIcon } from '@heroicons/react/outline';
import ServiceCard from './ServiceCard';
import ServiceModal from './ServiceModal';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    categoria: '',
    activo: true
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadServices();
    loadCategories();
  }, [filters]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesService.getServices(filters);
      setServices(response.servicios);
      setPagination(response.pagination);
    } catch (err) {
      setError('Error al cargar los servicios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await servicesService.getCategories();
      setCategories(response.categorias);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const handleAddToCart = async (serviceId, planType) => {
    try {
      await cartService.addToCart(serviceId, planType);
      alert('Servicio agregado al carrito');
    } catch (err) {
      alert('Error al agregar al carrito: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
      page: 1
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadServices();
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
  };

  const handleServiceModal = (service = null) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    loadServices();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Servicios Disponibles</h1>
          {isAdmin() && (
            <button
              onClick={() => handleServiceModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Nuevo Servicio
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar servicios..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          <select
            value={filters.categoria}
            onChange={(e) => handleFilterChange('categoria', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onAddToCart={handleAddToCart}
            onEdit={isAdmin() ? () => handleServiceModal(service) : null}
          />
        ))}
      </div>

      {services.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron servicios</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 rounded-md ${
                page === pagination.page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {isModalOpen && (
        <ServiceModal
          service={selectedService}
          categories={categories}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default ServicesList;