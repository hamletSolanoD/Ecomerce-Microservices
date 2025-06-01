# 🚀 ServiceHub: Plataforma de E-commerce para Servicios Digitales

![Estado](https://img.shields.io/badge/Estado-Desarrollo-orange)
![Versión](https://img.shields.io/badge/Versión-1.0.0-blue)
![Node](https://img.shields.io/badge/Node.js-16%2B-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-Activo-green)
![NextJS](https://img.shields.io/badge/NextJS-13%2B-blueviolet)
![React](https://img.shields.io/badge/React-18%2B-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-yellow)

## 📝 Descripción

ServiceHub es una plataforma moderna de e-commerce especializada en la venta y gestión de suscripciones a servicios digitales como hosting, servidores, bases de datos y otros servicios tecnológicos. Implementada como una arquitectura de microservicios, permite a los usuarios explorar un catálogo de productos, gestionar sus compras y administrar sus suscripciones.

La plataforma se compone de tres microservicios backend independientes y un frontend React, todos comunicándose entre sí a través de APIs RESTful. Cada microservicio cuenta con su propia base de datos MongoDB, asegurando la desacoplación y escalabilidad del sistema.

[![Demo Video](https://img.youtube.com/vi/1qwiOr-VGPA/0.jpg)](https://www.youtube.com/watch?v=1qwiOr-VGPA)

## 🏗️ Arquitectura

ServiceHub implementa una arquitectura de microservicios moderna con:

- **Independencia operativa:** Cada microservicio puede desarrollarse, desplegarse y escalarse de forma independiente
- **Base de datos por servicio:** Cada microservicio mantiene su propia base de datos MongoDB
- **Comunicación vía API:** Los servicios se comunican entre sí mediante APIs RESTful
- **Frontend desacoplado:** Interfaz React que integra todas las funcionalidades a través de las APIs

![image](https://github.com/user-attachments/assets/86464759-d72b-4504-b1b6-00766c914a15)

> **Nota:** diagrama visual de arquitectura microservicios.

## 🧩 Microservicios

### 1️⃣ Microservicio de Usuarios (Puerto 3001)

Gestiona la autenticación y los perfiles de usuario del sistema.

#### Características Técnicas
- Autenticación JWT con expiración de 24h
- Middleware para protección de rutas
- Roles de usuario (ADMIN, COMPRADOR)
- Hashing de contraseñas con bcrypt
- Patrón repositorio para abstraer operaciones de BD

#### Endpoints Principales
- `POST /api/auth/register`: Registro de nuevos usuarios
- `POST /api/auth/login`: Inicio de sesión
- `GET /api/usuarios`: Listar usuarios (solo admin)
- `GET /api/usuarios/:id`: Obtener usuario específico

### 2️⃣ Microservicio de Servicios (Puerto 3002)

Administra el catálogo de servicios disponibles con capacidades avanzadas de búsqueda y filtrado.
#### Características Técnicas
- Validación de datos con Yup
- Manejo preciso de valores monetarios con Decimal.js
- Sistema de filtrado y búsqueda avanzada
- Paginación y ordenamiento personalizable
- Control de disponibilidad temporal de servicios

#### Endpoints Principales
- `GET /api/servicios`: Listar con múltiples opciones de filtrado
- `POST /api/servicios`: Crear nuevo servicio (admin)
- `GET /api/servicios/:id`: Obtener servicio específico
- `GET /api/categorias`: Listar categorías únicas

### 3️⃣ Microservicio de Carrito (Puerto 3003)

Gestiona el carrito de compras y las suscripciones de los usuarios.
#### Características Técnicas
- Sistema de suscripciones con fechas de expiración automáticas
- Tipos de planes: Mensual, Trimestral, Anual
- Estados de carrito: EN_PROCESO, COMPRADO, EXPIRADO
- Verificación de acceso a servicios adquiridos
- Comunicación con otros microservicios para datos enriquecidos
#### Endpoints Principales
- `GET /api/carrito`: Obtener carrito del usuario
- `POST /api/carrito`: Agregar item al carrito
- `POST /api/carrito/procesar-compra`: Procesar compra
- `GET /api/suscripciones`: Obtener suscripciones del usuario

### 4️⃣ Frontend React
Interfaz de usuario que integra todas las funcionalidades de los microservicios.
#### Características Técnicas
- Sistema de autenticación con persistencia en localStorage
- Servicios para comunicación con microservicios
- Interfaces adaptativas con Tailwind CSS
- Control de acceso basado en roles
- Gestión de estado con Context API
- Interceptores para tokens JWT
## 🛠️ Tecnologías
### Backend
- **Node.js** (v16+): Entorno de ejecución para JavaScript
- **NextJS** (v13+): Framework para APIs y SSR
- **MongoDB**: Base de datos NoSQL para cada microservicio
- **JWT**: Autenticación basada en tokens
- **Bcrypt**: Hashing seguro para contraseñas
- **Yup**: Validación de esquemas
- **Decimal.js**: Manejo preciso de valores monetarios
- **Axios**: Cliente HTTP para comunicación entre servicios

### Frontend
- **React** (v18+): Biblioteca para interfaces de usuario
- **Context API**: Gestión de estado global
- **React Router**: Navegación entre vistas
- **Tailwind CSS**: Framework de utilidades CSS
- **Axios**: Cliente HTTP para comunicación con APIs

## 📦 Instalación
### Requisitos Previos
- Node.js 16+
- MongoDB (instalado localmente o instancia remota)
- npm o yarn
### Instalar Dependencias

Cada microservicio y el frontend necesitan tener sus dependencias instaladas por separado:

```bash
# Microservicio de Usuarios
cd usuario-microservice
npm install

# Microservicio de Servicios
cd servicios-microservice
npm install

# Microservicio de Carrito
cd carrito-microservice
npm install

# Frontend
cd microservices-frontend
npm install
```

## ⚙️ Configuración

### Variables de Entorno

Cada microservicio requiere su propio archivo `.env`. A continuación se muestran ejemplos para cada uno:

#### Microservicio de Usuarios (.env)
```
# Puerto del servidor
PORT=3001
# Conexión a MongoDB
MONGODB_URI=
# Secret para JWT
JWT_SECRET=
# Entorno
NODE_ENV=
```

#### Microservicio de Servicios (.env)
```
# Configuración MongoDB
MONGODB_URI=
# Puerto del servidor
PORT=3002
# URL del microservicio de usuarios (para verificación de tokens)
USERS_MICROSERVICE_URL=
# Configuración de paginación por defecto
DEFAULT_PAGE_SIZE=
# Secret para JWT
JWT_SECRET=
# Entorno
NODE_ENV=
```

#### Microservicio de Carrito (.env)
```
# Puerto del servidor
PORT=3003
# Conexión a MongoDB
MONGODB_URI=
# Secret para JWT (debe coincidir con el de usuarios)
JWT_SECRET=
# URLs de otros microservicios
USERS_MICROSERVICE_URL=
SERVICES_MICROSERVICE_URL=
# Entorno
NODE_ENV=
```

## 🔌 APIs

### Autenticación

Todas las rutas protegidas requieren un token JWT en el header de Authorization:

```
Authorization: Bearer <token>
```

### Ejemplos de Peticiones API

#### Registro de Usuario
```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "nombre": "Usuario Ejemplo",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

#### Login
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

#### Obtener Servicios con Filtros
```
GET http://localhost:3002/api/servicios?categoria=hosting&page=1&limit=10&activo=true
Authorization: Bearer <token>
```

#### Agregar al Carrito
```
POST http://localhost:3003/api/carrito
Content-Type: application/json
Authorization: Bearer <token>

{
  "servicioId": "id_del_servicio",
  "tipoPlan": "MENSUAL"
}
```

## 🚀 Desarrollo

### Iniciar los Servicios

Cada microservicio debe iniciarse en una terminal separada:

```bash
cd usuario-microservice
npm start

# Microservicio de Servicios
cd servicios-microservice
npm start

# Microservicio de Carrito
cd carrito-microservice
npm start

# Frontend
cd microservices-frontend
npm start

```
### Puertos por Defecto
- Microservicio de Usuarios: http://localhost:3001
- Microservicio de Servicios: http://localhost:3002
- Microservicio de Carrito: http://localhost:3003
- Frontend: http://localhost:3000

## 🔄 Flujos Principales

### 1. Registro/Login
1. Usuario crea una cuenta o inicia sesión
2. Sistema genera un token JWT
3. Token se almacena en localStorage para persistencia
### 2. Exploración de Servicios
1. Usuario navega por el catálogo de servicios
2. Puede filtrar por categoría, buscar y paginar resultados
3. Visualiza detalles de cada servicio
### 3. Compra de Servicios
1. Usuario selecciona un servicio y el plan (Mensual/Trimestral/Anual)
2. Servicio se agrega al carrito con estado EN_PROCESO
3. Usuario procesa la compra
4. Items pasan a estado COMPRADO con fecha de expiración calculada
### 4. Gestión de Suscripciones
1. Usuario visualiza sus suscripciones activas
2. Sistema muestra tiempo restante hasta expiración
3. Al llegar la fecha de expiración, las suscripciones pasan a EXPIRADO
### 5. Administración (Solo ADMIN)
1. Administradores pueden crear/editar/eliminar servicios
2. Acceso a listado completo de usuarios
3. Gestión del catálogo de productos

## 📂 Estructura de Carpetas

### Microservicio de Usuarios
```
microservicio-usuarios/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── usuarios/
│   └── ...
├── models/
│   └── Usuario.js
├── repositories/
│   └── UsuarioRepository.js
├── services/
│   └── UsuarioService.js
├── middleware/
│   ├── auth.js
│   └── error.js
├── utils/
│   └── jwt.js
└── ...
```
### Microservicio de Servicios
```
microservicio-servicios/
├── app/
│   ├── api/
│   │   ├── servicios/
│   │   ├── categorias/
│   │   └── busqueda/
│   └── ...
├── models/
│   └── Servicio.js
├── repositories/
│   └── ServicioRepository.js
├── services/
│   └── ServicioService.js
├── middleware/
│   ├── auth.js
│   └── error.js
└── ...
```
### Microservicio de Carrito
```
microservicio-carrito/
├── app/
│   ├── api/
│   │   ├── carrito/
│   │   ├── suscripciones/
│   │   └── acceso/
│   └── ...
├── models/
│   └── CarritoCompra.js
├── repositories/
│   └── CarritoRepository.js
├── services/
│   └── CarritoService.js
├── middleware/
│   ├── auth.js
│   └── error.js
└── ...
```
### Frontend
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── services/
│   │   ├── cart/
│   │   └── layout/
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── CartContext.js
│   │   └── ...
│   ├── services/
│   │   ├── authService.js
│   │   ├── servicesService.js
│   │   └── cartService.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Login.js
│   │   └── ...
│   ├── App.js
│   └── index.js
└── ...
```
