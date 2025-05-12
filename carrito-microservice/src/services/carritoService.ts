import { CarritoRepository } from '../repositories/CarritoRepository';
import {
  EstadoCarrito,
  TipoPlan,
  CreateCarritoDTO,
  UpdateCarritoDTO,
  ICarritoCompra,
  IUsuarioBasico,
  IServicioBasico,
  CarritoResponse,
  SuscripcionResponse,
  ICarritoCompraDocument
} from '../types';
import Decimal from 'decimal.js';
import axios from 'axios';

export class CarritoService {
  private carritoRepository: CarritoRepository;
  private readonly USERS_API_URL = process.env.USERS_MICROSERVICE_URL || 'http://localhost:3001';
  private readonly SERVICES_API_URL = process.env.SERVICES_MICROSERVICE_URL || 'http://localhost:3002';

  constructor() {
    this.carritoRepository = new CarritoRepository();
  }

  // Obtener información básica del usuario
  private async obtenerUsuario(usuarioId: string, token: string): Promise<IUsuarioBasico | null> {
    try {
      const response = await axios.get(`${this.USERS_API_URL}/api/usuarios/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  // Obtener información básica del servicio
  private async obtenerServicio(servicioId: string): Promise<IServicioBasico | null> {
    try {
      const response = await axios.get(`${this.SERVICES_API_URL}/api/servicios/${servicioId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo servicio:', error);
      return null;
    }
  }

  // Función helper para convertir cualquier tipo de precio a Decimal
  private parseDecimal(value: any): Decimal {
    if (!value) {
      throw new Error('Precio no disponible');
    }

    // Si ya es un Decimal
    if (value instanceof Decimal) {
      return value;
    }

    // Si es un objeto (posiblemente serializado de MongoDB)
    if (typeof value === 'object') {
      // MongoDB $numberDecimal format - Este es el caso principal
      if (value.$numberDecimal) {
        return new Decimal(value.$numberDecimal);
      }

      // Si es un objeto con propiedades numéricas (objeto Decimal serializado)
      if (value.d && Array.isArray(value.d)) {
        return new Decimal(value.toString());
      }

      // Último recurso: intentar convertir usando valueOf si existe
      if (value.valueOf && typeof value.valueOf === 'function') {
        const val = value.valueOf();
        if (typeof val === 'number' || typeof val === 'string') {
          return new Decimal(val);
        }
      }

      throw new Error(`No se puede parsear el objeto precio: ${JSON.stringify(value)}`);
    }

    // Si es string o number, usar directamente
    return new Decimal(value);
  }

  // Obtener precio según el tipo de plan
  private obtenerPrecioPorPlan(servicio: IServicioBasico, tipoPlan: TipoPlan): Decimal {
    console.log('Debug - servicio precios:', {
      precioPorMes: servicio.precioPorMes,
      precioPorTrimestre: servicio.precioPorTrimestre,
      precioPorAnio: servicio.precioPorAnio,
      tipoPlan
    });

    try {
      switch (tipoPlan) {
        case TipoPlan.MENSUAL:
          return this.parseDecimal(servicio.precioPorMes);
        case TipoPlan.TRIMESTRAL:
          return this.parseDecimal(servicio.precioPorTrimestre);
        case TipoPlan.ANUAL:
          return this.parseDecimal(servicio.precioPorAnio);
        default:
          throw new Error('Tipo de plan no válido');
      }
    } catch (error) {
      console.error('Error parsing precio:', error);
      throw error;
    }
  }

  // Convertir documento de carrito a ICarritoCompra
  private documentToCarritoCompra(doc: ICarritoCompraDocument): ICarritoCompra {
    return {
      id: doc._id.toString(), // ¡IMPORTANTE! Incluir el ID para operaciones
      usuarioId: doc.usuarioId,
      servicioId: doc.servicioId,
      estado: doc.estado,
      tipoPlan: doc.tipoPlan,
      fechaAgregado: doc.fechaAgregado,
      fechaCompra: doc.fechaCompra,
      fechaExpiracion: doc.fechaExpiracion,
      precioCompra: doc.precioCompra, // Ya es string en el documento
      usuario: undefined,
      servicio: undefined
    };
  }

  // Enriquecer items del carrito con datos de usuario y servicio
  private async enriquecerCarritoItems(
    items: ICarritoCompraDocument[],
    token: string
  ): Promise<ICarritoCompra[]> {
    const itemsEnriquecidos: ICarritoCompra[] = [];

    for (const item of items) {
      // Convertir documento a objeto plano
      const carritoItem = this.documentToCarritoCompra(item);

      // Obtener datos del servicio (no requiere autenticación)
      const servicio = await this.obtenerServicio(item.servicioId);

      // Obtener datos del usuario (solo para items de este usuario)
      const usuario = await this.obtenerUsuario(item.usuarioId, token);

      itemsEnriquecidos.push({
        ...carritoItem,
        // Convertir null a undefined usando el operador ||
        usuario: usuario || undefined,
        servicio: servicio || undefined
      });
    }

    return itemsEnriquecidos;
  }

  // Agregar item al carrito
  async agregarAlCarrito(data: CreateCarritoDTO, token: string): Promise<ICarritoCompra> {
    // Verificar que el servicio existe y está activo
    const servicio = await this.obtenerServicio(data.servicioId);
    if (!servicio) {
      throw new Error('Servicio no encontrado');
    }
    if (!servicio.activo) {
      throw new Error('El servicio no está disponible');
    }

    // Obtener precio según el plan
    const precio = this.obtenerPrecioPorPlan(servicio, data.tipoPlan);

    // Verificar si ya existe en el carrito
    const carritoExistente = await this.carritoRepository.findByUsuarioServicioEstado(
      data.usuarioId,
      data.servicioId,
      EstadoCarrito.EN_PROCESO
    );

    if (carritoExistente) {
      // Actualizar el plan si ya existe
      carritoExistente.tipoPlan = data.tipoPlan;
      carritoExistente.precioCompra = precio.toString();
      const itemActualizado = await carritoExistente.save();

      return this.documentToCarritoCompra(itemActualizado);
    } else {
      // Crear nuevo item
      const nuevoDoc = await this.carritoRepository.create({
        ...data,
        precioCompra: precio.toString()
      });

      return this.documentToCarritoCompra(nuevoDoc);
    }
  }

  // Obtener carrito del usuario
  async obtenerCarrito(usuarioId: string, token: string): Promise<CarritoResponse> {
    const items = await this.carritoRepository.findByUsuarioAndEstado(usuarioId, EstadoCarrito.EN_PROCESO);

    // Enriquecer con datos de servicios y usuario
    const itemsEnriquecidos = await this.enriquecerCarritoItems(items, token);

    // Calcular total
    const total = await this.carritoRepository.calcularTotalCarrito(usuarioId);

    return {
      items: itemsEnriquecidos,
      total,
      totalItems: items.length
    };
  }

  // Eliminar item del carrito
  async eliminarDelCarrito(itemId: string, usuarioId: string): Promise<void> {
    const item = await this.carritoRepository.findById(itemId);

    if (!item) {
      throw new Error('Item no encontrado en el carrito');
    }

    if (item.usuarioId !== usuarioId) {
      throw new Error('No tienes permiso para eliminar este item');
    }

    if (item.estado !== EstadoCarrito.EN_PROCESO) {
      throw new Error('Solo se pueden eliminar items en proceso');
    }

    const eliminado = await this.carritoRepository.delete(itemId);
    if (!eliminado) {
      throw new Error('Error eliminando item del carrito');
    }
  }

  // Procesar compra
  async procesarCompra(usuarioId: string, token: string): Promise<{ mensaje: string; suscripciones: ICarritoCompra[] }> {
    // Verificar que hay items en el carrito
    const itemsCarrito = await this.carritoRepository.findByUsuarioAndEstado(usuarioId, EstadoCarrito.EN_PROCESO);

    if (itemsCarrito.length === 0) {
      throw new Error('No hay items en el carrito');
    }

    // Procesar la compra
    const suscripciones = await this.carritoRepository.procesarCompra(usuarioId);

    // Enriquecer con datos de servicios
    const suscripcionesEnriquecidas = await this.enriquecerCarritoItems(suscripciones, token);

    return {
      mensaje: 'Compra procesada exitosamente',
      suscripciones: suscripcionesEnriquecidas
    };
  }

  // Obtener suscripciones del usuario
  async obtenerSuscripciones(usuarioId: string, incluirExpiradas: boolean = false): Promise<SuscripcionResponse> {
    let suscripciones;

    if (incluirExpiradas) {
      suscripciones = await this.carritoRepository.findTodasSuscripciones(usuarioId);
    } else {
      suscripciones = await this.carritoRepository.findSuscripcionesActivas(usuarioId);
    }

    // Convertir documentos a objetos planos
    const suscripcionesPlanas = suscripciones.map(doc => this.documentToCarritoCompra(doc));

    return {
      suscripciones: suscripcionesPlanas,
      totalSuscripciones: suscripciones.length
    };
  }

  // Verificar acceso a servicio
  async verificarAcceso(usuarioId: string, servicioId: string): Promise<boolean> {
    return await this.carritoRepository.tieneAccesoActivo(usuarioId, servicioId);
  }

  // Contar items en carrito
  async contarItemsCarrito(usuarioId: string): Promise<number> {
    return await this.carritoRepository.countByUsuarioAndEstado(usuarioId, EstadoCarrito.EN_PROCESO);
  }

  // Obtener estadísticas del usuario
  async obtenerEstadisticas(usuarioId: string): Promise<any> {
    return await this.carritoRepository.getEstadisticas(usuarioId);
  }

  // Job/Task para actualizar suscripciones expiradas
  async actualizarSuscripcionesExpiradas(): Promise<{ mensaje: string; actualizadas: number }> {
    const actualizadas = await this.carritoRepository.actualizarSuscripcionesExpiradas();

    return {
      mensaje: `Suscripciones actualizadas: ${actualizadas}`,
      actualizadas
    };
  }
}