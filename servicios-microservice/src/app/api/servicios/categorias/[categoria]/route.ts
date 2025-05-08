import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/middleware/errorHandler';
import ServicioService from '@/services/servicioService';

interface Params {
  params: {
    categoria: string;
  };
}

/**
 * GET /api/categorias/[categoria]
 * Obtiene servicios por categoría
 */
export const GET = withErrorHandler(async (req: NextRequest, { params }: Params) => {
  const { categoria } = params;
  
  // Extraer opciones de paginación
  const url = new URL(req.url);
  const page = url.searchParams.get('page') || '1';
  const limit = url.searchParams.get('limit') || process.env.DEFAULT_PAGE_SIZE;
  const sort = url.searchParams.get('sort') || 'nombre';
  const order = url.searchParams.get('order') || 'asc';
  const activo = url.searchParams.get('activo');
  
  const options = {
    page,
    limit,
    sort,
    order,
    activo
  };
  
  const result = await ServicioService.getServiciosPorCategoria(categoria, options);
  
  return NextResponse.json(result);
});