# 🌐 EcoLoop Frontend (EcoLoop_Frontend)

Este es el módulo del cliente (interfaz de usuario) para la plataforma **EcoLoop**, construido con **Next.js 15**, **React 19** y **Tailwind CSS v4**.

---

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 15.5.9](https://nextjs.org/) (App Router)
- **Biblioteca UI**: [React 19.2.0](https://react.dev/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) (Nueva arquitectura `@theme` en CSS)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Componentes**: [Radix UI](https://www.radix-ui.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Formularios y Validación**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Lector de Código QR**: [html5-qrcode](https://github.com/mebjas/html5-qrcode)

---

## 🗂️ Estructura del Proyecto

```
EcoLoop_Frontend/
├── app/                            # Carpeta principal de rutas (App Router)
│   ├── globals.css                 # Variables globales y de Tailwind CSS v4
│   ├── layout.tsx                  # Envoltorio principal (HTML, Metadata, Font)
│   ├── page.tsx                    # Landing page / Redireccionamiento inicial
│   ├── admin/                      # Rutas de administración (/admin/news, /admin/products, /admin/stations, /admin/users)
│   ├── auth/                       # Autenticación (/auth/login, /auth/register)
│   ├── user/                       # Rutas de usuario final (/user/news, /user/quiz, /user/store)
│   └── worker/                     # Rutas para el trabajador encargado de la recolección
├── components/                     # Componentes React reutilizables
│   ├── theme-provider.tsx          # Gestión de modo oscuro / claro
│   ├── ui/                         # Componentes atómicos de Shadcn (botones, inputs, dialogs)
│   ├── admin/                      # Componentes interactivos exclusivos del Admin
│   ├── user/                       # Componentes interactivos del Usuario (ej. qr-scanner.tsx, quiz-view.tsx)
│   └── worker/                     # Componentes interactivos del Worker
├── hooks/                          # Custom hooks de React
├── lib/
│   ├── utils.ts                    # Utilidades generales (ej. cn para clases condicionales)
│   └── supabase/                   # ⚠️ Adaptador Local-Supabase
│       ├── client.ts               # Cliente para hooks del lado del cliente
│       ├── server.ts               # Cliente para Server Components (RSC)
│       └── local-client.ts         # Proxy de API Express (Emula la sintaxis Supabase)
├── public/                         # Archivos estáticos (imágenes, logos)
├── package.json                    # Scripts y dependencias
└── tsconfig.json                   # Configuración del compilador TypeScript
```

---

## 🔑 Variables de Entorno

Crea un archivo `.env.local` en la raíz de esta carpeta basándote en `.env.example`:

```env
# URL de la API del Backend (Accesible desde el navegador del usuario)
NEXT_PUBLIC_API_URL=http://localhost:3001

# URL de la API del Backend (Accesible en el lado del servidor interno - Docker)
API_URL=http://backend:3001
```

---

## 🚀 Comandos y Ejecución Local

### 1. Instalar dependencias
Dado que algunas dependencias de UI están siendo actualizadas para React 19, **es obligatorio** usar el flag `--legacy-peer-deps` para evitar conflictos de resolución de paquetes:
```bash
npm install --legacy-peer-deps
```

### 2. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### 3. Compilar para producción
Genera el paquete optimizado de Next.js en la carpeta `.next/`:
```bash
npm run build
```

### 4. Iniciar en modo de producción
Lanza el servidor de Next.js ya optimizado para producción:
```bash
npm start
```

### 5. Análisis estático (Linter)
```bash
npm run lint
```

---

## 💡 Detalles de Implementación para Desarrolladores

### El Adaptador Local-Supabase
Para facilitar la transición o emular una base de datos Serverless, el frontend utiliza una librería puente definida en `lib/supabase/local-client.ts`.
- **Sintaxis Supabase**: Puedes seguir usando métodos como `client.from('waste_stations').select('*')`.
- **Redirección**: El cliente local intercepta la llamada y realiza un `fetch()` convencional al backend Express `/api/local/waste_stations`.
- **Sesión**: La sesión del usuario se guarda en `localStorage` y en una Cookie de navegador llamada `ecoloop_session` con un tiempo de expiración de 7 días. Esto asegura que tanto el cliente como el servidor de Next.js tengan acceso al token JWT para llamadas autenticadas.

### Escaneo de Código QR
El componente `QRScanner` (`components/user/qr-scanner.tsx`) utiliza la cámara del dispositivo mediante la librería `html5-qrcode`.
- **Funcionamiento**: Al escanear con éxito un código QR, el componente envía una petición `POST` al endpoint `/api/transactions/scan` de la API, registrando la recolección y sumando puntos al usuario de forma automática.
- **Acceso**: Asegúrate de levantar el desarrollo local utilizando localhost o HTTPS, de lo contrario el navegador podría denegar el acceso a la cámara por políticas de seguridad.
