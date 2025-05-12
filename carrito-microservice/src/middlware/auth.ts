import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-desarrollo';

// Verificar y decodificar JWT
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}

// Extraer y verificar token de headers (Para App Router)
export function authenticateRequest(request: NextRequest): { 
  isAuthenticated: boolean; 
  user?: JWTPayload; 
  error?: string 
} {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isAuthenticated: false,
      error: 'Token no proporcionado'
    };
  }
  
  const token = authHeader.substring(7); // Remover "Bearer "
  const user = verifyToken(token);
  
  if (!user) {
    return {
      isAuthenticated: false,
      error: 'Token inválido'
    };
  }
  
  return {
    isAuthenticated: true,
    user
  };
}

// Verificar que el usuario autenticado coincide con el solicitado
export function verifyUserOwnership(authenticatedUserId: string, requestedUserId: string): boolean {
  return authenticatedUserId === requestedUserId;
}

// Extraer token de headers para pasarlo a servicios
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// Helper para verificar autenticación en App Router routes
export function getAuthenticatedUser(request: NextRequest): { user: JWTPayload; token: string } | { error: string; status: number } {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Token no proporcionado', status: 401 };
  }
  
  const token = authHeader.substring(7);
  const user = verifyToken(token);
  
  if (!user) {
    return { error: 'Token inválido', status: 401 };
  }
  
  return { user, token };
}

// Wrapper para facilitar la autenticación en App Router
export function withAuth(handler: (request: NextRequest, context: any, user: JWTPayload, token: string) => Promise<Response>) {
  return async (request: NextRequest, context: any) => {
    const authResult = getAuthenticatedUser(request);
    
    if ('error' in authResult) {
      return new Response(JSON.stringify({ error: authResult.error }), { 
        status: authResult.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return handler(request, context, authResult.user, authResult.token);
  };
}