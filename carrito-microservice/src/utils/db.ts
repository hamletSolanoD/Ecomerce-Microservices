import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/usuario-service';

// Definir un tipo para la variable global mongoose
interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declarar la variable global
declare global {
  var mongooseConnection: GlobalMongoose | undefined;
}

// Inicializar la variable global si no existe
if (!global.mongooseConnection) {
  global.mongooseConnection = {
    conn: null,
    promise: null
  };
}

async function connectDB(): Promise<typeof mongoose> {
  // Si ya existe una conexión, la devolvemos
  if (global.mongooseConnection!.conn) {
    console.log('MongoDB: Usando conexión existente');
    return global.mongooseConnection!.conn;
  }

  // Si ya hay una promesa de conexión en curso, la esperamos
  if (!global.mongooseConnection!.promise) {
    console.log('MongoDB: Creando nueva conexión');
    
    // Opciones de conexión para evitar advertencias
    const opts = {
      bufferCommands: false,
    };

    // Crear una nueva promesa de conexión
    global.mongooseConnection!.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB: Conexión establecida');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB: Error de conexión:', error);
        throw error;
      });
  }

  try {
    // Esperar a que se resuelva la promesa y almacenar la conexión
    global.mongooseConnection!.conn = await global.mongooseConnection!.promise;
  } catch (error) {
    // En caso de error, resetear la promesa
    global.mongooseConnection!.promise = null;
    throw error;
  }

  return global.mongooseConnection!.conn;
}

export default connectDB;