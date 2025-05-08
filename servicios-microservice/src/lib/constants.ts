/**
 * Constantes utilizadas en el microservicio de Servicios
 */

// Roles de usuario
export const ROLES = {
    ADMIN: 'admin',
    USER: 'user'
  } as const;
  
  export type UserRole = typeof ROLES[keyof typeof ROLES];
  
  // Estados de disponibilidad de servicios
  export const ESTADO_SERVICIO = {
    ACTIVO: true,
    INACTIVO: false
  } as const;
  
  // Tipos de planes disponibles (para comunicación con el microservicio de carrito)
  export const TIPO_PLAN = {
    MENSUAL: 'MENSUAL',
    TRIMESTRAL: 'TRIMESTRAL',
    ANUAL: 'ANUAL'
  } as const;
  
  export type TipoPlan = typeof TIPO_PLAN[keyof typeof TIPO_PLAN];
  
  // Campos permitidos para ordenamiento
  export const CAMPOS_ORDENAMIENTO = [
    'nombre',
    'categoria',
    'precioPorMes',
    'precioPorTrimestre',
    'precioPorAnio',
    'fechaCreacion',
    'fechaActualizacion'
  ] as const;
  
  export type CampoOrdenamiento = typeof CAMPOS_ORDENAMIENTO[number];
  
  // Configuración por defecto para paginación
  export const PAGINACION_DEFAULT = {
    PAGE: 1,
    LIMIT: 10,
    SORT: 'nombre' as CampoOrdenamiento,
    ORDER: 'asc'
  } as const;
  
  // Headers para comunicación entre microservicios
  export const HEADERS_MICROSERVICIOS = {
    API_KEY: 'X-API-KEY',
    SERVICIO_ORIGEN: 'X-SERVICIO-ORIGEN'
  } as const;
  
  // Valores para el header SERVICIO_ORIGEN
  export const SERVICIOS_NOMBRES = {
    USUARIOS: 'usuarios',
    SERVICIOS: 'servicios',
    CARRITO: 'carrito'
  } as const;
  
  export type ServicioNombre = typeof SERVICIOS_NOMBRES[keyof typeof SERVICIOS_NOMBRES];