import CarritoCompra from '@/models/carritoCompra';
import { EstadoCarrito, TipoPlan, CreateCarritoDTO, UpdateCarritoDTO, ICarritoCompra, ICarritoCompraDocument } from '../types';
import connectDB from '../utils/db';
import Decimal from 'decimal.js';

export class CarritoRepository {
  constructor() {
    // Asegurar conexión cuando se instancia
    connectDB();
  }

  // Crear nuevo item en carrito
  async create(data: CreateCarritoDTO & { precioCompra: string }): Promise<ICarritoCompraDocument> {
    await connectDB();
    const carrito = new CarritoCompra(data);
    return await carrito.save();
  }

  // Buscar por ID
  async findById(id: string): Promise<ICarritoCompraDocument | null> {
    await connectDB();
    return await CarritoCompra.findById(id);
  }

  // Buscar items del carrito por usuario y estado
  async findByUsuarioAndEstado(usuarioId: string, estado: EstadoCarrito): Promise<ICarritoCompraDocument[]> {
    await connectDB();
    return await CarritoCompra.findByUsuarioAndEstado(usuarioId, estado);
  }

  // Buscar item específico en carrito
  async findByUsuarioServicioEstado(
    usuarioId: string, 
    servicioId: string, 
    estado: EstadoCarrito
  ): Promise<ICarritoCompraDocument | null> {
    await connectDB();
    return await CarritoCompra.findByUsuarioServicioEstado(usuarioId, servicioId, estado);
  }

  // Actualizar item del carrito
  async update(id: string, data: UpdateCarritoDTO): Promise<ICarritoCompraDocument | null> {
    await connectDB();
    return await CarritoCompra.findByIdAndUpdate(
      id, 
      { ...data, updatedAt: new Date() }, 
      { new: true }
    );
  }

  // Eliminar item del carrito
  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await CarritoCompra.findByIdAndDelete(id);
    return result !== null;
  }

  // Contar items en carrito activo
  async countByUsuarioAndEstado(usuarioId: string, estado: EstadoCarrito): Promise<number> {
    await connectDB();
    return await CarritoCompra.countDocuments({ usuarioId, estado });
  }

  // Procesar compra - cambiar estado a COMPRADO
  async procesarCompra(usuarioId: string): Promise<ICarritoCompraDocument[]> {
    await connectDB();
    
    // Obtener items EN_PROCESO
    const items = await this.findByUsuarioAndEstado(usuarioId, EstadoCarrito.EN_PROCESO);
    
    // Actualizar cada item
    const itemsComprados: ICarritoCompraDocument[] = [];
    for (const item of items) {
      item.estado = EstadoCarrito.COMPRADO;
      item.fechaCompra = new Date();
      // La fechaExpiracion se calculará en el middleware pre-save
      const itemActualizado = await item.save();
      itemsComprados.push(itemActualizado);
    }
    
    return itemsComprados;
  }

  // Verificar si usuario tiene acceso a un servicio
  async tieneAccesoActivo(usuarioId: string, servicioId: string): Promise<boolean> {
    await connectDB();
    
    const suscripcion = await CarritoCompra.findOne({
      usuarioId,
      servicioId,
      estado: EstadoCarrito.COMPRADO,
      fechaExpiracion: { $gt: new Date() }
    });
    
    return suscripcion !== null;
  }

  // Obtener suscripciones activas (no expiradas)
  async findSuscripcionesActivas(usuarioId: string): Promise<ICarritoCompraDocument[]> {
    await connectDB();
    return await CarritoCompra.find({
      usuarioId,
      estado: EstadoCarrito.COMPRADO,
      fechaExpiracion: { $gt: new Date() }
    }).sort({ fechaCompra: -1 });
  }

  // Obtener todas las suscripciones (incluidas expiradas)
  async findTodasSuscripciones(usuarioId: string): Promise<ICarritoCompraDocument[]> {
    await connectDB();
    return await CarritoCompra.find({
      usuarioId,
      estado: { $in: [EstadoCarrito.COMPRADO, EstadoCarrito.EXPIRADO] }
    }).sort({ fechaCompra: -1 });
  }

  // Verificar y actualizar suscripciones expiradas
  async actualizarSuscripcionesExpiradas(): Promise<number> {
    await connectDB();
    
    const result = await CarritoCompra.updateMany(
      {
        estado: EstadoCarrito.COMPRADO,
        fechaExpiracion: { $lt: new Date() }
      },
      {
        estado: EstadoCarrito.EXPIRADO
      }
    );
    
    return result.modifiedCount;
  }

  // Estadísticas del carrito
  async getEstadisticas(usuarioId: string): Promise<{
    itemsEnCarrito: number;
    suscripcionesActivas: number;
    suscripcionesExpiradas: number;
    totalGastado: string;
  }> {
    await connectDB();
    
    const [
      itemsEnCarrito,
      suscripcionesActivas,
      suscripcionesExpiradas,
      totalGastado
    ] = await Promise.all([
      this.countByUsuarioAndEstado(usuarioId, EstadoCarrito.EN_PROCESO),
      CarritoCompra.countDocuments({
        usuarioId,
        estado: EstadoCarrito.COMPRADO,
        fechaExpiracion: { $gt: new Date() }
      }),
      CarritoCompra.countDocuments({
        usuarioId,
        estado: EstadoCarrito.EXPIRADO
      }),
      CarritoCompra.aggregate([
        {
          $match: {
            usuarioId,
            estado: { $in: [EstadoCarrito.COMPRADO, EstadoCarrito.EXPIRADO] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $toDouble: '$precioCompra' } }
          }
        }
      ])
    ]);
    
    return {
      itemsEnCarrito,
      suscripcionesActivas,
      suscripcionesExpiradas,
      totalGastado: totalGastado[0]?.total?.toString() || '0'
    };
  }

  // Calcular total del carrito
  async calcularTotalCarrito(usuarioId: string): Promise<Decimal> {
    await connectDB();
    const items = await this.findByUsuarioAndEstado(usuarioId, EstadoCarrito.EN_PROCESO);
    
    return items.reduce((total, item) => {
      return total.add(new Decimal(item.precioCompra));
    }, new Decimal(0));
  }
}