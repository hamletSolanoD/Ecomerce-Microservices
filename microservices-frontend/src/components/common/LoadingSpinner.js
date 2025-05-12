import React from 'react';

const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className={`animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600 ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner;