import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/middleware/errorHandler';
import { withAuth, withAdminAuth } from '@/middleware/authMiddleware';
import ServicioService from '@/services/servicioService';

/**
 * GET /api/servicios
 * Obtiene todos los servicios con filtrado y paginación
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  // Extraer parámetros de la URL
  const url = new URL(req.url);
  const page = url.searchParams.get('page') || '1';
  const limit = url.searchParams.get('limit') || process.env.DEFAULT_PAGE_SIZE;
  const sort = url.searchParams.get('sort') || 'nombre';
  const order = url.searchParams.get('order') || 'asc';
  const activo = url.searchParams.get('activo');
  const categoria = url.searchParams.get('categoria');
  const search = url.searchParams.get('search');
  const disponibleAhora = url.searchParams.get('disponibleAhora');
  
  const options = {
    page,
    limit,
    sort,
    order,
    activo,
    categoria,
    search,
    disponibleAhora
  };
  
  const result = await ServicioService.getServicios(options);
  
  return NextResponse.json(result);
});

/**
 * POST /api/servicios
 * Crea un nuevo servicio (requiere autenticación de administrador)
 */
export const POST = withErrorHandler(withAdminAuth(async (req: NextRequest) => {
  const data = await req.json();
  
  const nuevoServicio = await ServicioService.crearServicio(data);
  
  return NextResponse.json(nuevoServicio, { status: 201 });
}));