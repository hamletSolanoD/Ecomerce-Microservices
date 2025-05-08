import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/middleware/errorHandler';
import { withAuth, withAdminAuth } from '@/middleware/authMiddleware';
import ServicioService from '@/services/servicioService';

interface Params {
  params: {
    id: string;
  };
}

/**
 * GET /api/servicios/[id]
 * Obtiene un servicio por su ID
 */
export const GET = withErrorHandler(async (_req: NextRequest, { params }: Params) => {
  const { id } = params;
  
  const servicio = await ServicioService.getServicioById(id);
  
  return NextResponse.json(servicio);
});

/**
 * PUT /api/servicios/[id]
 * Actualiza un servicio existente (requiere autenticación de administrador)
 */
export const PUT = withErrorHandler(withAdminAuth(async (req: NextRequest, { params }: Params) => {
  const { id } = params;
  const data = await req.json();
  
  const servicioActualizado = await ServicioService.actualizarServicio(id, data);
  
  return NextResponse.json(servicioActualizado);
}));

/**
 * DELETE /api/servicios/[id]
 * Elimina un servicio (requiere autenticación de administrador)
 */
export const DELETE = withErrorHandler(withAdminAuth(async (req: NextRequest, { params }: Params) => {
  const { id } = params;
  const url = new URL(req.url);
  const hard = url.searchParams.get('hard') === 'true';
  
  const resultado = await ServicioService.eliminarServicio(id, hard);
  
  return NextResponse.json(resultado);
}));