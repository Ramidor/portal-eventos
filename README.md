# Alphavents

Portal web para la gestión y descubrimiento de eventos sociales. Permite crear eventos, inscribirse, valorar a los organizadores y comunicarse en tiempo real a través de un muro de mensajes por evento. Incluye una API REST, una aplicación web (SPA) y una app móvil complementaria.

> Trabajo de Fin de Grado — Desarrollo de un Portal Web para la Gestión de Eventos.

🔗 **Demo en producción:** [https://alphavents.online](https://alphavents.online) *(actualizar con la URL real de Vercel/dominio)*
📘 **Documentación de la API:** `/api-docs` (Swagger UI) sobre la URL del backend

---

## Tabla de contenidos

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Puesta en marcha en local](#puesta-en-marcha-en-local)
  - [Requisitos previos](#requisitos-previos)
  - [Backend](#backend)
  - [Frontend web](#frontend-web)
  - [App móvil](#app-móvil)
- [Variables de entorno](#variables-de-entorno)
- [Despliegue](#despliegue)
- [Modelo de datos](#modelo-de-datos)
- [Licencia](#licencia)

---

## Características

- 🔐 **Autenticación segura**: registro con verificación por correo mediante código OTP, JWT con expiración, recuperación de contraseña.
- 📅 **Gestión de eventos**: creación, edición y eliminación de eventos con ubicación en mapa interactivo (Leaflet), imágenes y categorías.
- 🔎 **Descubrimiento**: búsqueda, filtrado por categoría y ordenación por proximidad geográfica.
- ✅ **Inscripciones**: cupo máximo de asistentes, confirmación y recordatorio automático por email el día anterior al evento.
- 💬 **Muro en tiempo real**: chat por evento mediante WebSocket (Socket.io), visible solo para inscritos.
- ⭐ **Valoraciones**: los asistentes pueden valorar al organizador tras la finalización del evento.
- 🛠️ **Panel de administración**: gestión de usuarios y eventos para roles `ADMIN`.
- 📱 **App móvil**: cliente en React Native (Expo) con las funcionalidades principales.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend web | React 19 + Vite, React Router, Tailwind CSS, Leaflet, Socket.io-client |
| Backend | Node.js + Express 5, Prisma ORM, Socket.io, JWT, bcrypt |
| Base de datos | PostgreSQL |
| App móvil | React Native + Expo Router |
| Imágenes | Cloudinary (CDN) |
| Email | Resend (API HTTP), dominio propio verificado |
| Despliegue | Vercel (frontend) · Railway (backend + PostgreSQL) |
| Documentación API | Swagger / OpenAPI |

## Arquitectura

```
┌─────────────┐        ┌──────────────┐        ┌──────────────┐
│  Cliente web │        │              │        │  PostgreSQL  │
│ (React/Vite) │──────▶│   Backend     │──────▶│   (Railway)   │
└─────────────┘  REST   │ (Express +   │  Prisma└──────────────┘
                  WS    │  Socket.io)  │
┌─────────────┐        │              │        ┌──────────────┐
│  App móvil   │──────▶│              │──────▶│  Cloudinary   │
│ (React Native│        └──────┬───────┘        │  (imágenes)  │
│   + Expo)    │               │                └──────────────┘
└─────────────┘               ▼
                        ┌──────────────┐
                        │    Resend    │
                        │   (emails)   │
                        └──────────────┘
```

El frontend y la app móvil consumen la API REST del backend; el muro de mensajes usa una conexión WebSocket independiente gestionada por el mismo servidor. Los servicios externos (Cloudinary, Resend) solo se invocan desde el backend, nunca directamente desde el cliente.

## Estructura del repositorio

```
portal-eventos/
├── backend/              # API REST + WebSocket (Node.js/Express)
│   ├── prisma/           # Esquema y migraciones de base de datos
│   └── src/
│       ├── config/       # Configuración (Swagger, etc.)
│       ├── controllers/  # Lógica de negocio de cada recurso
│       ├── jobs/         # Tareas programadas (recordatorios, limpieza)
│       ├── middlewares/  # Auth, rate limiting, validación
│       ├── routes/       # Definición de endpoints
│       ├── services/     # Integraciones externas (email, etc.)
│       ├── sockets/      # Lógica del muro en tiempo real
│       └── utils/
├── client/               # Aplicación web (React + Vite)
├── mobile/               # App móvil (React Native + Expo)
└── docs/                 # Documentación del proyecto (memoria, requisitos, casos de uso)
```

## Puesta en marcha en local

### Requisitos previos

- Node.js ≥ 18 y npm ≥ 9
- PostgreSQL ≥ 14 (local o remoto)
- Cuenta gratuita en [Cloudinary](https://cloudinary.com)
- Cuenta gratuita en [Resend](https://resend.com)
- Para la app móvil: [Expo Go](https://expo.dev/go) instalado en el dispositivo, o un emulador Android/iOS

### Backend

```bash
cd backend
npm install
cp .env.example .env      # completar con tus credenciales
npx prisma db push        # aplica el esquema a la base de datos
npm run seed               # (opcional) carga datos de prueba
npm run dev                 # arranca en http://localhost:3000
```

La documentación interactiva de la API queda disponible en `http://localhost:3000/api-docs`.

### Frontend web

```bash
cd client
npm install
cp .env.example .env.local
npm run dev                 # arranca en http://localhost:5173
```

### App móvil

```bash
cd mobile
npm install
npx expo start
```

Escanea el código QR con Expo Go, o pulsa `a` / `i` para abrir un emulador Android / simulador iOS.

## Variables de entorno

### `backend/.env`

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `JWT_SECRET` | Clave secreta para firmar los tokens JWT |
| `CLIENT_URL` | URL del frontend (usada en CORS y enlaces de email) |
| `RESEND_API_KEY` | Clave de API de Resend |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Credenciales de Cloudinary |

### `client/.env.local`

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del backend |

### `mobile/.env`

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL base del backend |

Cada paquete incluye un `.env.example` con valores de referencia.

## Despliegue

- **Backend**: Railway (servicio Node.js + plugin de PostgreSQL). El comando de arranque es `npm start`; las migraciones se aplican manualmente con `npx prisma db push` desde la consola de Railway.
- **Frontend**: Vercel, importando el directorio `client/` como raíz del proyecto. Detecta automáticamente la build de Vite.
- **Email**: Resend con dominio propio verificado (DKIM, SPF y DMARC configurados vía DNS), necesario para poder enviar correos a cualquier destinatario y no solo al titular de la cuenta.
- **App móvil**: compilación con [EAS Build](https://docs.expo.dev/build/introduction/) (`eas build --profile preview --platform android`).

## Modelo de datos

Entidades principales (`backend/prisma/schema.prisma`):

- **User** — cuentas con rol `USER` o `ADMIN`, verificación por email y recuperación de contraseña.
- **Event** — eventos con ubicación geográfica, categoría, aforo e imágenes.
- **Enrollment** — relación muchos a muchos entre usuarios y eventos a los que se inscriben.
- **Message** — mensajes del muro en tiempo real de cada evento.
- **Rating** — valoraciones (1-5) de los asistentes hacia el organizador, una por evento y usuario.

## Licencia

Proyecto desarrollado como Trabajo de Fin de Grado con fines educativos. *(Definir licencia — por ejemplo MIT — si el código va a reutilizarse o distribuirse públicamente.)*
