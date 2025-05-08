import { CAMPOS_ORDENAMIENTO, CampoOrdenamiento } from './constants';
import { IServicio } from '../models/servicio';

interface PaginationParams {
  page?: number | string;
  limit?: number | string;
  sort?: string;
  order?: string;
}

interface SanitizedPaginationParams {
  page: number;
  limit: number;
  sort: CampoOrdenamiento;
  order: 'asc' | 'desc';
}

/**
 * Valida y sanitiza parámetros de paginación
 * @param params - Parámetros de paginación 
 * @returns Parámetros sanitizados
 */
export function sanitizePaginationParams(params: PaginationParams): SanitizedPaginationParams {
  const {
    page = 1,
    limit = parseInt(process.env.DEFAULT_PAGE_SIZE || '10'),
    sort = 'nombre',
    order = 'asc'
  } = params;
  
  const sanitizedPage = Math.max(1, parseInt(page.toString()) || 1);
  const sanitizedLimit = Math.min(100, Math.max(1, parseInt(limit.toString()) || 10));
  
  // Verificar que el campo de ordenamiento sea válido
  const sanitizedSort = CAMPOS_ORDENAMIENTO.includes(sort as CampoOrdenamiento) 
    ? sort as CampoOrdenamiento 
    : 'nombre';
  
  // Verificar que la dirección de ordenamiento sea válida
  const orderLower = order?.toString().toLowerCase();
  const sanitizedOrder = ['asc', 'desc'].includes(orderLower) 
    ? orderLower as 'asc' | 'desc' 
    : 'asc';
  
  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    sort: sanitizedSort,
    order: sanitizedOrder
  };
}

/**
 * Formatea errores de validación de Yup
 * @param error - Error de validación
 * @returns Array de errores formateados
 */
export function formatValidationErrors(error: any): Array<{field: string, message: string}> {
  if (!error || !error.inner) return [];
  
  return error.inner.map((err: any) => ({
    field: err.path,
    message: err.message
  }));
}

/**
 * Verifica si un servicio está disponible en la fecha actual
 * @param servicio - Servicio a verificar
 * @returns true si está disponible
 */
export function isServicioDisponibleAhora(servicio: IServicio): boolean {
  if (!servicio.activo) return false;
  
  const now = new Date();
  
  // Si no hay fechas de disponibilidad, está disponible
  if (!servicio.fechaDisponibilidadInicio && !servicio.fechaDisponibilidadFin) {
    return true;
  }
  
  // Comprobar fecha de inicio
  if (servicio.fechaDisponibilidadInicio && new Date(servicio.fechaDisponibilidadInicio) > now) {
    return false;
  }
  
  // Comprobar fecha de fin
  if (servicio.fechaDisponibilidadFin && new Date(servicio.fechaDisponibilidadFin) < now) {
    return false;
  }
  
  return true;
}

/**
 * Verifica si hay stock disponible de un servicio
 * @param servicio - Servicio a verificar
 * @returns true si hay stock o es ilimitado
 */
export function hasStock(servicio: IServicio): boolean {
  // Si stock es null, significa stock ilimitado
  if (servicio.stock === null) return true;
  
  return servicio.stock > 0;
}