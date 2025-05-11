import { NextRequest, NextResponse } from 'next/server';
import { UsuarioService } from '@/services/UsuarioService';
import connectDB from '@/utils/db';
import { handleApiError } from '@/middlewares/errorHandler';

const usuarioService = new UsuarioService();

// POST /api/auth/register - Registrar un nuevo usuario
export async function POST(req: NextRequest) {
  try {
    // Conectar a la base de datos
    await connectDB();

    const body = await req.json();

    // Validar datos requeridos
    if (!body.nombre || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato del email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validar longitud de la contraseña
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Registrar usuario
    const { usuario, token } = await usuarioService.registro({
      nombre: body.nombre,
      email: body.email,
      password: body.password,
      tipoUsuario: body.tipoUsuario

    });

    return NextResponse.json(
      {
        mensaje: 'Usuario registrado exitosamente',
        usuario,
        token
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}