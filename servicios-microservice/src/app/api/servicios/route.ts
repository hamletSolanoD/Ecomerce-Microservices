import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/middleware/errorHandler';
import { withAuth, withAdminAuth } from '@/middleware/authMiddleware';
import ServicioService from '@/services/servicioService';

/**
 * GET /api/servicios
 * Obtiene todos los servicios con filtrado y paginación
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  try {
    // Extraer parámetros de la URL
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || process.env.DEFAULT_PAGE_SIZE || '10';
    const sort = url.searchParams.get('sort') || 'nombre';
    const order = url.searchParams.get('order') || 'asc';
    const activo = url.searchParams.has('activo') ? url.searchParams.get('activo') === 'true' : undefined;
    const categoria = url.searchParams.get('categoria') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const disponibleAhora = url.searchParams.has('disponibleAhora') 
      ? url.searchParams.get('disponibleAhora') === 'true' 
      : undefined;
    
    // Construir opciones con tipos correctos
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
      order,
      activo,
      categoria,
      search,
      disponibleAhora
    };
    
    const result = await ServicioService.getServicios(options);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error al obtener servicios:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener servicios' },
      { status: error.statusCode || 500 }
    );
  }
});

/**
 * POST /api/servicios
 * Crea un nuevo servicio (requiere autenticación de administrador)
 */
export const POST = withErrorHandler(withAdminAuth(async (req: NextRequest) => {
  try {
    // Obtener los datos del body
    const data = await req.json();
    
    // Procesar fechas si vienen como strings
    if (data.fechaDisponibilidadInicio && typeof data.fechaDisponibilidadInicio === 'string') {
      data.fechaDisponibilidadInicio = new Date(data.fechaDisponibilidadInicio);
    }
    
    if (data.fechaDisponibilidadFin && typeof data.fechaDisponibilidadFin === 'string') {
      data.fechaDisponibilidadFin = new Date(data.fechaDisponibilidadFin);
    }
    
    // Convertir valores booleanos si vienen como strings
    if (data.activo !== undefined && typeof data.activo === 'string') {
      data.activo = data.activo === 'true';
    }
    
    // Convertir valores numéricos si vienen como strings
    if (data.stock !== undefined && typeof data.stock === 'string') {
      data.stock = data.stock === '' ? null : parseInt(data.stock, 10);
    }
    
    const nuevoServicio = await ServicioService.crearServicio(data);
    
    return NextResponse.json(nuevoServicio, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear servicio:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error al crear servicio',
        details: error.errors || undefined
      },
      { status: error.statusCode || 500 }
    );
  }
}));

/**
 * Opciones de CORS para la ruta
 */
export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};