import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler, BadRequestError } from '@/middleware/errorHandler';
import ServicioService from '@/services/servicioService';

/**
 * GET /api/categorias/[categoria]
 * Obtiene servicios por categoría
 */
export const GET = withErrorHandler(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  try {
    console.log(context?.params?.categoria)
    const categoria = context?.params?.categoria;
    
    if (!categoria || categoria.trim() === '') {
      throw new BadRequestError('Se requiere una categoría válida');
    }
    
    // Decodificar la categoría si viene codificada en la URL
    const categoriaDecodificada = decodeURIComponent(categoria);
    
    // Extraer opciones de paginación
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || process.env.DEFAULT_PAGE_SIZE || '10';
    const sort = url.searchParams.get('sort') || 'nombre';
    const order = url.searchParams.get('order') || 'asc';
    const activo = url.searchParams.has('activo') 
      ? url.searchParams.get('activo') === 'true' 
      : undefined;
    
    // Construir opciones con tipos correctos
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
      order,
      activo
    };
    
    const result = await ServicioService.getServiciosPorCategoria(categoriaDecodificada, options);
    console.log(result)
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error al obtener servicios por categoría: ${error.message}`, error);
    return NextResponse.json(
      { 
        error: error.message || 'Error al obtener servicios por categoría',
        details: error.errors || undefined
      },
      { status: error.statusCode || 500 }
    );
  }
});

/**
 * Opciones de CORS para la ruta
 */
export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};