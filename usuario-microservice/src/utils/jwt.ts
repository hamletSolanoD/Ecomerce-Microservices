import jwt from 'jsonwebtoken';
import { IUsuario } from '../models/Usuario';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-desarrollo';

// Interfaz para el payload del token
export interface TokenPayload {
  id: string;
  nombre: string;
  email: string;
  tipo: string;
}

// Generar token JWT
export function generarToken(usuario: IUsuario): string {
  const payload: TokenPayload = {
    id: usuario.id?.toString(),
    nombre: usuario.nombre,
    email: usuario.email,
    tipo: usuario.tipo
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// Verificar y decodificar token
export function verificarToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Token inválido');
  }
}