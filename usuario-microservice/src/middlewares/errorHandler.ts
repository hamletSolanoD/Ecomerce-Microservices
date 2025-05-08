import { NextResponse } from 'next/server';

// Interfaz para errores personalizados
export interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}

// Función para manejar errores en las rutas de API
export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  // Error conocido con código de estado
  if (error instanceof Error) {
    const apiError = error as ApiError;
    
    if (apiError.statusCode) {
      return NextResponse.json(
        {
          error: apiError.message,
          details: apiError.details || null
        },
        { status: apiError.statusCode }
      );
    }
    
    // Errores de mongoose/validación
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: 'Error de validación', 
          details: error.message 
        },
        { status: 400 }
      );
    }
    
    // Errores de mongodb (duplicados, etc.)
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      // Error de clave duplicada
      if ((error as any).code === 11000) {
        return NextResponse.json(
          { 
            error: 'Registro duplicado', 
            details: 'Ya existe un registro con esos datos' 
          },
          { status: 400 }
        );
      }
    }
    
    // Error genérico conocido
    return NextResponse.json(
      { error: error.message || 'Error en la solicitud' },
      { status: 400 }
    );
  }
  
  // Error desconocido
  return NextResponse.json(
    { error: 'Error interno del servidor' },
    { status: 500 }
  );
}

// Función auxiliar para crear errores personalizados
export function createApiError(message: string, statusCode: number = 400, details?: any): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}