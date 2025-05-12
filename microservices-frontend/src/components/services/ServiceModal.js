import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { servicesService } from '../../services/servicesService';

const ServiceModal = ({ service, categories, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    precioPorMes: '',
    precioPorTrimestre: '',
    precioPorAnio: '',
    activo: true,
    imagenUrl: '',
    fechaDisponibilidadInicio: '',
    fechaDisponibilidadFin: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (service) {
      setFormData({
        nombre: service.nombre || '',
        descripcion: service.descripcion || '',
        categoria: service.categoria || '',
        precioPorMes: service.precioPorMes || '',
        precioPorTrimestre: service.precioPorTrimestre || '',
        precioPorAnio: service.precioPorAnio || '',
        activo: service.activo ?? true,
        imagenUrl: service.imagenUrl || '',
        fechaDisponibilidadInicio: service.fechaDisponibilidadInicio 
          ? new Date(service.fechaDisponibilidadInicio).toISOString().split('T')[0] 
          : '',
        fechaDisponibilidadFin: service.fechaDisponibilidadFin 
          ? new Date(service.fechaDisponibilidadFin).toISOString().split('T')[0] 
          : ''
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        precioPorMes: parseFloat(formData.precioPorMes),
        precioPorTrimestre: parseFloat(formData.precioPorTrimestre),
        precioPorAnio: parseFloat(formData.precioPorAnio),
        fechaDisponibilidadInicio: formData.fechaDisponibilidadInicio 
          ? new Date(formData.fechaDisponibilidadInicio).toISOString() 
          : null,
        fechaDisponibilidadFin: formData.fechaDisponibilidadFin 
          ? new Date(formData.fechaDisponibilidadFin).toISOString() 
          : null
      };

      if (service) {
        await servicesService.updateService(service.id, submitData);
      } else {
        await servicesService.createService(submitData);
      }
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      return;
    }

    try {
      setLoading(true);
      await servicesService.deleteService(service.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-25" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center">
              {service ? 'Editar Servicio' : 'Nuevo Servicio'}
              <button onClick={onClose}>
                <XIcon className="h-6 w-6" />
              </button>
            </Dialog.Title>

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Precio Mensual
                  </label>
                  <input
                    type="number"
                    name="precioPorMes"
                    value={formData.precioPorMes}
                    onChange={handleChange}
                    step="0.01"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Precio Trimestral
                  </label>
                  <input
                    type="number"
                    name="precioPorTrimestre"
                    value={formData.precioPorTrimestre}
                    onChange={handleChange}
                    step="0.01"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Precio Anual
                  </label>
                  <input
                    type="number"
                    name="precioPorAnio"
                    value={formData.precioPorAnio}
                    onChange={handleChange}
                    step="0.01"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL de Imagen
                </label>
                <input
                  type="url"
                  name="imagenUrl"
                  value={formData.imagenUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Servicio activo
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                {service && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default ServiceModal;