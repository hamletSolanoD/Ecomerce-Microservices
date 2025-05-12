import React, { useState, useEffect } from 'react';
import { cartService } from '../../services/cartService';
import { ShoppingCartIcon, TrashIcon, CreditCardIcon } from '@heroicons/react/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const Cart = () => {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCartData(data);
    } catch (err) {
      setError('Error al cargar el carrito');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este item?')) {
      return;
    }
    try {
      await cartService.removeFromCart(itemId);
      loadCart();
    } catch (err) {
      setError('Error al eliminar el item');
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    try {
      setProcessing(true);
      await cartService.processCheckout();
      alert('Compra procesada exitosamente');
      loadCart();
    } catch (err) {
      setError('Error al procesar la compra: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(false);
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

  if (loading) return <LoadingSpinner />;

  console.log(cartData)
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <ShoppingCartIcon className="h-8 w-8 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Mi Carrito</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!cartData || cartData.items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCartIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Tu carrito está vacío</h3>
            <p className="mt-2 text-gray-500">Agrega algunos servicios para comenzar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartData.items.map((item) => (
              <div
                key={`${item.servicioId}-${item.tipoPlan}`}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.servicio?.nombre || 'Servicio'}
                  </h3>
                  <p className="text-gray-600">{item.servicio?.descripcion}</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getPlanLabel(item.tipoPlan)}
                    </span>
                    <span className="text-lg font-bold text-indigo-600">
                      {formatPrice(item.precioCompra)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Agregado: {new Date(item.fechaAgregado).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-900">
                  Total ({cartData.totalItems} items):
                </span>
                <span className="text-2xl font-bold text-indigo-600">
                  {formatPrice(cartData.total)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processing || cartData.items.length === 0}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center"
              >
                {processing ? (
                  'Procesando...'
                ) : (
                  <>
                    <CreditCardIcon className="mr-2 h-5 w-5" />
                    Procesar Compra
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;