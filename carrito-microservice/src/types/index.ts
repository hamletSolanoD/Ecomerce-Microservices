import Decimal from 'decimal.js';
import { Document, Types } from 'mongoose';

// Enums
export enum EstadoCarrito {
  EN_PROCESO = 'EN_PROCESO',
  COMPRADO = 'COMPRADO',
  EXPIRADO = 'EXPIRADO'
}

export enum TipoPlan {
  MENSUAL = 'MENSUAL',
  TRIMESTRAL = 'TRIMESTRAL',
  ANUAL = 'ANUAL'
}

// Interface base para el carrito (sin métodos de Mongoose)
export interface ICarritoCompra {
  id?: string; // ID del carrito para operaciones (opcional para compatibilidad)
  usuarioId: string;
  servicioId: string;
  estado: EstadoCarrito;
  tipoPlan: TipoPlan;
  fechaAgregado: Date;
  fechaCompra?: Date;
  fechaExpiracion?: Date;
  precioCompra: string; // Guardado como string en BD
  
  // Datos adicionales que pueden venir de otros microservicios
  usuario?: IUsuarioBasico;
  servicio?: IServicioBasico;
}

// Interface para el documento de Mongoose
// Solo incluimos los métodos específicos que agregamos, no sobrescribimos los de Document
export interface ICarritoCompraDocument extends ICarritoCompra, Document {
  _id: Types.ObjectId;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Solo los métodos específicos que agregamos al schema
  getPrecioCompra(): Decimal;
  setPrecioCompra(value: Decimal | string | number): void;
  
  // No redefinimos métodos que ya existen en Document como save(), toJSON(), etc.
}

// Tipos de otros microservicios
export interface IUsuarioBasico {
  _id: string;
  nombre: string;
  email: string;
  tipo: 'COMPRADOR' | 'ADMIN';
}

export interface IServicioBasico {
  _id: string;
  id: string;
  nombre: string;
  precioPorMes: Decimal | string;
  precioPorTrimestre: Decimal | string;
  precioPorAnio: Decimal | string;
  descripcion: string;
  categoria: string;
  imagenUrl?: string;
  activo: boolean;
}

// DTOs para crear/actualizar
export interface CreateCarritoDTO {
  usuarioId: string;
  servicioId: string;
  tipoPlan: TipoPlan;
}

export interface UpdateCarritoDTO {
  tipoPlan?: TipoPlan;
  estado?: EstadoCarrito;
}

// Respuestas de API
export interface CarritoResponse {
  items: ICarritoCompra[];
  total: Decimal;
  totalItems: number;
}

export interface SuscripcionResponse {
  suscripciones: ICarritoCompra[];
  totalSuscripciones: number;
}

// Verificación de token JWT
export interface JWTPayload {
  id: string;
  nombre: string;
  email: string;
  tipo: 'COMPRADOR' | 'ADMIN';
  iat: number;
  exp: number;
}