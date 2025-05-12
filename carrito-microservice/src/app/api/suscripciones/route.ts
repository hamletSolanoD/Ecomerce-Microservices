import { verifyToken } from '@/middlware/auth';
import { CarritoService } from '@/services/carritoService';
import { NextRequest, NextResponse } from 'next/server';


const carritoService = new CarritoService();

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const incluirExpiradas = searchParams.get('incluirExpiradas') === 'true';

    // Obtener suscripciones del usuario
    const suscripciones = await carritoService.obtenerSuscripciones(user.id, incluirExpiradas);
    return NextResponse.json(suscripciones);
  } catch (error) {
    console.error('Error obteniendo suscripciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}