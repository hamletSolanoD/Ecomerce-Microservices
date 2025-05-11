import ServicioRepository, { PaginationOptions, ServiciosResult, DeleteResult } from '../repositories/servicioRepository';
import { BadRequestError, ValidationError, NotFoundError } from '../middleware/errorHandler';
import * as yup from 'yup';
import Decimal from 'decimal.js';
import { IServicio } from '../models/servicio';

// Interfaz para detalles de error
interface ErrorDetail {
  field: string;
  message: string;
}

// Interfaz para la creación de servicios
export interface CreateServicioDTO {
  nombre: string;
  precioPorMes: number | string | Decimal;
  precioPorTrimestre: number | string | Decimal;
  precioPorAnio: number | string | Decimal;
  descripcion: string;
  categoria: string;
  fechaDisponibilidadInicio?: Date | string | null;
  fechaDisponibilidadFin?: Date | string | null;
  activo?: boolean;
  stock?: number | null;
  imagenUrl?: string | null;
}

// Interfaz para la actualización de servicios (todos los campos opcionales)
export interface UpdateServicioDTO {
  nombre?: string;
  precioPorMes?: number | string | Decimal;
  precioPorTrimestre?: number | string | Decimal;
  precioPorAnio?: number | string | Decimal;
  descripcion?: string;
  categoria?: string;
  fechaDisponibilidadInicio?: Date | string | null;
  fechaDisponibilidadFin?: Date | string | null;
  activo?: boolean;
  stock?: number | null;
  imagenUrl?: string | null;
}

// Esquema de validación para crear un servicio
const servicioSchema = yup.object().shape({
  nombre: yup.string()
    .required('El nombre es obligatorio')
    .max(100, 'El nombre no puede exceder los 100 caracteres'),
  
  precioPorMes: yup.mixed()
    .required('El precio mensual es obligatorio')
    .test('is-positive', 'El precio debe ser positivo', function(value: any) {
      try {
        return value && new Decimal(value).isPositive();
      } catch (error) {
        return false;
      }
    }),
  
  precioPorTrimestre: yup.mixed()
    .required('El precio trimestral es obligatorio')
    .test('is-positive', 'El precio debe ser positivo', function(value: any) {
      try {
        return value && new Decimal(value).isPositive();
      } catch (error) {
        return false;
      }
    }),
  
  precioPorAnio: yup.mixed()
    .required('El precio anual es obligatorio')
    .test('is-positive', 'El precio debe ser positivo', function(value: any) {
      try {
        return value && new Decimal(value).isPositive();
      } catch (error) {
        return false;
      }
    }),

  descripcion: yup.string()
    .required('La descripción es obligatoria'),

  categoria: yup.string()
    .required('La categoría es obligatoria')
    .max(50, 'La categoría no puede exceder los 50 caracteres'),

  fechaDisponibilidadInicio: yup.date()
    .nullable(),

  fechaDisponibilidadFin: yup.date()
    .nullable()
    .min(
      yup.ref('fechaDisponibilidadInicio'),
      'La fecha de fin debe ser posterior a la fecha de inicio'
    ),

  activo: yup.boolean()
    .default(true),

  stock: yup.number()
    .nullable()
    .min(0, 'El stock no puede ser negativo'),

  imagenUrl: yup.string()
    .nullable()
    .url('La URL de la imagen debe ser válida')
});

// Esquema para actualizar un servicio (similar pero con campos opcionales)
const updateServicioSchema = yup.object().shape({
  nombre: yup.string()
    .max(100, 'El nombre no puede exceder los 100 caracteres'),
  
  precioPorMes: yup.mixed()
    .test('is-positive', 'El precio debe ser positivo', function(value: any) {
      if (value === undefined || value === null) return true;
      try {
        return new Decimal(value).isPositive();
      } catch (error) {
        return false;
      }
    }),
  
  precioPorTrimestre: yup.mixed()
    .test('is-positive', 'El precio debe ser positivo', function(value: any) {
      if (value === undefined || value === null) return true;
      try {
        return new Decimal(value).isPositive();
      } catch (error) {
        return false;
      }
    }),
  
  precioPorAnio: yup.mixed()
    .test('is-positive', 'El precio debe ser positivo', function(value: any) {
      if (value === undefined || value === null) return true;
      try {
        return new Decimal(value).isPositive();
      } catch (error) {
        return false;
      }
    }),
  
  descripcion: yup.string(),
  
  categoria: yup.string()
    .max(50, 'La categoría no puede exceder los 50 caracteres'),
  
  fechaDisponibilidadInicio: yup.date()
    .nullable(),
  
  fechaDisponibilidadFin: yup.date()
    .nullable()
    .min(
      yup.ref('fechaDisponibilidadInicio'),
      'La fecha de fin debe ser posterior a la fecha de inicio'
    ),
  
  activo: yup.boolean(),
  
  stock: yup.number()
    .nullable()
    .min(0, 'El stock no puede ser negativo'),
  
  imagenUrl: yup.string()
    .nullable()
    .url('La URL de la imagen debe ser válida')
}).noUnknown(true, 'No se permiten campos desconocidos');

