import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../utils/db';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Intentar conectar a la base de datos
    await connectDB();
    
    // Verificar el estado de la conexión
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    return NextResponse.json({
      status: 'ok',
      service: 'carrito-microservice',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      port: process.env.PORT || 3003
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      service: 'carrito-microservice',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Connection refused',
      port: process.env.PORT || 3003
    }, { status: 500 });
  }
}