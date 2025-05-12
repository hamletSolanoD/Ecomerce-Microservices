import { verifyToken } from '@/middlware/auth';
import { CarritoService } from '@/services/carritoService';
import { NextRequest, NextResponse } from 'next/server';


const carritoService = new CarritoService();

export async function GET(
  request: NextRequest,
  { params }: { params: { servicioId: string } }
) {
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

    const { servicioId } = params;

    if (!servicioId) {
      return NextResponse.json({ error: 'ID de servicio inválido' }, { status: 400 });
    }

    // Verificar si el usuario tiene acceso al servicio
    const tieneAcceso = await carritoService.verificarAcceso(user.id, servicioId);
    return NextResponse.json({ 
      tieneAcceso,
      servicioId,
      usuarioId: user.id
    });
  } catch (error) {
    console.error('Error verificando acceso:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}