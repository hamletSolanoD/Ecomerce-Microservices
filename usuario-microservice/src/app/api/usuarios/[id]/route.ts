import { NextRequest, NextResponse } from 'next/server';
import { UsuarioService } from '@/services/UsuarioService';
import connectDB from '@/utils/db';
import { handleApiError } from '@/middlewares/errorHandler';
import { authMiddleware, adminMiddleware } from '@/models/authMiddleware';

const usuarioService = new UsuarioService();

// GET /api/usuarios/[id] - Obtener un usuario específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Verificar autenticación
    const authResponse = await authMiddleware(req);
    if (authResponse) return authResponse;

    // Obtener usuario autenticado
    const usuarioAuth = (req as any).usuario;
    
    // Solo permitir acceso al propio usuario o a administradores
    if (usuarioAuth.id !== params.id && usuarioAuth.tipo !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado para acceder a este usuario' },
        { status: 403 }
      );
    }

    // Obtener usuario
    const usuario = await usuarioService.obtenerUsuarioPorId(params.id);

    return NextResponse.json(usuario);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/usuarios/[id] - Actualizar un usuario específico
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const authResponse = await authMiddleware(req);
    if (authResponse) return authResponse;

    // Obtener usuario autenticado
    const usuarioAuth = (req as any).usuario;
    
    // Solo permitir actualizar el propio usuario o a administradores
    if (usuarioAuth.id !== params.id && usuarioAuth.tipo !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado para actualizar este usuario' },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    // Si no es admin, no permitir cambiar el tipo de usuario
    if (usuarioAuth.tipo !== 'ADMIN' && body.tipo !== undefined) {
      delete body.tipo;
    }

    // Actualizar usuario
    const usuarioActualizado = await usuarioService.actualizarUsuario(params.id, body);

    return NextResponse.json({
      mensaje: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/usuarios/[id] - Eliminar un usuario específico
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Solo administradores pueden eliminar usuarios
    const adminAuth = await adminMiddleware(req);
    if (adminAuth) return adminAuth;

    // Eliminar usuario
    await usuarioService.eliminarUsuario(params.id);

    return NextResponse.json({
      mensaje: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    return handleApiError(error);
  }
}