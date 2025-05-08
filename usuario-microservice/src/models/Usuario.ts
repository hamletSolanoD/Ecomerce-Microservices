import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Enumeración para el tipo de usuario
export enum TipoUsuario {
  ADMIN = 'ADMIN',
  COMPRADOR = 'COMPRADOR'
}

// Definición de la interfaz para el documento de Usuario
export interface IUsuario extends Document {
  nombre: string;
  email: string;
  password: string;
  tipo: TipoUsuario;
  fechaCreacion: Date;
  // Método para comparar contraseñas
  compararPassword(password: string): Promise<boolean>;
}

const UsuarioSchema: Schema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
      match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      maxlength: 255
    },
    tipo: {
      type: String,
      enum: Object.values(TipoUsuario),
      default: TipoUsuario.COMPRADOR
    },
    fechaCreacion: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // Agrega createdAt y updatedAt
  }
);

// Hash del password antes de guardar
UsuarioSchema.pre<IUsuario>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar contraseñas
UsuarioSchema.methods.compararPassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Excluir la contraseña cuando se convierte a JSON
UsuarioSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

// Comprueba si el modelo ya existe para evitar recompilación en desarrollo
export default mongoose.models.Usuario || mongoose.model<IUsuario>('Usuario', UsuarioSchema);