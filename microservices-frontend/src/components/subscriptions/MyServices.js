import React, { useState, useEffect } from 'react';
import { cartService } from '../../services/cartService';
import { servicesService } from '../../services/servicesService';
import { CollectionIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const MyServices = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [services, setServices] = useState({});
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExpired, setShowExpired] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, [showExpired]);

  useEffect(() => {
    if (subscriptions.length > 0) {
      const serviceIds = [...new Set(subscriptions.map(sub => sub.servicioId))];
      loadServicesDetails(serviceIds);
    }
  }, [subscriptions]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await cartService.getSubscriptions(showExpired);
      setSubscriptions(data.suscripciones);
    } catch (err) {
      setError('Error al cargar las suscripciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadServicesDetails = async (serviceIds) => {
    try {
      const servicePromises = serviceIds.map(id => servicesService.getService(id));
      const serviceResults = await Promise.all(servicePromises);
      
      const servicesMap = {};
      serviceResults.forEach(result => {
        servicesMap[result._id] = result;
      });
      
      setServices(servicesMap);
    } catch (err) {
      console.error('Error al cargar detalles de servicios:', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  const getPlanLabel = (tipoPlan) => {
    switch (tipoPlan) {
      case 'MENSUAL':
        return 'Mensual';
      case 'TRIMESTRAL':
        return 'Trimestral';
      case 'ANUAL':
        return 'Anual';
      default:
        return tipoPlan;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpired = (fechaExpiracion) => {
    return new Date(fechaExpiracion) < new Date();
  };

  const getStatusIcon = (estado, fechaExpiracion) => {
    if (estado === 'EXPIRADO' || isExpired(fechaExpiracion)) {
      return <XCircleIcon className="h-6 w-6 text-red-500" />;
    }
    return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
  };

  const getStatusText = (estado, fechaExpiracion) => {
    if (estado === 'EXPIRADO' || isExpired(fechaExpiracion)) {
      return 'Expirado';
    }
    return 'Activo';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CollectionIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Mis Servicios</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={showExpired}
                onChange={(e) => setShowExpired(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Mostrar expirados</span>
            </label>
          </div>
        </div>

        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 text-sm font-medium">Servicios Activos</div>
              <div className="text-2xl font-bold text-blue-900">{statistics.suscripcionesActivas}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-red-600 text-sm font-medium">Servicios Expirados</div>
              <div className="text-2xl font-bold text-red-900">{statistics.suscripcionesExpiradas}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-gray-600 text-sm font-medium">En Carrito</div>
              <div className="text-2xl font-bold text-gray-900">{statistics.itemsEnCarrito}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-sm font-medium">Total Gastado</div>
              <div className="text-2xl font-bold text-green-900">{formatPrice(statistics.totalGastado)}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <CollectionIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {showExpired ? 'No tienes servicios expirados' : 'No tienes servicios activos'}
          </h3>
          <p className="mt-2 text-gray-500">
            {showExpired ? 'Todos tus servicios están activos.' : 'Explore nuestros servicios y comience a suscribirse.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {subscriptions.map((subscription) => {
            const service = services[subscription.servicioId];
            return (
              <div
                key={`${subscription.servicioId}-${subscription.tipoPlan}-${subscription.fechaCompra}`}
                className={`bg-white shadow rounded-lg p-6 border-l-4 ${
                  subscription.estado === 'EXPIRADO' || isExpired(subscription.fechaExpiracion)
                    ? 'border-red-500'
                    : 'border-green-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {service?.nombre || `Servicio ${subscription.servicioId}`}
                    </h3>
                    <p className="text-gray-600">{service?.descripcion || 'Cargando descripción...'}</p>
                    {service?.categoria && (
                      <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        {service.categoria}
                      </span>
                    )}
                  </div>
                  {getStatusIcon(subscription.estado, subscription.fechaExpiracion)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getPlanLabel(subscription.tipoPlan)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      subscription.estado === 'EXPIRADO' || isExpired(subscription.fechaExpiracion)
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {getStatusText(subscription.estado, subscription.fechaExpiracion)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Precio pagado:</span>
                    <span className="font-medium text-gray-900">{formatPrice(subscription.precioCompra)}</span>
                  </div>
                  {service && (
                    <div className="flex justify-between">
                      <span>Precio actual:</span>
                      <span className="font-medium text-gray-900">
                        {(() => {
                          switch(subscription.tipoPlan) {
                            case 'MENSUAL':
                              return formatPrice(service.precioPorMes?.$numberDecimal || 0);
                            case 'TRIMESTRAL':
                              return formatPrice(service.precioPorTrimestre?.$numberDecimal || 0);
                            case 'ANUAL':
                              return formatPrice(service.precioPorAnio?.$numberDecimal || 0);
                            default:
                              return formatPrice(0);
                          }
                        })()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Comprado:</span>
                    <span>{formatDate(subscription.fechaCompra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expira:</span>
                    <span className={isExpired(subscription.fechaExpiracion) ? 'text-red-600 font-medium' : ''}>
                      {formatDate(subscription.fechaExpiracion)}
                    </span>
                  </div>
                </div>

                {!isExpired(subscription.fechaExpiracion) && subscription.estado !== 'EXPIRADO' && (
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center text-sm text-green-600">
                      <ClockIcon className="mr-1 h-4 w-4" />
                      {Math.max(0, Math.ceil((new Date(subscription.fechaExpiracion) - new Date()) / (1000 * 60 * 60 * 24)))} días restantes
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyServices;