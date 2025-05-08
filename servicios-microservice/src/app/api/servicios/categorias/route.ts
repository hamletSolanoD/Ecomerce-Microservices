import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/middleware/errorHandler';
import ServicioService from '@/services/servicioService';

/**
 * GET /api/categorias
 * Obtiene todas las categorías únicas
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const categorias = await ServicioService.getCategorias();
  
  return NextResponse.json({
    categorias
  });
});