import { verifyToken } from '@/middlware/auth';
import { CarritoService } from '@/services/carritoService';
import { NextRequest, NextResponse } from 'next/server';


const carritoService = new CarritoService();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
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

    const { itemId } = params;

    if (!itemId) {
      return NextResponse.json({ error: 'ID de item inválido' }, { status: 400 });
    }

    // Eliminar item del carrito
    await carritoService.eliminarDelCarrito(itemId, user.id);
    return NextResponse.json({ mensaje: 'Item eliminado del carrito exitosamente' });
  } catch (error: any) {
    console.error('Error eliminando del carrito:', error);
    
    if (error.message.includes('no encontrado')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    } else if (error.message.includes('permiso')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    } else {
      return NextResponse.json({ error: error.message || 'Error eliminando del carrito' }, { status: 400 });
    }
  }
}