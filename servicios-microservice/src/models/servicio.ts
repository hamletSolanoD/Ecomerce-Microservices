import mongoose, { Document, Model, Schema } from 'mongoose';
import Decimal from 'decimal.js';

// Interfaz para el documento de Servicio
export interface IServicio extends Document {
  nombre: string;
  precioPorMes: Decimal;
  precioPorTrimestre: Decimal;
  precioPorAnio: Decimal;
  descripcion: string;
  categoria: string;
  fechaDisponibilidadInicio?: Date;
  fechaDisponibilidadFin?: Date | null;
  activo: boolean;
  stock: number | null;
  imagenUrl?: string | null;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// Interfaz para el modelo de Servicio con métodos estáticos
export interface IServicioModel extends Model<IServicio> {
  findActivos(): Promise<IServicio[]>;
  findByCategoria(categoria: string): Promise<IServicio[]>;
}

// Personalizar el manejo de decimales para los precios
const decimalOptions = {
  type: Schema.Types.Decimal128,
  get: (v: mongoose.Types.Decimal128 | undefined) => 
    v === undefined ? undefined : new Decimal(v.toString()),
};

const ServicioSchema = new Schema<IServicio, IServicioModel>({
  nombre: {
    type: String,
    required: [true, 'El nombre del servicio es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
  },
  precioPorMes: {
    ...decimalOptions,
    required: [true, 'El precio mensual es obligatorio']
  },
  precioPorTrimestre: {
    ...decimalOptions,
    required: [true, 'El precio trimestral es obligatorio']
  },
  precioPorAnio: {
    ...decimalOptions,
    required: [true, 'El precio anual es obligatorio']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    trim: true,
    maxlength: [50, 'La categoría no puede exceder los 50 caracteres']
  },
  fechaDisponibilidadInicio: {
    type: Date,
    default: Date.now
  },
  fechaDisponibilidadFin: {
    type: Date,
    default: null
  },
  activo: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: null, // null significa ilimitado
  },
  imagenUrl: {
    type: String,
    default: null
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'fechaCreacion', 
    updatedAt: 'fechaActualizacion' 
  },
  toJSON: { 
    getters: true,
    transform: (doc, ret) => {
      // Convertir _id a id para la API
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      
      // Convertir los Decimal128 a strings para la API
      if (ret.precioPorMes) ret.precioPorMes = ret.precioPorMes.toString();
      if (ret.precioPorTrimestre) ret.precioPorTrimestre = ret.precioPorTrimestre.toString();
      if (ret.precioPorAnio) ret.precioPorAnio = ret.precioPorAnio.toString();
      
      return ret;
    }
  }
});

// Índices para mejorar rendimiento en búsquedas comunes
ServicioSchema.index({ nombre: 1 });
ServicioSchema.index({ categoria: 1 });
ServicioSchema.index({ activo: 1 });
ServicioSchema.index({ 'fechaDisponibilidadInicio': 1, 'fechaDisponibilidadFin': 1 });

// Middleware pre-save para actualizar fechaActualizacion
ServicioSchema.pre('save', function(this: IServicio, next) {
  this.fechaActualizacion = new Date();
  next();
});

// Método estático para buscar servicios activos
ServicioSchema.statics.findActivos = function(this: IServicioModel): Promise<IServicio[]> {
  return this.find({ activo: true });
};

// Método estático para buscar por categoría
ServicioSchema.statics.findByCategoria = function(this: IServicioModel, categoria: string): Promise<IServicio[]> {
  return this.find({ 
    categoria: categoria,
    activo: true
  });
};

// Crear el modelo (o usar el existente si ya se ha definido)
const Servicio = (mongoose.models.Servicio as IServicioModel) || 
                 mongoose.model<IServicio, IServicioModel>('Servicio', ServicioSchema);

export default Servicio;