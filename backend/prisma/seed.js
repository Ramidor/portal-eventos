const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// Contraseña común para todos los usuarios de prueba: Test1234!
const PASSWORD = "Test1234!";

async function main() {
  console.log("🌱 Iniciando seed...");

  // ── Limpiar en orden correcto (FK) ────────────────────────────────────────
  await prisma.message.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
  console.log("🗑️  Base de datos limpiada");

  // ── Usuarios ──────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash(PASSWORD, 10);

  const [admin, ana, carlos, lucia, mario, sofia] = await Promise.all([
    prisma.user.create({ data: {
      name: "Admin",
      email: "admin@test.com",
      password: hash,
      role: "ADMIN",
      emailVerified: true,
    }}),
    prisma.user.create({ data: {
      name: "Ana García",
      email: "ana@test.com",
      password: hash,
      emailVerified: true,
    }}),
    prisma.user.create({ data: {
      name: "Carlos Rodríguez",
      email: "carlos@test.com",
      password: hash,
      emailVerified: true,
    }}),
    prisma.user.create({ data: {
      name: "Lucía Martínez",
      email: "lucia@test.com",
      password: hash,
      emailVerified: true,
    }}),
    prisma.user.create({ data: {
      name: "Mario López",
      email: "mario@test.com",
      password: hash,
      emailVerified: true,
    }}),
    prisma.user.create({ data: {
      name: "Sofía Fernández",
      email: "sofia@test.com",
      password: hash,
      emailVerified: true,
    }}),
  ]);
  console.log("👥 Usuarios creados: 6");

  // ── Eventos ───────────────────────────────────────────────────────────────
  const now = new Date();
  const d = (days, hours = 19) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + days);
    dt.setHours(hours, 0, 0, 0);
    return dt;
  };

  const [e1, e2, e3, e4, e5, e6, e7, e8] = await Promise.all([
    prisma.event.create({ data: {
      title: "Festival de Jazz en el Retiro",
      description: "Una tarde mágica con los mejores grupos de jazz de Madrid. Ambiente íntimo al aire libre junto al lago.",
      date: d(3, 18),
      location: "Parque del Retiro, Madrid",
      latitude: 40.4153,
      longitude: -3.6844,
      category: "MUSICA",
      maxAttendees: 200,
      creatorId: ana.id,
      image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800",
    }}),
    prisma.event.create({ data: {
      title: "Hackathon de IA: 48 horas de innovación",
      description: "Reúnete con desarrolladores, diseñadores y emprendedores para construir soluciones de IA en 48 horas. Premios para los 3 mejores proyectos.",
      date: d(7, 9),
      location: "Campus Google, Madrid",
      latitude: 40.4534,
      longitude: -3.6921,
      category: "TECNOLOGIA",
      maxAttendees: 80,
      creatorId: carlos.id,
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    }}),
    prisma.event.create({ data: {
      title: "Ruta de senderismo por Guadarrama",
      description: "Ruta circular de 15km por la Sierra de Guadarrama. Nivel medio. Llevar agua, comida y calzado adecuado. Salida desde el aparcamiento de Cotos.",
      date: d(5, 8),
      location: "Puerto de Cotos, Madrid",
      latitude: 40.8333,
      longitude: -3.9833,
      category: "DEPORTE",
      maxAttendees: 25,
      creatorId: mario.id,
    }}),
    prisma.event.create({ data: {
      title: "Exposición: Arte Generativo y NFT",
      description: "Primera exposición de arte generativo en Barcelona. Artistas locales e internacionales muestran obras creadas con algoritmos e inteligencia artificial.",
      date: d(10, 17),
      location: "CCCB, Barcelona",
      latitude: 41.3834,
      longitude: 2.1661,
      category: "ARTE",
      creatorId: sofia.id,
      image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800",
    }}),
    prisma.event.create({ data: {
      title: "Cata de vinos de la Ribera del Duero",
      description: "Degustación guiada de 8 vinos con maridaje de quesos y embutidos ibéricos. Plazas muy limitadas. Incluye copa y cuaderno de cata.",
      date: d(14, 19),
      location: "Bodega El Lagar, Valencia",
      latitude: 39.4699,
      longitude: -0.3763,
      category: "GASTRONOMIA",
      maxAttendees: 20,
      creatorId: lucia.id,
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
    }}),
    prisma.event.create({ data: {
      title: "Taller de React avanzado: Patrones y rendimiento",
      description: "Workshop intensivo de 6h sobre patrones avanzados en React 19: Concurrent Mode, Suspense, Server Components y optimización de rendimiento.",
      date: d(12, 10),
      location: "CoWorking Málaga Tech Park",
      latitude: 36.6583,
      longitude: -4.5294,
      category: "EDUCACION",
      maxAttendees: 30,
      creatorId: carlos.id,
      image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800",
    }}),
    prisma.event.create({ data: {
      title: "Networking Startups: Inversores y Fundadores",
      description: "Encuentro mensual entre fundadores de startups e inversores. Formato de pitches rápidos de 3 minutos + sesión de networking.",
      date: d(20, 18),
      location: "Espacio LOOM, Madrid",
      latitude: 40.4200,
      longitude: -3.7025,
      category: "NEGOCIOS",
      maxAttendees: 100,
      creatorId: ana.id,
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800",
    }}),
    prisma.event.create({ data: {
      title: "Torneo de fútbol 7 — Liga Primavera",
      description: "Torneo de fútbol 7 para equipos amateur. 8 equipos, fase de grupos + eliminatorias. Trofeo al campeón y subcampeón.",
      date: d(8, 10),
      location: "Ciudad Deportiva Valdebebas, Madrid",
      latitude: 40.4863,
      longitude: -3.6104,
      category: "DEPORTE",
      maxAttendees: 56,
      creatorId: mario.id,
    }}),
  ]);
  console.log("📅 Eventos creados: 8");

  // ── Inscripciones ─────────────────────────────────────────────────────────
  const enrollments = [
    // Festival Jazz: carlos, lucia, mario, sofia
    { userId: carlos.id, eventId: e1.id },
    { userId: lucia.id,  eventId: e1.id },
    { userId: mario.id,  eventId: e1.id },
    { userId: sofia.id,  eventId: e1.id },
    // Hackathon: ana, lucia, sofia
    { userId: ana.id,    eventId: e2.id },
    { userId: lucia.id,  eventId: e2.id },
    { userId: sofia.id,  eventId: e2.id },
    // Senderismo: ana, carlos, lucia
    { userId: ana.id,    eventId: e3.id },
    { userId: carlos.id, eventId: e3.id },
    { userId: lucia.id,  eventId: e3.id },
    // Exposición arte: carlos, mario
    { userId: carlos.id, eventId: e4.id },
    { userId: mario.id,  eventId: e4.id },
    // Cata vinos: mario, sofia, carlos
    { userId: mario.id,  eventId: e5.id },
    { userId: sofia.id,  eventId: e5.id },
    { userId: carlos.id, eventId: e5.id },
    // Taller React: ana, lucia, mario
    { userId: ana.id,    eventId: e6.id },
    { userId: lucia.id,  eventId: e6.id },
    { userId: mario.id,  eventId: e6.id },
    // Networking: carlos, lucia, sofia, mario
    { userId: carlos.id, eventId: e7.id },
    { userId: lucia.id,  eventId: e7.id },
    { userId: sofia.id,  eventId: e7.id },
    { userId: mario.id,  eventId: e7.id },
    // Torneo fútbol: ana, carlos, lucia, sofia
    { userId: ana.id,    eventId: e8.id },
    { userId: carlos.id, eventId: e8.id },
    { userId: lucia.id,  eventId: e8.id },
    { userId: sofia.id,  eventId: e8.id },
  ];

  await prisma.enrollment.createMany({ data: enrollments });
  console.log(`✅ Inscripciones creadas: ${enrollments.length}`);

  // ── Mensajes en el muro ───────────────────────────────────────────────────
  const messages = [
    // Muro Festival Jazz
    { content: "¡Tengo muchísimas ganas! ¿Habrá zona para sentarse?", userId: carlos.id, eventId: e1.id },
    { content: "El año pasado estuvo increíble, este año promete aún más.", userId: lucia.id, eventId: e1.id },
    { content: "¿Se puede llevar comida y bebida propia?", userId: mario.id, eventId: e1.id },
    { content: "Sí, podéis traer hambre y cosas de comer 🎷", userId: ana.id, eventId: e1.id },
    { content: "Perfecto, llevaré una manta y algo de picnic.", userId: sofia.id, eventId: e1.id },

    // Muro Hackathon
    { content: "¿Necesitamos llevar nuestro propio portátil?", userId: ana.id, eventId: e2.id },
    { content: "Sí, traed vuestro equipo. Habrá monitores disponibles en el espacio.", userId: carlos.id, eventId: e2.id },
    { content: "¿Hay restricción de tamaño de equipo?", userId: lucia.id, eventId: e2.id },
    { content: "Equipos de 2 a 4 personas. Se puede ir solo y buscar equipo allí.", userId: carlos.id, eventId: e2.id },
    { content: "Genial, cuento los días para esto 🚀", userId: sofia.id, eventId: e2.id },

    // Muro Senderismo
    { content: "¿El nivel de dificultad es alto? Soy principiante.", userId: ana.id, eventId: e3.id },
    { content: "Nivel medio-bajo, no os preocupéis. El desnivel es suave.", userId: mario.id, eventId: e3.id },
    { content: "¿Quedamos en el aparcamiento de Cotos a las 8:00?", userId: carlos.id, eventId: e3.id },
    { content: "Exacto, a las 8:00 en Cotos. Mirad el pronóstico que puede llover.", userId: mario.id, eventId: e3.id },

    // Muro Cata de vinos
    { content: "¿Hay opción sin alcohol para acompañantes?", userId: mario.id, eventId: e5.id },
    { content: "Podemos preguntar, pero la cata es específicamente de vino 🍷", userId: lucia.id, eventId: e5.id },
    { content: "¡Nunca he ido a una cata guiada, muy emocionante!", userId: sofia.id, eventId: e5.id },
    { content: "Os va a encantar, el sumiller explica todo de forma muy amena.", userId: lucia.id, eventId: e5.id },

    // Muro Taller React
    { content: "¿Qué nivel mínimo de React se requiere?", userId: ana.id, eventId: e6.id },
    { content: "Al menos 6 meses de experiencia con hooks. Es avanzado.", userId: carlos.id, eventId: e6.id },
    { content: "¿Habrá material o diapositivas después?", userId: lucia.id, eventId: e6.id },
    { content: "Todo el material estará disponible en GitHub tras el taller.", userId: carlos.id, eventId: e6.id },
    { content: "¡Perfecto! Será muy útil para repasar.", userId: mario.id, eventId: e6.id },
  ];

  await prisma.message.createMany({ data: messages });
  console.log(`💬 Mensajes creados: ${messages.length}`);

  console.log("\n✨ Seed completado. Credenciales de acceso:");
  console.log("   Todos los usuarios usan la contraseña: Test1234!");
  console.log("   admin@test.com  → ADMIN");
  console.log("   ana@test.com    → USER (organizadora)");
  console.log("   carlos@test.com → USER");
  console.log("   lucia@test.com  → USER");
  console.log("   mario@test.com  → USER");
  console.log("   sofia@test.com  → USER");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
