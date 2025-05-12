import { NextRequest, NextResponse } from 'next/server';

import { TipoPlan } from '../../../types';
import { CarritoService } from '@/services/carritoService';
import { verifyToken } from '@/middlware/auth';

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

    // Obtener carrito del usuario
    const carrito = await carritoService.obtenerCarrito(user.id, token);
    return NextResponse.json(carrito);
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

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

    // Obtener datos del body
    const body = await request.json();
    const { servicioId, tipoPlan } = body;
    
    // Validaciones
    if (!servicioId || !tipoPlan) {
      return NextResponse.json({ error: 'servicioId y tipoPlan son requeridos' }, { status: 400 });
    }
    
    if (!Object.values(TipoPlan).includes(tipoPlan)) {
      return NextResponse.json({ error: 'Tipo de plan no válido' }, { status: 400 });
    }
    
    // Agregar al carrito
    const nuevoItem = await carritoService.agregarAlCarrito({
      usuarioId: user.id,
      servicioId,
      tipoPlan
    }, token);
    
    return NextResponse.json({
      mensaje: 'Servicio agregado al carrito exitosamente',
      item: nuevoItem
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error agregando al carrito:', error);
    return NextResponse.json({ error: error.message || 'Error agregando al carrito' }, { status: 400 });
  }
}