export default class ServicioService {
  /**
   * Obtiene todos los servicios con paginación y filtrado
   * @param options - Opciones de búsqueda y paginación
   * @returns Servicios con metadatos de paginación
   */
  static async getServicios(options: PaginationOptions = {}): Promise<ServiciosResult> {
    return ServicioRepository.findAll(options);
  }

  /**
   * Obtiene un servicio por su ID
   * @param id - ID del servicio
   * @returns El servicio encontrado
   */
  static async getServicioById(id: string): Promise<IServicio> {
    if (!id || id.trim() === '') {
      throw new BadRequestError('Se requiere un ID válido');
    }

    return ServicioRepository.findById(id);
  }

  /**
   * Crea un nuevo servicio con validación
   * @param data - Datos del servicio a crear
   * @returns El servicio creado
   */
  static async crearServicio(data: CreateServicioDTO): Promise<IServicio> {
    try {
      // Validar datos básicos primero
      const validatedData = await servicioSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
      });
      
      // Crear un nuevo objeto con los valores convertidos a Decimal
      const servicioData: any = { ...validatedData };
      
      // Convertir precios a Decimal para precisión
      if (servicioData.precioPorMes) {
        servicioData.precioPorMes = new Decimal(servicioData.precioPorMes);
      }
      if (servicioData.precioPorTrimestre) {
        servicioData.precioPorTrimestre = new Decimal(servicioData.precioPorTrimestre);
      }
      if (servicioData.precioPorAnio) {
        servicioData.precioPorAnio = new Decimal(servicioData.precioPorAnio);
      }

      // Crear servicio
      return ServicioRepository.create(servicioData);
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const errors: ErrorDetail[] = error.errors.map((err: string) => ({
          field: err.substring(0, err.indexOf(':')),
          message: err.substring(err.indexOf(':') + 1).trim()
        }));

        throw new ValidationError('Error de validación', errors as any);
      }

      throw error;
    }
  }

  /**
   * Actualiza un servicio existente
   * @param id - ID del servicio a actualizar
   * @param data - Datos a actualizar
   * @returns El servicio actualizado
   */
  static async actualizarServicio(id: string, data: UpdateServicioDTO): Promise<IServicio> {
    try {
      // Verificar que el servicio existe
      await this.getServicioById(id);

      // Validar datos de actualización
      const validatedData = await updateServicioSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
      });
      
      // Crear un nuevo objeto con los valores convertidos a Decimal
      const servicioData: any = { ...validatedData };

      // Convertir precios a Decimal para precisión
      if (servicioData.precioPorMes !== undefined) {
        servicioData.precioPorMes = new Decimal(servicioData.precioPorMes);
      }
      if (servicioData.precioPorTrimestre !== undefined) {
        servicioData.precioPorTrimestre = new Decimal(servicioData.precioPorTrimestre);
      }
      if (servicioData.precioPorAnio !== undefined) {
        servicioData.precioPorAnio = new Decimal(servicioData.precioPorAnio);
      }
      
      // Establecer fecha de actualización
      servicioData.fechaActualizacion = new Date();

      // Actualizar servicio
      return ServicioRepository.update(id, servicioData);
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const errors: ErrorDetail[] = error.errors.map((err: string) => ({
          field: err.substring(0, err.indexOf(':')),
          message: err.substring(err.indexOf(':') + 1).trim()
        }));

        throw new ValidationError('Error de validación', errors as any);
      }

      throw error;
    }
  }

  /**
   * Elimina un servicio (lógica o físicamente)
   * @param id - ID del servicio a eliminar
   * @param hard - Si es true, elimina físicamente
   * @returns Confirmación de eliminación
   */
  static async eliminarServicio(id: string, hard: boolean = false): Promise<DeleteResult> {
    if (!id || id.trim() === '') {
      throw new BadRequestError('Se requiere un ID válido');
    }

    return ServicioRepository.delete(id, hard);
  }

  /**
   * Obtiene todas las categorías únicas
   * @returns Lista de categorías
   */
  static async getCategorias(): Promise<string[]> {
    return ServicioRepository.getCategorias();
  }

  /**
   * Obtiene servicios por categoría
   * @param categoria - Categoría a buscar
   * @param options - Opciones de paginación
   * @returns Servicios de la categoría
   */
  static async getServiciosPorCategoria(categoria: string, options: PaginationOptions = {}): Promise<ServiciosResult> {
    if (!categoria || categoria.trim() === '') {
      throw new BadRequestError('Se requiere una categoría válida');
    }

    return ServicioRepository.findByCategoria(categoria, options);
  }

  /**
   * Busca servicios por texto
   * @param query - Texto a buscar
   * @param options - Opciones de búsqueda
   * @returns Resultados de búsqueda
   */
  static async buscarServicios(query: string, options: PaginationOptions = {}): Promise<ServiciosResult> {
    if (!query || query.trim() === '') {
      throw new BadRequestError('Se requiere un término de búsqueda');
    }

    return ServicioRepository.search(query, options);
  }
}