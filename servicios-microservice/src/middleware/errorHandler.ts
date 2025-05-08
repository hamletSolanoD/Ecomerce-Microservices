import { NextRequest, NextResponse } from 'next/server';

/**
 * Errores personalizados para la API
 */
export class ApiError extends Error {
  statusCode: any;
  errors: never[];
  constructor(message: string | undefined, statusCode: any, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Solicitud inválida', errors = []) {
    super(message, 400, errors);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Recurso no encontrado', errors = []) {
    super(message, 404, errors);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'No autorizado', errors = []) {
    super(message, 401, errors);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Acceso prohibido', errors = []) {
    super(message, 403, errors);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Error de validación', errors = []) {
    super(message, 422, errors);
  }
}

// Tipo para el handler original
type RouteHandler = (
  req: NextRequest,
  params?: { params: Record<string, string> }
) => Promise<NextResponse> | NextResponse;

/**
 * Middleware para manejar errores de forma centralizada
 * @param handler - El manejador de ruta original
 * @returns El manejador envuelto en try/catch
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, params) => {
    try {
      return await handler(req, params);
    } catch (error: any) {
      console.error('Error en API:', error);
      
      // Si es un error de API personalizado
      if (error instanceof ApiError) {
        return NextResponse.json({
          error: error.message,
          details: error.errors.length > 0 ? error.errors : undefined
        }, {
          status: error.statusCode
        });
      }
      
      // Si es un error de validación de Mongoose
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((err: any) => ({
          field: err.path,
          message: err.message
        }));
        
        return NextResponse.json({
          error: 'Error de validación',
          details: errors
        }, {
          status: 422
        });
      }
      
      // Si es un error de casteo de Mongoose (ej: ID inválido)
      if (error.name === 'CastError') {
        return NextResponse.json({
          error: 'Formato de datos inválido',
          details: [{
            field: error.path,
            message: `No se pudo convertir '${error.value}' a ${error.kind}`
          }]
        }, {
          status: 400
        });
      }
      
      // Cualquier otro error no controlado se trata como error del servidor
      return NextResponse.json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, {
        status: 500
      });
    }
  };
}