import { NextRequest, NextResponse } from 'next/server';
import ServicioService from '@/services/servicioService';
import { withErrorHandler, BadRequestError } from '@/middleware/errorHandler';

/**
 * GET /api/busqueda
 * Busca servicios por texto
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  
  if (!query) {
    throw new BadRequestError('Se requiere un término de búsqueda (parámetro q)');
  }
  
  // Extraer opciones de paginación
  const page = url.searchParams.get('page') || '1';
  const limit = url.searchParams.get('limit') || process.env.DEFAULT_PAGE_SIZE;
  const sort = url.searchParams.get('sort') || 'nombre';
  const order = url.searchParams.get('order') || 'asc';
  
  const options = {
    page,
    limit,
    sort,
    order
  };
  
  const result = await ServicioService.buscarServicios(query, options);
  
  return NextResponse.json(result);
});