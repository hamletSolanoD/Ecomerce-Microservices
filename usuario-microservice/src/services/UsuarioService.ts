import { UsuarioRepository } from '../repositories/UsuarioRepository';
import { IUsuario, TipoUsuario } from '../models/Usuario';
import jwt from 'jsonwebtoken';
import connectDB from '../utils/db';

export class UsuarioService {
  private usuarioRepository: UsuarioRepository;
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'secreto-desarrollo';

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  // Registro de usuario
  async registro(userData: {
    nombre: string;
    email: string;
    password: string;
    tipoUsuario?: TipoUsuario
  }): Promise<{ usuario: IUsuario; token: string }> {
    // Asegurar conexión a la BD
    await connectDB();

    // Verificar si el email ya existe
    const existeEmail = await this.usuarioRepository.existsByEmail(userData.email);
    if (existeEmail) {
      throw new Error('El email ya está registrado');
    }

    // Usar el tipo de usuario proporcionado o el valor por defecto si no se proporciona
    const tipoUsuario = userData.tipoUsuario || TipoUsuario.COMPRADOR;

    // Crear usuario
    const nuevoUsuario = await this.usuarioRepository.create({
      ...userData,
      tipo: tipoUsuario
    });

    // Generar token
    const token = this.generarToken(nuevoUsuario);

    return { usuario: nuevoUsuario, token };
  }

  // Inicio de sesión
  async inicioSesion(email: string, password: string): Promise<{ usuario: IUsuario; token: string }> {
    // Asegurar conexión a la BD
    await connectDB();

    // Buscar usuario por email
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña
    const passwordCorrecto = await usuario.compararPassword(password);
    if (!passwordCorrecto) {
      throw new Error('Contraseña incorrecta');
    }

    // Generar token
    const token = this.generarToken(usuario);

    return { usuario, token };
  }

  // Obtener usuario por ID
  async obtenerUsuarioPorId(id: string): Promise<IUsuario> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;
  }

  // Listar usuarios
  async listarUsuarios(pagina = 1, limite = 10): Promise<{ usuarios: IUsuario[]; total: number; paginas: number }> {
    const resultado = await this.usuarioRepository.findAll(limite, pagina);
    return {
      usuarios: resultado.usuarios,
      total: resultado.total,
      paginas: resultado.pages
    };
  }

  // Actualizar usuario
  async actualizarUsuario(id: string, userData: Partial<IUsuario>): Promise<IUsuario> {
    // Si se intenta cambiar el email, verificar que no exista
    if (userData.email) {
      const usuarioExistente = await this.usuarioRepository.findByEmail(userData.email);
      if (usuarioExistente && usuarioExistente.id !== id) {
        throw new Error('El email ya está en uso por otro usuario');
      }
    }

    const usuarioActualizado = await this.usuarioRepository.update(id, userData);
    if (!usuarioActualizado) {
      throw new Error('Usuario no encontrado');
    }
    return usuarioActualizado;
  }

  // Eliminar usuario
  async eliminarUsuario(id: string): Promise<void> {
    const resultado = await this.usuarioRepository.delete(id);
    if (!resultado) {
      throw new Error('Usuario no encontrado');
    }
  }

  // Generar token JWT
  private generarToken(usuario: IUsuario): string {
    return jwt.sign(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        tipo: usuario.tipo
      },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
}