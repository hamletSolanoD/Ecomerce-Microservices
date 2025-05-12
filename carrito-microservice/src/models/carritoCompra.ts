import mongoose, { Schema, Model } from 'mongoose';
import Decimal from 'decimal.js';
import { EstadoCarrito, TipoPlan, ICarritoCompraDocument } from '../types';

// Schema del carrito
const carritoCompraSchema = new Schema<ICarritoCompraDocument>({
  usuarioId: {
    type: String,
    required: true,
    index: true
  },
  servicioId: {
    type: String,
    required: true,
    index: true
  },
  estado: {
    type: String,
    enum: Object.values(EstadoCarrito),
    default: EstadoCarrito.EN_PROCESO,
    required: true,
    index: true
  },
  tipoPlan: {
    type: String,
    enum: Object.values(TipoPlan),
    required: true
  },
  fechaAgregado: {
    type: Date,
    default: Date.now,
    required: true
  },
  fechaCompra: {
    type: Date,
    default: null
  },
  fechaExpiracion: {
    type: Date,
    default: null
  },
  // Guardar como string para evitar problemas de tipo
  precioCompra: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Índices adicionales
carritoCompraSchema.index({ usuarioId: 1, estado: 1 });
carritoCompraSchema.index({ servicioId: 1, estado: 1 });

// Índice único para evitar duplicados en carrito activo
carritoCompraSchema.index(
  { usuarioId: 1, servicioId: 1 },
  { 
    unique: true,
    partialFilterExpression: { estado: EstadoCarrito.EN_PROCESO },
    name: 'unique_usuario_servicio_proceso'
  }
);

// Métodos para manejar Decimal
carritoCompraSchema.methods.getPrecioCompra = function(this: ICarritoCompraDocument): Decimal {
  return new Decimal(this.precioCompra);
};

carritoCompraSchema.methods.setPrecioCompra = function(this: ICarritoCompraDocument, value: Decimal | string | number): void {
  this.precioCompra = value.toString();
};

// Método toJSON personalizado
carritoCompraSchema.methods.toJSON = function(this: ICarritoCompraDocument) {
  const obj = this.toObject() as any;
  
  // Convertir el precio a string si es necesario
  if (obj.precioCompra) {
    obj.precioCompra = obj.precioCompra.toString();
  }
  
  // Alias para compatibilidad
  obj.id = obj._id.toString();
  
  return obj;
};

// Métodos estáticos
carritoCompraSchema.statics.findByUsuarioAndEstado = function(this: Model<ICarritoCompraDocument>, usuarioId: string, estado: EstadoCarrito) {
  return this.find({ usuarioId, estado }).exec();
};

carritoCompraSchema.statics.findByUsuarioServicioEstado = function(this: Model<ICarritoCompraDocument>, usuarioId: string, servicioId: string, estado: EstadoCarrito) {
  return this.findOne({ usuarioId, servicioId, estado }).exec();
};

// Middleware pre-save para validaciones
carritoCompraSchema.pre('save', function(this: ICarritoCompraDocument, next) {
  // Asegurar que fechaCompra esté presente si estado es COMPRADO
  if (this.estado === EstadoCarrito.COMPRADO && !this.fechaCompra) {
    this.fechaCompra = new Date();
  }
  
  // Calcular fechaExpiracion si se marca como comprado
  if (this.estado === EstadoCarrito.COMPRADO && !this.fechaExpiracion && this.fechaCompra) {
    const fechaBase = this.fechaCompra;
    switch (this.tipoPlan) {
      case TipoPlan.MENSUAL:
        this.fechaExpiracion = new Date(fechaBase);
        this.fechaExpiracion.setMonth(fechaBase.getMonth() + 1);
        break;
      case TipoPlan.TRIMESTRAL:
        this.fechaExpiracion = new Date(fechaBase);
        this.fechaExpiracion.setMonth(fechaBase.getMonth() + 3);
        break;
      case TipoPlan.ANUAL:
        this.fechaExpiracion = new Date(fechaBase);
        this.fechaExpiracion.setFullYear(fechaBase.getFullYear() + 1);
        break;
    }
  }
  
  next();
});

// Type definitions para métodos estáticos
interface CarritoCompraModel extends Model<ICarritoCompraDocument> {
  findByUsuarioAndEstado(usuarioId: string, estado: EstadoCarrito): Promise<ICarritoCompraDocument[]>;
  findByUsuarioServicioEstado(usuarioId: string, servicioId: string, estado: EstadoCarrito): Promise<ICarritoCompraDocument | null>;
}

// Crear el modelo
let CarritoCompra: CarritoCompraModel;

try {
  CarritoCompra = mongoose.model<ICarritoCompraDocument, CarritoCompraModel>('CarritoCompra');
} catch {
  CarritoCompra = mongoose.model<ICarritoCompraDocument, CarritoCompraModel>('CarritoCompra', carritoCompraSchema);
}

export default CarritoCompra;
export type { ICarritoCompraDocument };