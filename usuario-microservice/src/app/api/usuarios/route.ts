import { NextRequest, NextResponse } from 'next/server';
import { UsuarioService } from '@/services/UsuarioService';
import connectDB from '@/utils/db';
import { handleApiError } from '@/middlewares/errorHandler';
import { adminMiddleware } from '@/models/authMiddleware';

const usuarioService = new UsuarioService();

// GET /api/usuarios - Obtener todos los usuarios (solo admin)
export async function GET(req: NextRequest) {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Verificar que sea administrador
    const adminAuth = await adminMiddleware(req);
    if (adminAuth) return adminAuth;

    // Obtener parámetros de paginación de la URL
    const { searchParams } = new URL(req.url);
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const limite = parseInt(searchParams.get('limite') || '10');

    // Obtener usuarios paginados
    const resultado = await usuarioService.listarUsuarios(pagina, limite);

    return NextResponse.json(resultado);
  } catch (error) {
    return handleApiError(error);
  }
}