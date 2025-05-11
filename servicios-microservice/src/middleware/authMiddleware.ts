import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Interfaces para representar la información del usuario y resultados de verificación
export interface UserInfo {
  id: string;
  nombre: string;
  email: string;
  tipo: string;
}

interface AuthResult {
  error: boolean;
  status?: number;
  message?: string;
  id?: string;
  nombre?: string;
  email?: string;
  tipo?: string;
}

// Extender NextRequest para incluir el objeto user
declare module 'next/server' {
  interface NextRequest {
    user?: UserInfo;
  }
}

// Tipo para el handler de rutas
type RouteHandler = (
  req: NextRequest, 
  params?: { params: Record<string, string> }
) => Promise<NextResponse> | NextResponse;

/**
 * Middleware para verificar tokens JWT
 * @param request - La solicitud HTTP
 * @returns Respuesta con detalles del usuario o error
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authorization = request.headers.get('Authorization');
    
    if (!authorization) {
      return {
        error: true,
        status: 401,
        message: 'No se proporcionó token de autenticación'
      };
    }

    // Extraer token de header "Bearer <token>"
    const token = authorization.split(' ')[1];
    if (!token) {
      return {
        error: true,
        status: 401,
        message: 'Formato de token inválido'
      };
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, JWT_SECRET as string) as jwt.JwtPayload;
      console.log("Decoded", decoded);
      
      return {
        error: false,
        id: decoded.id as string,
        nombre: decoded.nombre as string,
        email: decoded.email as string,
        tipo: decoded.tipo as string || 'COMPRADOR'
      };
    } catch (error) {
      console.error('Error verificando JWT:', error);
      return {
        error: true,
        status: 401,
        message: 'Token de autenticación inválido o expirado'
      };
    }
  } catch (error) {
    console.error('Error inesperado en autenticación:', error);
    return {
      error: true,
      status: 500,
      message: 'Error interno del servidor al autenticar'
    };
  }
}

/**
 * Middleware para proteger rutas con autenticación
 * @param handler - El manejador de la ruta
 * @returns El manejador con verificación de autenticación
 */
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (request, params) => {
    const authResult = await verifyAuth(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.status }
      );
    }
    
    // Crear una copia de la solicitud con la información del usuario
    const requestWithUser = new NextRequest(request, {
      headers: request.headers
    });
    
    // Añadir la información del usuario a la solicitud
    Object.defineProperty(requestWithUser, 'user', {
      value: {
        id: authResult.id,
        nombre: authResult.nombre,
        email: authResult.email,
        tipo: authResult.tipo
      },
      writable: false
    });
    
    // Continuar con el manejador original
    return handler(requestWithUser, params);
  };
}

/**
 * Middleware que verifica si el usuario es administrador
 * @param handler - El manejador de la ruta
 * @returns El manejador con verificación de rol admin
 */
export function withAdminAuth(handler: RouteHandler): RouteHandler {
  return async (request, params) => {
    const authResult = await verifyAuth(request);
    console.log("Auth result:", authResult);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.status }
      );
    }
    
    if (authResult.tipo !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren privilegios de administrador' },
        { status: 403 }
      );
    }
    
    // Crear una copia de la solicitud con la información del usuario
    const requestWithUser = new NextRequest(request, {
      headers: request.headers
    });
    
    // Añadir la información del usuario a la solicitud
    Object.defineProperty(requestWithUser, 'user', {
      value: {
        id: authResult.id,
        nombre: authResult.nombre,
        email: authResult.email,
        tipo: authResult.tipo
      },
      writable: false
    });
    
    return handler(requestWithUser, params);
  };
}