const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Alphavents — API",
      version: "1.0.0",
      description:
        "API REST de Alphavents. Autenticación mediante JWT Bearer token.\n\n" +
        "**Flujo de autenticación:**\n" +
        "1. `POST /auth/register` → se envía un código OTP al email\n" +
        "2. `POST /auth/verify-email` → devuelve el JWT\n" +
        "3. Usar el JWT en el campo **Authorize** (🔒) para las rutas protegidas",
    },
    servers: [
      { url: "http://localhost:3000", description: "Desarrollo local" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT obtenido en /auth/login o /auth/verify-email",
        },
      },
      schemas: {
        // ── Respuestas de error comunes ──────────────────────────────────
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Descripción del error" },
          },
        },

        // ── Modelos de usuario ───────────────────────────────────────────
        UserSummary: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Ana García" },
            email: { type: "string", format: "email", example: "ana@test.com" },
          },
        },
        User: {
          allOf: [
            { $ref: "#/components/schemas/UserSummary" },
            {
              type: "object",
              properties: {
                role: {
                  type: "string",
                  enum: ["USER", "ADMIN"],
                  example: "USER",
                },
                emailVerified: { type: "boolean", example: true },
                createdAt: { type: "string", format: "date-time" },
                _count: {
                  type: "object",
                  properties: {
                    organizedEvents: { type: "integer", example: 3 },
                    enrollments: { type: "integer", example: 5 },
                  },
                },
              },
            },
          ],
        },

        // ── Modelo de evento ─────────────────────────────────────────────
        Event: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Festival de Jazz" },
            description: {
              type: "string",
              nullable: true,
              example: "Una tarde de jazz...",
            },
            date: { type: "string", format: "date-time" },
            location: { type: "string", example: "Parque del Retiro, Madrid" },
            latitude: { type: "number", nullable: true, example: 40.4153 },
            longitude: { type: "number", nullable: true, example: -3.6844 },
            images: {
              type: "array",
              items: { type: "string", format: "uri" },
              example: ["https://res.cloudinary.com/..."],
            },
            category: {
              type: "string",
              enum: [
                "MUSICA",
                "DEPORTE",
                "ARTE",
                "TECNOLOGIA",
                "GASTRONOMIA",
                "EDUCACION",
                "NEGOCIOS",
                "OTRO",
              ],
            },
            maxAttendees: { type: "integer", nullable: true, example: 100 },
            creatorId: { type: "integer", example: 1 },
            creator: { $ref: "#/components/schemas/UserSummary" },
            _count: {
              type: "object",
              properties: {
                enrollments: { type: "integer", example: 42 },
              },
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // ── Paginación ───────────────────────────────────────────────────
        PaginatedEvents: {
          type: "object",
          properties: {
            total: { type: "integer", example: 87 },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            events: {
              type: "array",
              items: { $ref: "#/components/schemas/Event" },
            },
          },
        },

        // ── Inscripción ──────────────────────────────────────────────────
        Enrollment: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            userId: { type: "integer", example: 2 },
            eventId: { type: "integer", example: 5 },
            createdAt: { type: "string", format: "date-time" },
            user: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" },
                email: { type: "string", format: "email" },
              },
            },
          },
        },

        // ── Mensaje ──────────────────────────────────────────────────────
        Message: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            content: { type: "string", example: "¡Nos vemos allí!" },
            userId: { type: "integer", example: 3 },
            eventId: { type: "integer", example: 5 },
            createdAt: { type: "string", format: "date-time" },
            user: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" },
              },
            },
          },
        },

        // ── Valoración ───────────────────────────────────────────────────
        Rating: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            score: { type: "integer", minimum: 1, maximum: 5, example: 4 },
            comment: {
              type: "string",
              nullable: true,
              example: "Muy bien organizado",
            },
            raterId: { type: "integer", example: 2 },
            creatorId: { type: "integer", example: 1 },
            eventId: { type: "integer", example: 5 },
            createdAt: { type: "string", format: "date-time" },
            rater: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    "./src/routes/auth.routes.js",
    "./src/routes/event.routes.js",
    "./src/routes/user.routes.js",
    "./src/routes/upload.routes.js",
    "./src/routes/message.routes.js",
  ],
};

module.exports = swaggerJsdoc(options);
