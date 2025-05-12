import React, { useState } from 'react';
import { PlusCircleIcon, PencilIcon } from '@heroicons/react/outline';

const ServiceCard = ({ service, onAddToCart, onEdit }) => {
  const [selectedPlan, setSelectedPlan] = useState('MENSUAL');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  // Función para extraer el valor decimal de MongoDB
  const extractDecimalValue = (priceObj) => {
    if (typeof priceObj === 'number') {
      return priceObj;
    }
    if (priceObj && priceObj.$numberDecimal) {
      return parseFloat(priceObj.$numberDecimal);
    }
    if (typeof priceObj === 'string') {
      return parseFloat(priceObj);
    }
    return 0;
  };

  const getPlanPrice = () => {
    switch (selectedPlan) {
      case 'MENSUAL':
        return extractDecimalValue(service.precioPorMes);
      case 'TRIMESTRAL':
        return extractDecimalValue(service.precioPorTrimestre);
      case 'ANUAL':
        return extractDecimalValue(service.precioPorAnio);
      default:
        return extractDecimalValue(service.precioPorMes);
    }
  };

  const getPlanLabel = () => {
    switch (selectedPlan) {
      case 'MENSUAL':
        return '/mes';
      case 'TRIMESTRAL':
        return '/3 meses';
      case 'ANUAL':
        return '/año';
      default:
        return '/mes';
    }
  };

  const handleAddToCart = () => {
    onAddToCart(service._id || service.id, selectedPlan);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {service.imagenUrl && (
        <img
          src={service.imagenUrl}
          alt={service.nombre}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{service.nombre}</h3>
          {onEdit && (
            <button
              onClick={() => onEdit(service)}
              className="text-gray-400 hover:text-indigo-600"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-3">{service.descripcion}</p>
        
        <div className="mb-4">
          <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
            {service.categoria}
          </span>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan:
          </label>
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="MENSUAL">Mensual - {formatPrice(extractDecimalValue(service.precioPorMes))}</option>
            <option value="TRIMESTRAL">Trimestral - {formatPrice(extractDecimalValue(service.precioPorTrimestre))}</option>
            <option value="ANUAL">Anual - {formatPrice(extractDecimalValue(service.precioPorAnio))}</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-indigo-600">
              {formatPrice(getPlanPrice())}
            </span>
            <span className="text-gray-500 text-sm">{getPlanLabel()}</span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!service.activo}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            <PlusCircleIcon className="mr-1 h-4 w-4" />
            Agregar
          </button>
        </div>

        {!service.activo && (
          <div className="mt-3 text-center">
            <span className="text-sm text-red-600 font-medium">Servicio no disponible</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;