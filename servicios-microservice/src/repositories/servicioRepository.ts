import connectDB from '../utils/db';
import Servicio, { IServicio } from '../models/servicio';
import { NotFoundError } from '../middleware/errorHandler';
import { FilterQuery } from 'mongoose';

// Interfaces para las opciones y resultados
export interface PaginationOptions {
  page?: number | string;
  limit?: number | string;
  sort?: string;
  order?: string;
  activo?: boolean | string;
  categoria?: string;
  search?: string;
  disponibleAhora?: boolean | string;
  [key: string]: any;
}

export interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ServiciosResult {
  servicios: IServicio[];
  pagination: PaginationResult;
}

export interface DeleteResult {
  id: string;
  deleted: boolean;
  message: string;
}

export default class ServicioRepository {
  /**
   * Inicializa la conexión a la base de datos
   */
  static async init(): Promise<void> {
    await connectDB();
  }

  /**
   * Encuentra todos los servicios con opciones de paginación y filtrado
   * @param options - Opciones de búsqueda y paginación
   * @returns Servicios con metadatos de paginación
   */
  static async findAll(options: PaginationOptions = {}): Promise<ServiciosResult> {
    await this.init();

    const {
      page = 1,
      limit = parseInt(process.env.DEFAULT_PAGE_SIZE || '10'),
      sort = 'nombre',
      order = 'asc',
      activo,
      categoria,
      search,
      disponibleAhora
    } = options;

    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit) : limit;

    const skip = (pageNum - 1) * limitNum;
    const sortDirection = order === 'desc' ? -1 : 1;

    // Construir el filtro
    const filter: FilterQuery<IServicio> = {};

    if (activo !== undefined) {
      filter.activo = activo === 'true' || activo === true;
    }

    if (categoria) {
      filter.categoria = categoria;
    }

    if (search) {
      filter.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { descripcion: { $regex: search, $options: 'i' } }
      ];
    }

    if (disponibleAhora === 'true' || disponibleAhora === true) {
      const now = new Date();
      filter.$and = [
        {
          $or: [
            { fechaDisponibilidadInicio: { $lte: now } },
            { fechaDisponibilidadInicio: null }
          ]
        },
        {
          $or: [
            { fechaDisponibilidadFin: { $gte: now } },
            { fechaDisponibilidadFin: null }
          ]
        }
      ];
    }
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sort] = sortDirection as 1 | -1;
    // Ejecutar la consulta
    const [servicios, total] = await Promise.all([
      Servicio.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Servicio.countDocuments(filter)
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(total / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    return {
      servicios,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext,
        hasPrev
      }
    };
  }

  /**
   * Encuentra un servicio por su ID
   * @param id - ID del servicio a buscar
   * @returns El servicio encontrado
   * @throws NotFoundError - Si el servicio no existe
   */
  static async findById(id: string): Promise<IServicio> {
    await this.init();

    const servicio = await Servicio.findById(id).lean();

    if (!servicio) {
      throw new NotFoundError(`Servicio con ID ${id} no encontrado`);
    }

    return servicio as IServicio;
  }

  /**
   * Crea un nuevo servicio
   * @param data - Datos del servicio a crear
   * @returns El servicio creado
   */
  static async create(data: Partial<IServicio>): Promise<IServicio> {
    await this.init();

    const nuevoServicio = new Servicio({
      ...data,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    });

    await nuevoServicio.save();
    return nuevoServicio.toJSON();
  }

  /**
   * Actualiza un servicio existente
   * @param id - ID del servicio a actualizar
   * @param data - Datos a actualizar
   * @returns El servicio actualizado
   * @throws NotFoundError - Si el servicio no existe
   */
  static async update(id: string, data: Partial<IServicio>): Promise<IServicio> {
    await this.init();

    const servicio = await Servicio.findById(id);

    if (!servicio) {
      throw new NotFoundError(`Servicio con ID ${id} no encontrado`);
    }

    // Actualizar propiedades
    Object.keys(data).forEach(key => {
      if (key !== 'id' && key !== '_id' && key !== 'fechaCreacion') {
        // @ts-ignore - Propiedad dinámica
        servicio[key] = data[key as keyof IServicio];
      }
    });

    servicio.fechaActualizacion = new Date();

    await servicio.save();
    return servicio.toJSON();
  }

  /**
   * Elimina un servicio (borrado lógico o físico)
   * @param id - ID del servicio a eliminar
   * @param hard - Si es true, elimina físicamente, sino marca como inactivo
   * @returns Confirmación de eliminación
   * @throws NotFoundError - Si el servicio no existe
   */
  static async delete(id: string, hard: boolean = false): Promise<DeleteResult> {
    await this.init();

    const servicio = await Servicio.findById(id);

    if (!servicio) {
      throw new NotFoundError(`Servicio con ID ${id} no encontrado`);
    }

    if (hard) {
      // Borrado físico
      await Servicio.deleteOne({ _id: id });
      return { id, deleted: true, message: 'Servicio eliminado permanentemente' };
    } else {
      // Borrado lógico
      servicio.activo = false;
      servicio.fechaActualizacion = new Date();
      await servicio.save();
      return { id, deleted: false, message: 'Servicio desactivado' };
    }
  }

  /**
   * Obtiene todas las categorías únicas de servicios activos
   * @returns Lista de categorías únicas
   */
  static async getCategorias(): Promise<string[]> {
    await this.init();

    const categorias = await Servicio.distinct('categoria', { activo: true });
    return categorias;
  }

  /**
   * Encuentra servicios por categoría
   * @param categoria - Categoría a buscar
   * @param options - Opciones de paginación
   * @returns Servicios filtrados por categoría con metadatos
   */
  static async findByCategoria(categoria: string, options: PaginationOptions = {}): Promise<ServiciosResult> {
    const opts = { ...options, categoria };
    return this.findAll(opts);
  }

  /**
   * Busca servicios con texto libre
   * @param query - Texto a buscar
   * @param options - Opciones de paginación
   * @returns Servicios que coinciden con la búsqueda
   */
  static async search(query: string, options: PaginationOptions = {}): Promise<ServiciosResult> {
    const opts = { ...options, search: query, activo: true };
    return this.findAll(opts);
  }
}