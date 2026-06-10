# ⚙️ EcoLoop Backend (EcoLoop_Backend)

Servidor de API REST desarrollado con **Node.js**, **Express**, **TypeScript** y **Prisma ORM** para la gestión y persistencia de datos de la plataforma **EcoLoop**.

---

## 🛠️ Stack Tecnológico

- **Entorno de ejecución**: [Node.js](https://nodejs.org/) (Soporta v20.x+)
- **Framework Web**: [Express](https://expressjs.com/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/) (v5.10.1+)
- **Base de Datos**: [PostgreSQL 16](https://www.postgresql.org/)
- **Seguridad**: [bcrypt](https://github.com/kelektiv/node.bcrypt.js) (Hashing de contraseñas) + [jsonwebtoken (JWT)](https://github.com/auth0/node-jsonwebtoken) (Firma y verificación de sesiones)
- **Documentación**: [Swagger UI Express](https://github.com/scottie198x/swagger-ui-express) + [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) (Generación automática de OpenAPI 3.0)

---

## 🗂️ Estructura del Proyecto

```
EcoLoop_Backend/
├── prisma/
│   ├── schema.prisma               # Esquema de base de datos relacionales y enums
│   └── migrations/                 # Historial de cambios y scripts SQL aplicados
├── src/
│   ├── index.ts                    # Entrypoint del servidor, configuración de CORS y Swagger
│   ├── infrastructure/             # Lógica de soporte y acceso a datos
│   │   ├── prismaClient.ts         # Instancia única exportada de PrismaClient
│   │   ├── auth/                   # Funciones hash, emisión de tokens y middlewares JWT
│   │   └── repositories/           # Patrón repositorio para desacoplar consultas Prisma
│   │       ├── profilesRepository.ts
│   │       ├── transactionsRepository.ts
│   │       └── ...
│   └── routes/                     # Controladores y rutas de la API REST
│       ├── auth.ts                 # Rutas de login, registro y perfil actual (/auth/me)
│       ├── health.ts               # Endpoint de estado del servidor y base de datos
│       ├── local.ts                # ⚠️ Enrutador CRUD genérico (Puente del Frontend)
│       ├── news.ts                 # Rutas para el blog educativo
│       ├── products.ts             # Rutas para los productos de la tienda de recompensas
│       ├── profiles.ts             # Gestión de perfiles y eco_points
│       ├── stations.ts             # Gestión de estaciones y contenedores (waste_bins)
│       └── transactions.ts         # Registro del reciclaje mediante QR (flujo principal)
├── Dockerfile                      # Archivo de construcción para contenedores
├── package.json                    # Scripts del proyecto y dependencias npm
├── init.sql                        # Script SQL inicial con datos semilla (usuarios de prueba, etc.)
└── tsconfig.json                   # Configuración del compilador TypeScript
```

---

## 🔑 Variables de Entorno

Crea un archivo `.env` en la raíz de esta carpeta basándote en `.env.example`:

```env
PORT=3001
NODE_ENV=development

# URL de conexión a la base de datos PostgreSQL
DATABASE_URL=postgresql://ecoloop_user:ecoloop_pass@localhost:5432/ecoloop

# Clave secreta para firmar y validar tokens JWT
JWT_SECRET=super-secret-key-change-in-production

# URL del Frontend permitida en CORS
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Comandos y Ejecución Local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Sincronizar base de datos y Prisma Client
Si estás ejecutando el backend por primera vez o modificaste `schema.prisma`, debes aplicar las migraciones a PostgreSQL y generar el cliente tipado:
```bash
# Genera el código TypeScript para el cliente autocompletado
npx prisma generate

# Ejecuta y aplica las migraciones pendientes en la base de datos
npx prisma migrate dev --name init
```

### 3. Iniciar el servidor en modo desarrollo (Hot Reload)
```bash
npm run dev
```
La consola indicará que el backend está corriendo en `http://localhost:3001`.

### 4. Abrir la interfaz GUI de Prisma (Opcional)
Prisma Studio permite explorar y manipular las tablas en una interfaz web amigable:
```bash
npx prisma studio
```
Se abrirá automáticamente en `http://localhost:5555`.

### 5. Compilar para producción
Compila todo el código TypeScript a archivos JavaScript puros dentro de la carpeta `dist/`:
```bash
npm run build
```

### 6. Iniciar en modo producción
Lanza el código compilado de la API:
```bash
npm start
```

---

## 📄 Documentación Swagger (OpenAPI 3.0)

Una de las ventajas del backend es su documentación interactiva mediante Swagger.
Cuando el servidor esté corriendo en desarrollo, puedes acceder a la interfaz Swagger en:

👉 **`http://localhost:3001/api-docs`**

Allí podrás ver y probar todos los endpoints documentados con sus especificaciones de parámetros, payloads esperados, cabeceras de autorización y códigos de respuesta.

---

## 💡 Detalles de Implementación para Desarrolladores

### Flujo de Asignación de Puntos (`/api/transactions/scan`)
Cuando se envía un código QR de contenedor y un ID de usuario a este endpoint:
1. Valida si el contenedor existe mediante el repositorio de transacciones.
2. Mapea el tipo de residuo al puntaje correspondiente (10 para `recyclable`, 8 para `organic`, 5 para `non_recyclable`).
3. Crea la transacción histórica en la base de datos.
4. Recupera los puntos actuales del usuario y suma los nuevos puntos ganados en su perfil (`profiles`).
5. Devuelve la información formateada y el mensaje de éxito para que el frontend lo despliegue en un toast o modal.

### Rutas Locales (`/api/local/:table`)
Este enrutador (`src/routes/local.ts`) atiende de manera dinámica solicitudes similares a un ORM expuesto en HTTP para que el frontend (con su adaptador compatible con Supabase) pueda realizar consultas directas y operaciones CRUD rápidas en base de datos sin necesidad de crear endpoints específicos para cada tarea simple. Mapea las cláusulas `eq_`, `limit`, `order` y realiza joins mediante la directiva `include` de Prisma.
