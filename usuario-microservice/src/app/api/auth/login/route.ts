import { NextRequest, NextResponse } from 'next/server';
import { UsuarioService } from '@/services/UsuarioService';
import connectDB from '@/utils/db';
import { handleApiError } from '@/middlewares/errorHandler';

const usuarioService = new UsuarioService();

// POST /api/auth/login - Iniciar sesión
export async function POST(req: NextRequest) {
  try {
    // Conectar a la base de datos
    await connectDB();
    console.log(req)

    const body = await req.json();

    // Validar datos requeridos
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Iniciar sesión
    const { usuario, token } = await usuarioService.inicioSesion(
      body.email,
      body.password
    );

    return NextResponse.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario,
      token
    });
  } catch (error) {
    return handleApiError(error);
  }
}