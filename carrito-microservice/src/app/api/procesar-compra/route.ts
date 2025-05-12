import { verifyToken } from '@/middlware/auth';
import { CarritoService } from '@/services/carritoService';
import { NextRequest, NextResponse } from 'next/server';

const carritoService = new CarritoService();

export async function POST(request: NextRequest) {
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

    // Procesar compra
    const resultado = await carritoService.procesarCompra(user.id, token);
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('Error procesando compra:', error);
    
    if (error.message.includes('No hay items')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json({ error: 'Error procesando la compra' }, { status: 500 });
    }
  }
}