import connectDB from '@/utils/db';
import Usuario, { IUsuario } from '../models/Usuario';

export class UsuarioRepository {
  // Obtener todos los usuarios
  async findAll(limit = 10, page = 1, filter = {}): Promise<{ usuarios: IUsuario[]; total: number; pages: number }> {
    await connectDB();
    
    const skip = (page - 1) * limit;
    const usuarios = await Usuario.find(filter)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await Usuario.countDocuments(filter);
    
    return {
      usuarios,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  // Obtener un usuario por ID
  async findById(id: string): Promise<IUsuario | null> {
    await connectDB();
    return await Usuario.findById(id);
  }

  // Obtener un usuario por email
  async findByEmail(email: string): Promise<IUsuario | null> {
    await connectDB();
    return await Usuario.findOne({ email });
  }

  // Verificar si existe un email
  async existsByEmail(email: string): Promise<boolean> {
    await connectDB();
    const count = await Usuario.countDocuments({ email });
    return count > 0;
  }

  // Crear un nuevo usuario
  async create(userData: Partial<IUsuario>): Promise<IUsuario> {
    await connectDB();
    return await Usuario.create(userData);
  }

  // Actualizar un usuario
  async update(id: string, userData: Partial<IUsuario>): Promise<IUsuario | null> {
    await connectDB();
    return await Usuario.findByIdAndUpdate(
      id,
      { $set: userData },
      { new: true, runValidators: true }
    );
  }

  // Eliminar un usuario
  async delete(id: string): Promise<IUsuario | null> {
    await connectDB();
    return await Usuario.findByIdAndDelete(id);
  }
}