import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { UsuarioRepository } from '../repositories/UsuarioRepository';
import connectDB from '../utils/db';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-desarrollo';

// Extender la interfaz NextRequest para incluir el usuario
declare module 'next/server' {
  interface NextRequest {
    usuario?: any;
  }
}

// Middleware de autenticación para rutas API
export async function authMiddleware(req: NextRequest) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado - Token no proporcionado' },
        { status: 401 }
      );
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // Asegurar conexión a la BD
    await connectDB();

    // Buscar usuario en la base de datos
    const usuarioRepository = new UsuarioRepository();
    const usuario = await usuarioRepository.findById(decoded.id);

    if (!usuario) {
      return NextResponse.json(
        { error: 'No autorizado - Usuario no encontrado' },
        { status: 401 }
      );
    }

    // Adjuntar usuario al request
    (req as any).usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      tipo: usuario.tipo
    };

    return null; // Continuar con la solicitud
  } catch (error) {
    // Manejar errores de JWT
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'No autorizado - Token inválido' },
        { status: 401 }
      );
    }
    
    // Otros errores
    return NextResponse.json(
      { error: 'Error en el servidor de autenticación' },
      { status: 500 }
    );
  }
}

// Middleware para verificar si el usuario es administrador
export async function adminMiddleware(req: NextRequest) {
  // Primero verificar la autenticación
  const authResponse = await authMiddleware(req);
  if (authResponse) return authResponse; // Si hay error en la autenticación

  // Verificar si es administrador
  const usuario = (req as any).usuario;
  if (usuario.tipo !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Acceso denegado - Se requiere rol de administrador' },
      { status: 403 }
    );
  }

  return null; // Continuar con la solicitud
}