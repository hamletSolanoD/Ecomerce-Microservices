import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler, BadRequestError } from '@/middleware/errorHandler';
import { withAuth, withAdminAuth } from '@/middleware/authMiddleware';
import ServicioService from '@/services/servicioService';

/**
 * GET /api/servicios/[id]
 * Obtiene un servicio por su ID
 */
export const GET = withErrorHandler(async (_req: NextRequest, context?: { params: Record<string, string> }) => {
  try {
    const id = context?.params?.id;
    
    if (!id || id.trim() === '') {
      throw new BadRequestError('Se requiere un ID válido');
    }
    
    const servicio = await ServicioService.getServicioById(id);
    
    return NextResponse.json(servicio);
  } catch (error: any) {
    console.error(`Error al obtener servicio: ${error.message}`, error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener servicio' },
      { status: error.statusCode || 500 }
    );
  }
});

/**
 * PUT /api/servicios/[id]
 * Actualiza un servicio existente (requiere autenticación de administrador)
 */
export const PUT = withErrorHandler(withAdminAuth(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  try {
    const id = context?.params?.id;
    
    if (!id || id.trim() === '') {
      throw new BadRequestError('Se requiere un ID válido');
    }
    
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
    
    const servicioActualizado = await ServicioService.actualizarServicio(id, data);
    
    return NextResponse.json(servicioActualizado);
  } catch (error: any) {
    console.error(`Error al actualizar servicio: ${error.message}`, error);
    return NextResponse.json(
      { 
        error: error.message || 'Error al actualizar servicio',
        details: error.errors || undefined
      },
      { status: error.statusCode || 500 }
    );
  }
}));

/**
 * DELETE /api/servicios/[id]
 * Elimina un servicio (requiere autenticación de administrador)
 */
export const DELETE = withErrorHandler(withAdminAuth(async (req: NextRequest, context?: { params: Record<string, string> }) => {
  try {
    const id = context?.params?.id;
    
    if (!id || id.trim() === '') {
      throw new BadRequestError('Se requiere un ID válido');
    }
    
    const url = new URL(req.url);
    const hard = url.searchParams.get('hard') === 'true';
    
    const resultado = await ServicioService.eliminarServicio(id, hard);
    
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error(`Error al eliminar servicio: ${error.message}`, error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar servicio' },
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};