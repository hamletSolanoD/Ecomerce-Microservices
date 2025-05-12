import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCartIcon, UserIcon, ServerIcon, CollectionIcon } from '@heroicons/react/outline';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { name: 'Servicios', href: '/services', icon: ServerIcon },
    { name: 'Carrito', href: '/cart', icon: ShoppingCartIcon },
    { name: 'Mis Servicios', href: '/my-services', icon: CollectionIcon },
  ];

  const isActiveRoute = (href) => {
    return location.pathname === href;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/services" className="text-2xl font-bold text-indigo-600">
                MicroServices
              </Link>
            </div>
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActiveRoute(item.href)
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{user?.nombre}</span>
              {user?.tipo === 'ADMIN' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Admin
                </span>
              )}
            </div>
            <button
              onClick={logout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  isActiveRoute(item.href)
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                <Icon className="mr-2 h-4 w-4 inline" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;