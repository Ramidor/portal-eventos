const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const PASSWORD = "Test1234!";

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.rating.deleteMany();
  await prisma.message.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
  console.log("🗑️  Base de datos limpiada");

  const hash = await bcrypt.hash(PASSWORD, 10);

  const [admin, ana, carlos, lucia, mario, sofia, elena, pablo, laura, david, marta, javier] = await Promise.all([
    prisma.user.create({ data: { name: "Admin",            email: "admin@test.com",  password: hash, role: "ADMIN", emailVerified: true } }),
    prisma.user.create({ data: { name: "Ana García",       email: "ana@test.com",    password: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: "Carlos Rodríguez", email: "carlos@test.com", password: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: "Lucía Martínez",   email: "lucia@test.com",  password: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: "Mario López",      email: "mario@test.com",  password: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: "Sofía Fernández",  email: "sofia@test.com",  password: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: "Elena Sánchez",    email: "elena@test.com",  password: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: "Pablo Jiménez",    email: "pablo@test.com",  password: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: "Laura Moreno",     email: "laura@test.com",  password: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: "David Torres",     email: "david@test.com",  password: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: "Marta Ruiz",       email: "marta@test.com",  password: hash, emailVerified: true } }),
    prisma.user.create({ data: { name: "Javier Navarro",   email: "javier@test.com", password: hash, emailVerified: true } }),
  ]);
  console.log("👥 Usuarios creados: 12");

  const now = new Date();
  const d = (days, hours = 19) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + days);
    dt.setHours(hours, 0, 0, 0);
    return dt;
  };
  const past = (days, hours = 19) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - days);
    dt.setHours(hours, 0, 0, 0);
    return dt;
  };

  // ── 20 eventos próximos ───────────────────────────────────────────────────
  const [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13, e14, e15, e16, e17, e18, e19, e20] = await Promise.all([
    // MUSICA
    prisma.event.create({ data: {
      title: "Festival de Jazz en el Retiro",
      description: "Una tarde mágica con los mejores grupos de jazz de Madrid. Ambiente íntimo al aire libre junto al lago. Tres escenarios simultáneos con artistas nacionales e internacionales.",
      date: d(3, 18), location: "Parque del Retiro, Madrid",
      latitude: 40.4153, longitude: -3.6844,
      category: "MUSICA", maxAttendees: 200, creatorId: ana.id,
      images: ["https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Concierto de Indie Folk — Sala Apolo",
      description: "Noche de música indie folk con tres bandas emergentes de la escena barcelonesa. Puertas a las 20:30, concierto a las 21:30. Entrada limitada.",
      date: d(6, 21), location: "Sala Apolo, Barcelona",
      latitude: 41.3741, longitude: 2.1614,
      category: "MUSICA", maxAttendees: 300, creatorId: sofia.id,
      images: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Open Mic de Flamenco Fusión",
      description: "Escenario abierto para artistas flamencos que quieran fusionar el flamenco con otros géneros. Inscripción previa para actuar, entrada libre para el público.",
      date: d(9, 20), location: "Casa de la Música, Sevilla",
      latitude: 37.3814, longitude: -5.9763,
      category: "MUSICA", creatorId: elena.id,
      images: ["https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Concierto Sinfónico de Primavera",
      description: "La Orquesta Filarmónica de Valencia interpreta obras de Beethoven, Brahms y Mahler. Noche especial en el Palau de les Arts con repertorio primaveral.",
      date: d(22, 19), location: "Palau de les Arts, Valencia",
      latitude: 39.4567, longitude: -0.3518,
      category: "MUSICA", maxAttendees: 1500, creatorId: pablo.id,
      images: ["https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800"],
    }}),
    // TECNOLOGIA
    prisma.event.create({ data: {
      title: "Hackathon de IA: 48 horas de innovación",
      description: "Reúnete con desarrolladores, diseñadores y emprendedores para construir soluciones de IA en 48 horas. Premios de hasta 5.000 € para los 3 mejores proyectos. Mentores de Google, Meta y Mistral.",
      date: d(7, 9), location: "Campus Google, Madrid",
      latitude: 40.4534, longitude: -3.6921,
      category: "TECNOLOGIA", maxAttendees: 80, creatorId: carlos.id,
      images: ["https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Taller de React avanzado: Patrones y rendimiento",
      description: "Workshop intensivo de 6h sobre patrones avanzados en React 19: Concurrent Mode, Suspense, Server Components y optimización de rendimiento. Incluye ejercicios prácticos y acceso al repo.",
      date: d(12, 10), location: "CoWorking Málaga Tech Park",
      latitude: 36.6583, longitude: -4.5294,
      category: "TECNOLOGIA", maxAttendees: 30, creatorId: carlos.id,
      images: ["https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Conferencia de Ciberseguridad — CiberBilbao 2025",
      description: "Tres días de charlas, talleres y CTFs sobre seguridad ofensiva y defensiva. Ponentes de Panda Security, Telefónica Tech e Indra. Certificado de asistencia incluido.",
      date: d(18, 9), location: "BEC — Bilbao Exhibition Centre",
      latitude: 43.2630, longitude: -2.9340,
      category: "TECNOLOGIA", maxAttendees: 400, creatorId: david.id,
      images: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800"],
    }}),
    // DEPORTE
    prisma.event.create({ data: {
      title: "Ruta de senderismo por la Sierra de Guadarrama",
      description: "Ruta circular de 15 km por la Sierra de Guadarrama. Nivel medio. Llevar agua, comida y calzado adecuado. Salida desde el aparcamiento de Cotos a las 8:00 h.",
      date: d(5, 8), location: "Puerto de Cotos, Madrid",
      latitude: 40.8333, longitude: -3.9833,
      category: "DEPORTE", maxAttendees: 25, creatorId: mario.id,
    }}),
    prisma.event.create({ data: {
      title: "Torneo de fútbol 7 — Liga Primavera",
      description: "Torneo de fútbol 7 para equipos amateur. 8 equipos, fase de grupos más eliminatorias. Trofeo al campeón y subcampeón. Inscripción por equipos completos de 7.",
      date: d(8, 10), location: "Ciudad Deportiva Valdebebas, Madrid",
      latitude: 40.4863, longitude: -3.6104,
      category: "DEPORTE", maxAttendees: 56, creatorId: mario.id,
    }}),
    prisma.event.create({ data: {
      title: "Clase de yoga al amanecer en la playa",
      description: "Sesión de yoga Vinyasa a orillas del mar al amanecer. Todos los niveles bienvenidos. Llevar esterilla y ropa cómoda. Plazas muy limitadas para una experiencia íntima.",
      date: d(4, 7), location: "Playa de La Malagueta, Málaga",
      latitude: 36.7190, longitude: -4.4090,
      category: "DEPORTE", maxAttendees: 15, creatorId: laura.id,
      images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"],
    }}),
    // ARTE
    prisma.event.create({ data: {
      title: "Exposición: Arte Generativo y NFT",
      description: "Primera exposición de arte generativo en Barcelona. Artistas locales e internacionales muestran obras creadas con algoritmos e inteligencia artificial. Entrada libre los martes.",
      date: d(10, 17), location: "CCCB — Centre de Cultura Contemporànea, Barcelona",
      latitude: 41.3834, longitude: 2.1661,
      category: "ARTE", creatorId: sofia.id,
      images: ["https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Taller de acuarela para principiantes",
      description: "Aprende las técnicas básicas de la acuarela en este taller de 3 horas. Se proporcionan todos los materiales. Sin experiencia previa. Grupos de máximo 12 personas.",
      date: d(15, 16), location: "Estudio de Arte La Paleta, Granada",
      latitude: 37.1773, longitude: -3.5986,
      category: "ARTE", maxAttendees: 12, creatorId: marta.id,
      images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800"],
    }}),
    // GASTRONOMIA
    prisma.event.create({ data: {
      title: "Cata de vinos de la Ribera del Duero",
      description: "Degustación guiada de 8 vinos con maridaje de quesos y embutidos ibéricos. Plazas muy limitadas. Incluye copa personalizada y cuaderno de cata. Sumiller certificado.",
      date: d(14, 19), location: "Bodega El Lagar, Valencia",
      latitude: 39.4699, longitude: -0.3763,
      category: "GASTRONOMIA", maxAttendees: 20, creatorId: lucia.id,
      images: ["https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Mercado de Productores Ecológicos de Madrid",
      description: "Más de 40 productores locales con frutas, verduras, quesos, embutidos, panes y conservas de agricultura ecológica certificada. Degustaciones gratuitas todo el día.",
      date: d(11, 10), location: "Mercado de Maravillas, Madrid",
      latitude: 40.4390, longitude: -3.7040,
      category: "GASTRONOMIA", creatorId: elena.id,
      images: ["https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800"],
    }}),
    // EDUCACION
    prisma.event.create({ data: {
      title: "Taller de escritura creativa — El poder de la narrativa",
      description: "Workshop de 4 horas con escritora profesional. Técnicas de construcción narrativa, creación de personajes y diálogos. Incluye ejercicios guiados y feedback personalizado.",
      date: d(16, 17), location: "Librería La Central, Madrid",
      latitude: 40.4186, longitude: -3.6993,
      category: "EDUCACION", maxAttendees: 20, creatorId: ana.id,
      images: ["https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Curso de fotografía urbana",
      description: "Aprende a capturar la esencia de la ciudad. 5 horas de teoría y práctica por las calles del Gótico. Todos los niveles bienvenidos. Trae tu cámara o móvil.",
      date: d(19, 10), location: "Barrio Gótico, Barcelona",
      latitude: 41.3830, longitude: 2.1760,
      category: "EDUCACION", maxAttendees: 15, creatorId: pablo.id,
      images: ["https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Workshop de finanzas personales para jóvenes",
      description: "Aprende a gestionar tu dinero: presupuesto, ahorro, inversión en índices y planificación financiera. Sin jerga, sin productos que vender. Solo educación práctica y útil.",
      date: d(25, 18), location: "CoWorking WeWork, Madrid",
      latitude: 40.4255, longitude: -3.6912,
      category: "EDUCACION", maxAttendees: 35, creatorId: javier.id,
      images: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800"],
    }}),
    // NEGOCIOS
    prisma.event.create({ data: {
      title: "Networking Startups: Inversores y Fundadores",
      description: "Encuentro mensual entre fundadores de startups e inversores. Formato de pitches rápidos de 3 minutos más sesión de networking libre. Más de 20 inversores confirmados.",
      date: d(20, 18), location: "Espacio LOOM, Madrid",
      latitude: 40.4200, longitude: -3.7025,
      category: "NEGOCIOS", maxAttendees: 100, creatorId: ana.id,
      images: ["https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Feria de Empleo Tech 2025",
      description: "Más de 60 empresas tecnológicas buscando talento. CVs en mano, entrevistas en el acto. Sectores: IA, cloud, ciberseguridad, fintech y ecommerce. Entrada gratuita.",
      date: d(30, 9), location: "IFEMA — Feria de Madrid",
      latitude: 40.4665, longitude: -3.6146,
      category: "NEGOCIOS", creatorId: david.id,
      images: ["https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800"],
    }}),
    // OTRO
    prisma.event.create({ data: {
      title: "Mercadillo de Artesanía y Vintage — Toledo",
      description: "Más de 80 puestos de artesanía local, ropa vintage, antigüedades y curiosidades. Ambiente familiar. Actuaciones de músicos callejeros durante todo el día. Entrada libre.",
      date: d(13, 10), location: "Plaza de Zocodover, Toledo",
      latitude: 39.8581, longitude: -4.0226,
      category: "OTRO", creatorId: marta.id,
    }}),
  ]);
  console.log("📅 Eventos próximos creados: 20");

  // ── Inscripciones eventos próximos ────────────────────────────────────────
  await prisma.enrollment.createMany({ data: [
    // e1 Festival Jazz (ana): carlos, lucia, mario, sofia, elena, pablo
    { userId: carlos.id, eventId: e1.id }, { userId: lucia.id,  eventId: e1.id },
    { userId: mario.id,  eventId: e1.id }, { userId: sofia.id,  eventId: e1.id },
    { userId: elena.id,  eventId: e1.id }, { userId: pablo.id,  eventId: e1.id },
    // e2 Indie Folk (sofia): carlos, mario, elena, laura, david
    { userId: carlos.id, eventId: e2.id }, { userId: mario.id,  eventId: e2.id },
    { userId: elena.id,  eventId: e2.id }, { userId: laura.id,  eventId: e2.id },
    { userId: david.id,  eventId: e2.id },
    // e3 Open Mic Flamenco (elena): ana, sofia, pablo, lucia
    { userId: ana.id,    eventId: e3.id }, { userId: sofia.id,  eventId: e3.id },
    { userId: pablo.id,  eventId: e3.id }, { userId: lucia.id,  eventId: e3.id },
    // e4 Sinfónico (pablo): mario, elena, laura, david, marta, sofia
    { userId: mario.id,  eventId: e4.id }, { userId: elena.id,  eventId: e4.id },
    { userId: laura.id,  eventId: e4.id }, { userId: david.id,  eventId: e4.id },
    { userId: marta.id,  eventId: e4.id }, { userId: sofia.id,  eventId: e4.id },
    // e5 Hackathon IA (carlos): ana, lucia, sofia, david, javier, laura
    { userId: ana.id,    eventId: e5.id }, { userId: lucia.id,  eventId: e5.id },
    { userId: sofia.id,  eventId: e5.id }, { userId: david.id,  eventId: e5.id },
    { userId: javier.id, eventId: e5.id }, { userId: laura.id,  eventId: e5.id },
    // e6 React Avanzado (carlos): ana, lucia, mario, david, javier
    { userId: ana.id,    eventId: e6.id }, { userId: lucia.id,  eventId: e6.id },
    { userId: mario.id,  eventId: e6.id }, { userId: david.id,  eventId: e6.id },
    { userId: javier.id, eventId: e6.id },
    // e7 Ciberseguridad (david): carlos, javier, mario, sofia, ana, marta
    { userId: carlos.id, eventId: e7.id }, { userId: javier.id, eventId: e7.id },
    { userId: mario.id,  eventId: e7.id }, { userId: sofia.id,  eventId: e7.id },
    { userId: ana.id,    eventId: e7.id }, { userId: marta.id,  eventId: e7.id },
    // e8 Senderismo (mario): ana, carlos, lucia, sofia, elena
    { userId: ana.id,    eventId: e8.id }, { userId: carlos.id, eventId: e8.id },
    { userId: lucia.id,  eventId: e8.id }, { userId: sofia.id,  eventId: e8.id },
    { userId: elena.id,  eventId: e8.id },
    // e9 Torneo fútbol (mario): ana, carlos, lucia, sofia, david, javier
    { userId: ana.id,    eventId: e9.id }, { userId: carlos.id, eventId: e9.id },
    { userId: lucia.id,  eventId: e9.id }, { userId: sofia.id,  eventId: e9.id },
    { userId: david.id,  eventId: e9.id }, { userId: javier.id, eventId: e9.id },
    // e10 Yoga playa (laura): ana, sofia, marta, elena
    { userId: ana.id,    eventId: e10.id }, { userId: sofia.id,  eventId: e10.id },
    { userId: marta.id,  eventId: e10.id }, { userId: elena.id,  eventId: e10.id },
    // e11 Arte Generativo (sofia): carlos, mario, pablo, marta
    { userId: carlos.id, eventId: e11.id }, { userId: mario.id,  eventId: e11.id },
    { userId: pablo.id,  eventId: e11.id }, { userId: marta.id,  eventId: e11.id },
    // e12 Acuarela (marta): ana, lucia, elena, pablo
    { userId: ana.id,    eventId: e12.id }, { userId: lucia.id,  eventId: e12.id },
    { userId: elena.id,  eventId: e12.id }, { userId: pablo.id,  eventId: e12.id },
    // e13 Cata vinos (lucia): mario, sofia, carlos, david, javier
    { userId: mario.id,  eventId: e13.id }, { userId: sofia.id,  eventId: e13.id },
    { userId: carlos.id, eventId: e13.id }, { userId: david.id,  eventId: e13.id },
    { userId: javier.id, eventId: e13.id },
    // e14 Mercado Ecológico (elena): ana, carlos, mario, javier, sofia
    { userId: ana.id,    eventId: e14.id }, { userId: carlos.id, eventId: e14.id },
    { userId: mario.id,  eventId: e14.id }, { userId: javier.id, eventId: e14.id },
    { userId: sofia.id,  eventId: e14.id },
    // e15 Escritura creativa (ana): sofia, elena, marta, pablo, lucia
    { userId: sofia.id,  eventId: e15.id }, { userId: elena.id,  eventId: e15.id },
    { userId: marta.id,  eventId: e15.id }, { userId: pablo.id,  eventId: e15.id },
    { userId: lucia.id,  eventId: e15.id },
    // e16 Fotografía urbana (pablo): sofia, marta, ana, elena, javier
    { userId: sofia.id,  eventId: e16.id }, { userId: marta.id,  eventId: e16.id },
    { userId: ana.id,    eventId: e16.id }, { userId: elena.id,  eventId: e16.id },
    { userId: javier.id, eventId: e16.id },
    // e17 Finanzas (javier): carlos, mario, david, ana, laura
    { userId: carlos.id, eventId: e17.id }, { userId: mario.id,  eventId: e17.id },
    { userId: david.id,  eventId: e17.id }, { userId: ana.id,    eventId: e17.id },
    { userId: laura.id,  eventId: e17.id },
    // e18 Networking Startups (ana): carlos, lucia, sofia, mario, david, javier, pablo
    { userId: carlos.id, eventId: e18.id }, { userId: lucia.id,  eventId: e18.id },
    { userId: sofia.id,  eventId: e18.id }, { userId: mario.id,  eventId: e18.id },
    { userId: david.id,  eventId: e18.id }, { userId: javier.id, eventId: e18.id },
    { userId: pablo.id,  eventId: e18.id },
    // e19 Feria Empleo (david): carlos, javier, mario, ana, lucia, elena, pablo
    { userId: carlos.id, eventId: e19.id }, { userId: javier.id, eventId: e19.id },
    { userId: mario.id,  eventId: e19.id }, { userId: ana.id,    eventId: e19.id },
    { userId: lucia.id,  eventId: e19.id }, { userId: elena.id,  eventId: e19.id },
    // e20 Mercadillo Toledo (marta): ana, sofia, javier, pablo, carlos
    { userId: ana.id,    eventId: e20.id }, { userId: sofia.id,  eventId: e20.id },
    { userId: javier.id, eventId: e20.id }, { userId: pablo.id,  eventId: e20.id },
    { userId: carlos.id, eventId: e20.id },
  ]});
  console.log("✅ Inscripciones (próximos) creadas");

  // ── Mensajes en muros ─────────────────────────────────────────────────────
  await prisma.message.createMany({ data: [
    // Festival Jazz
    { content: "¡Tengo muchísimas ganas! ¿Habrá zona para sentarse?", userId: carlos.id, eventId: e1.id },
    { content: "El año pasado estuvo increíble, este año promete aún más.", userId: lucia.id, eventId: e1.id },
    { content: "¿Se puede llevar comida y bebida propia?", userId: mario.id, eventId: e1.id },
    { content: "Sí, podéis traer manta y algo de picnic. Os recomiendo llegar pronto.", userId: ana.id, eventId: e1.id },
    { content: "Perfecto, llevaré queso y algo de beber 🎷", userId: sofia.id, eventId: e1.id },
    { content: "¿Hay aparcamiento cerca o mejor metro?", userId: elena.id, eventId: e1.id },
    { content: "Metro a Retiro es lo mejor, el aparcamiento siempre está petado.", userId: ana.id, eventId: e1.id },
    // Hackathon IA
    { content: "¿Necesitamos llevar nuestro propio portátil?", userId: ana.id, eventId: e5.id },
    { content: "Sí, traed vuestro equipo. Habrá monitores adicionales en el espacio.", userId: carlos.id, eventId: e5.id },
    { content: "¿Hay restricción de tamaño de equipo?", userId: lucia.id, eventId: e5.id },
    { content: "Equipos de 2 a 4 personas. Se puede ir solo y buscar equipo allí.", userId: carlos.id, eventId: e5.id },
    { content: "¿Cuál es el stack recomendado para los proyectos?", userId: david.id, eventId: e5.id },
    { content: "Libre elección. El año pasado los ganadores usaron Python + FastAPI + React.", userId: carlos.id, eventId: e5.id },
    { content: "Genial, cuento los días para esto 🚀", userId: javier.id, eventId: e5.id },
    // Senderismo Guadarrama
    { content: "¿El nivel de dificultad es alto? Soy bastante principiante.", userId: ana.id, eventId: e8.id },
    { content: "Nivel medio-bajo, no os preocupéis. El desnivel es suave.", userId: mario.id, eventId: e8.id },
    { content: "¿Quedamos en el aparcamiento de Cotos a las 8:00?", userId: carlos.id, eventId: e8.id },
    { content: "Exacto, a las 8:00 en Cotos. Mirad el pronóstico, puede refrescar en la cima.", userId: mario.id, eventId: e8.id },
    { content: "¿Hay cercanías o mejor ir en coche?", userId: sofia.id, eventId: e8.id },
    { content: "Cercanías desde Atocha o coche. El tren es cómodo y barato.", userId: mario.id, eventId: e8.id },
    // React avanzado
    { content: "¿Qué nivel mínimo de React se requiere?", userId: ana.id, eventId: e6.id },
    { content: "Al menos 6 meses de experiencia con hooks. Es contenido avanzado.", userId: carlos.id, eventId: e6.id },
    { content: "¿Habrá material o diapositivas disponibles después?", userId: lucia.id, eventId: e6.id },
    { content: "Todo el material estará en GitHub tras el taller.", userId: carlos.id, eventId: e6.id },
    { content: "¡Perfecto! Será muy útil para repasar en casa.", userId: mario.id, eventId: e6.id },
    // Taller acuarela
    { content: "¿Los materiales están incluidos o hay que llevar algo?", userId: ana.id, eventId: e12.id },
    { content: "Todo incluido: papel, pinturas, pinceles y agua. Solo traed ganas.", userId: marta.id, eventId: e12.id },
    { content: "¡Perfecto! ¿Hay lista de espera si alguien cancela?", userId: elena.id, eventId: e12.id },
    { content: "Sí, escribidme por aquí y os apunto.", userId: marta.id, eventId: e12.id },
    // Cata de vinos
    { content: "¿Hay opción para acompañantes que no beban alcohol?", userId: mario.id, eventId: e13.id },
    { content: "La cata es específicamente de vino, aunque podemos preguntar al bodeguero.", userId: lucia.id, eventId: e13.id },
    { content: "¡Nunca he ido a una cata guiada, muy emocionante!", userId: sofia.id, eventId: e13.id },
    { content: "Os va a encantar, el sumiller explica todo sin tecnicismos.", userId: lucia.id, eventId: e13.id },
    { content: "¿Hay estacionamiento cerca de la bodega?", userId: david.id, eventId: e13.id },
    // Networking Startups
    { content: "¿Hay que preparar el pitch con antelación?", userId: carlos.id, eventId: e18.id },
    { content: "Los pitches son opcionales. Puedes venir solo a escuchar y hacer networking.", userId: ana.id, eventId: e18.id },
    { content: "¿Qué sectores suelen estar más representados?", userId: david.id, eventId: e18.id },
    { content: "Principalmente fintech, healthtech y SaaS. Pero hay de todo.", userId: ana.id, eventId: e18.id },
    { content: "¿Habrá algo de catering?", userId: pablo.id, eventId: e18.id },
    { content: "Sí, bebidas y finger food durante el networking.", userId: ana.id, eventId: e18.id },
    // Fotografía urbana
    { content: "¿La práctica es por libre o vamos todos juntos?", userId: sofia.id, eventId: e16.id },
    { content: "Empezamos en grupo y luego hay tiempo libre para explorar. Al final ponemos en común.", userId: pablo.id, eventId: e16.id },
    { content: "¿Vale con la cámara del móvil?", userId: marta.id, eventId: e16.id },
    { content: "Totalmente, lo importante es la mirada, no el equipo.", userId: pablo.id, eventId: e16.id },
    // Finanzas personales
    { content: "¿Se habla de fondos indexados o solo de ahorro básico?", userId: carlos.id, eventId: e17.id },
    { content: "Cubrimos ahorro, presupuesto y fundamentos de inversión pasiva. Indexados incluidos.", userId: javier.id, eventId: e17.id },
    { content: "¡Justo lo que necesito! ¿Hay que llevar algo?", userId: ana.id, eventId: e17.id },
    { content: "Solo bloc de notas y ganas de aprender.", userId: javier.id, eventId: e17.id },
  ]});
  console.log("💬 Mensajes en muros creados");

  // ── 8 eventos pasados ─────────────────────────────────────────────────────
  const [ep1, ep2, ep3, ep4, ep5, ep6, ep7, ep8] = await Promise.all([
    prisma.event.create({ data: {
      title: "Noche Flamenca — Tablao El Palacio",
      description: "Una noche mágica de flamenco puro con los mejores artistas de Sevilla. Tablao íntimo con capacidad limitada para una experiencia única e irrepetible.",
      date: past(15, 21), location: "Tablao El Palacio, Sevilla",
      latitude: 37.3886, longitude: -5.9823,
      category: "MUSICA", maxAttendees: 60, creatorId: sofia.id,
      images: ["https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Maratón Urbano de Valencia 10K",
      description: "Carrera popular de 10 km por el centro histórico de Valencia. Abierta a todos los niveles. Camiseta y medalla incluidas. Chip de cronometraje.",
      date: past(8, 8), location: "Plaza del Ayuntamiento, Valencia",
      latitude: 39.4694, longitude: -0.3769,
      category: "DEPORTE", maxAttendees: 200, creatorId: mario.id,
      images: ["https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Feria Gastronómica — Sabores del Mediterráneo",
      description: "Feria de productores locales con degustaciones de aceite de oliva, quesos artesanos, vinos y conservas. Entrada gratuita. Más de 50 expositores.",
      date: past(5, 11), location: "Mercado Central, Barcelona",
      latitude: 41.3797, longitude: 2.1724,
      category: "GASTRONOMIA", creatorId: lucia.id,
      images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Exposición de Fotografía Documental — Miradas",
      description: "Colección de 80 fotografías de seis fotoperiodistas españoles. Crónica visual de los últimos cinco años. Visitas guiadas los fines de semana.",
      date: past(12, 18), location: "Sala Alcalá 31, Madrid",
      latitude: 40.4197, longitude: -3.6869,
      category: "ARTE", creatorId: pablo.id,
      images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Meetup de DevOps y Cloud Computing",
      description: "Encuentro mensual de la comunidad DevOps de Madrid. Charlas sobre Kubernetes, Terraform y observabilidad. Abierto a todos los niveles técnicos.",
      date: past(20, 19), location: "Espacio 42, Madrid",
      latitude: 40.4168, longitude: -3.7038,
      category: "TECNOLOGIA", creatorId: carlos.id,
      images: ["https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Taller de cocina japonesa — Sushi y Ramen",
      description: "Aprende a preparar sushi, ramen y gyozas con ingredientes auténticos. Incluye la cena con lo preparado. Grupos de 10 personas máximo.",
      date: past(10, 18), location: "Escuela de Cocina Takumi, Barcelona",
      latitude: 41.3888, longitude: 2.1564,
      category: "GASTRONOMIA", maxAttendees: 10, creatorId: lucia.id,
      images: ["https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Conferencia de Diseño UX — Diseñando para Personas",
      description: "Un día completo con ponentes de Google, Spotify y Cabify sobre investigación de usuarios, prototipado y sistemas de diseño. Certificado de asistencia.",
      date: past(18, 9), location: "Palacio de Congresos, Valencia",
      latitude: 39.4770, longitude: -0.3592,
      category: "EDUCACION", maxAttendees: 250, creatorId: pablo.id,
      images: ["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800"],
    }}),
    prisma.event.create({ data: {
      title: "Carrera Popular 5K — Por la Integración",
      description: "Carrera solidaria de 5 km. Fondos destinados a la Fundación Integra. No competitiva, para todas las edades. Inscripción con donativo mínimo de 5 €.",
      date: past(3, 9), location: "Casa de Campo, Madrid",
      latitude: 40.4140, longitude: -3.7439,
      category: "DEPORTE", creatorId: mario.id,
      images: ["https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=800"],
    }}),
  ]);
  console.log("📅 Eventos pasados creados: 8");

  // ── Inscripciones eventos pasados ─────────────────────────────────────────
  await prisma.enrollment.createMany({ data: [
    // ep1 Noche Flamenca (sofia): ana, carlos, mario, laura, david
    { userId: ana.id,    eventId: ep1.id }, { userId: carlos.id, eventId: ep1.id },
    { userId: mario.id,  eventId: ep1.id }, { userId: laura.id,  eventId: ep1.id },
    { userId: david.id,  eventId: ep1.id },
    // ep2 Maratón (mario): ana, sofia, carlos, javier, elena, marta
    { userId: ana.id,    eventId: ep2.id }, { userId: sofia.id,  eventId: ep2.id },
    { userId: carlos.id, eventId: ep2.id }, { userId: javier.id, eventId: ep2.id },
    { userId: elena.id,  eventId: ep2.id }, { userId: marta.id,  eventId: ep2.id },
    // ep3 Feria gastro (lucia): mario, ana, carlos, david, pablo
    { userId: mario.id,  eventId: ep3.id }, { userId: ana.id,    eventId: ep3.id },
    { userId: carlos.id, eventId: ep3.id }, { userId: david.id,  eventId: ep3.id },
    { userId: pablo.id,  eventId: ep3.id },
    // ep4 Fotografía (pablo): sofia, lucia, marta, elena, javier
    { userId: sofia.id,  eventId: ep4.id }, { userId: lucia.id,  eventId: ep4.id },
    { userId: marta.id,  eventId: ep4.id }, { userId: elena.id,  eventId: ep4.id },
    { userId: javier.id, eventId: ep4.id },
    // ep5 DevOps Meetup (carlos): david, javier, mario, ana, sofia
    { userId: david.id,  eventId: ep5.id }, { userId: javier.id, eventId: ep5.id },
    { userId: mario.id,  eventId: ep5.id }, { userId: ana.id,    eventId: ep5.id },
    { userId: sofia.id,  eventId: ep5.id },
    // ep6 Cocina japonesa (lucia): mario, sofia, elena, pablo, david
    { userId: mario.id,  eventId: ep6.id }, { userId: sofia.id,  eventId: ep6.id },
    { userId: elena.id,  eventId: ep6.id }, { userId: pablo.id,  eventId: ep6.id },
    { userId: david.id,  eventId: ep6.id },
    // ep7 Conferencia UX (pablo): ana, carlos, sofia, laura, marta, lucia
    { userId: ana.id,    eventId: ep7.id }, { userId: carlos.id, eventId: ep7.id },
    { userId: sofia.id,  eventId: ep7.id }, { userId: laura.id,  eventId: ep7.id },
    { userId: marta.id,  eventId: ep7.id }, { userId: lucia.id,  eventId: ep7.id },
    // ep8 Carrera 5K (mario): ana, david, javier, marta, laura, elena
    { userId: ana.id,    eventId: ep8.id }, { userId: david.id,  eventId: ep8.id },
    { userId: javier.id, eventId: ep8.id }, { userId: marta.id,  eventId: ep8.id },
    { userId: laura.id,  eventId: ep8.id }, { userId: elena.id,  eventId: ep8.id },
  ]});
  console.log("✅ Inscripciones (pasados) creadas");

  // ── Valoraciones ──────────────────────────────────────────────────────────
  await prisma.rating.createMany({ data: [
    // ep1 Noche Flamenca (creador: sofia) — ana, carlos, mario, laura, david
    { score: 5, comment: "Absolutamente increíble, la mejor noche flamenca que he vivido en mi vida.", raterId: ana.id,    creatorId: sofia.id, eventId: ep1.id },
    { score: 5, comment: "Una experiencia única. La bailaora principal fue impresionante.", raterId: carlos.id, creatorId: sofia.id, eventId: ep1.id },
    { score: 4, comment: "Muy buena organización, aunque el espacio era algo pequeño para tanta gente.", raterId: mario.id,  creatorId: sofia.id, eventId: ep1.id },
    { score: 5, comment: "Se me puso la piel de gallina. Repetiré sin dudarlo.", raterId: laura.id,  creatorId: sofia.id, eventId: ep1.id },
    { score: 4, comment: "Excelente velada, el ambiente era completamente mágico.", raterId: david.id,  creatorId: sofia.id, eventId: ep1.id },
    // ep2 Maratón (creador: mario) — ana, sofia, carlos, javier, elena
    { score: 4, comment: "Muy bien organizado, el recorrido por el centro histórico era precioso.", raterId: ana.id,    creatorId: mario.id, eventId: ep2.id },
    { score: 5, comment: "¡Conseguí mi mejor marca! Todo muy profesional.", raterId: sofia.id,  creatorId: mario.id, eventId: ep2.id },
    { score: 3, comment: "La logística de los avituallamientos mejorable, pero la carrera estuvo bien.", raterId: carlos.id, creatorId: mario.id, eventId: ep2.id },
    { score: 4, comment: "Muy buen ambiente. ¡El año que viene repito sin falta!", raterId: javier.id, creatorId: mario.id, eventId: ep2.id },
    { score: 5, comment: "Todo perfecto, desde la inscripción hasta la medalla de llegada.", raterId: elena.id,  creatorId: mario.id, eventId: ep2.id },
    // ep3 Feria gastro (creador: lucia) — mario, ana, carlos, david
    { score: 5, comment: "Los productores locales eran maravillosos, me llevé aceite para todo el año.", raterId: mario.id,  creatorId: lucia.id, eventId: ep3.id },
    { score: 4, comment: "Muy variado y bien organizado. Los quesos artesanos estaban increíbles.", raterId: ana.id,    creatorId: lucia.id, eventId: ep3.id },
    { score: 4, comment: "Entrada gratuita y calidad altísima. Definitivamente volveré.", raterId: carlos.id, creatorId: lucia.id, eventId: ep3.id },
    { score: 5, comment: "Una selección de productos excepcional. Felicidades por la organización.", raterId: david.id,  creatorId: lucia.id, eventId: ep3.id },
    // ep4 Fotografía (creador: pablo) — sofia, lucia, marta, javier
    { score: 5, comment: "Algunas fotos me dejaron sin palabras. Una curaduría excelente.", raterId: sofia.id,  creatorId: pablo.id, eventId: ep4.id },
    { score: 4, comment: "La visita guiada fue lo mejor, el contexto de cada foto es fascinante.", raterId: lucia.id,  creatorId: pablo.id, eventId: ep4.id },
    { score: 5, comment: "Imprescindible. Hacía falta una exposición así en Madrid.", raterId: marta.id,  creatorId: pablo.id, eventId: ep4.id },
    { score: 4, comment: "Muy bien montada, aunque hubiera querido más fotos de los últimos años.", raterId: javier.id, creatorId: pablo.id, eventId: ep4.id },
    // ep5 DevOps (creador: carlos) — david, javier, mario, ana
    { score: 5, comment: "La charla de Terraform fue de lo mejor que he escuchado en un meetup.", raterId: david.id,  creatorId: carlos.id, eventId: ep5.id },
    { score: 4, comment: "Muy buen nivel técnico, aunque el espacio se quedó algo pequeño.", raterId: javier.id, creatorId: carlos.id, eventId: ep5.id },
    { score: 4, comment: "Aprendo algo nuevo en cada edición. ¡Que siga!", raterId: mario.id,  creatorId: carlos.id, eventId: ep5.id },
    { score: 5, comment: "Los ponentes estuvieron increíbles. Kubernetes explicado a la perfección.", raterId: ana.id,    creatorId: carlos.id, eventId: ep5.id },
    // ep6 Cocina japonesa (creador: lucia) — mario, sofia, elena
    { score: 5, comment: "Aprendí más en 3 horas que viendo tutoriales durante meses.", raterId: mario.id,  creatorId: lucia.id, eventId: ep6.id },
    { score: 5, comment: "El ramen estaba exquisito. Me llevo la receta de regalo.", raterId: sofia.id,  creatorId: lucia.id, eventId: ep6.id },
    { score: 4, comment: "Muy buena dinámica, la chef explicó todo con mucha paciencia.", raterId: elena.id,  creatorId: lucia.id, eventId: ep6.id },
    // ep7 Conferencia UX (creador: pablo) — ana, carlos, sofia, laura
    { score: 5, comment: "La ponente de Spotify habló de cosas que no encuentras en ningún libro.", raterId: ana.id,    creatorId: pablo.id, eventId: ep7.id },
    { score: 4, comment: "Muy completa, aunque el horario del mediodía era algo ajustado.", raterId: carlos.id, creatorId: pablo.id, eventId: ep7.id },
    { score: 5, comment: "Me vine con 10 páginas de notas. Absolutamente recomendable.", raterId: sofia.id,  creatorId: pablo.id, eventId: ep7.id },
    { score: 4, comment: "Las dinámicas prácticas de la tarde fueron lo mejor del día.", raterId: laura.id,  creatorId: pablo.id, eventId: ep7.id },
    // ep8 Carrera 5K (creador: mario) — ana, david, javier, marta
    { score: 4, comment: "Muy bonito el ambiente solidario. Gran organización para la escala del evento.", raterId: ana.id,    creatorId: mario.id, eventId: ep8.id },
    { score: 5, comment: "Perfecto para iniciarse en el running. Sin presión y muy bien señalizado.", raterId: david.id,  creatorId: mario.id, eventId: ep8.id },
    { score: 4, comment: "Una buena causa y una buena carrera. Volvería el año que viene.", raterId: javier.id, creatorId: mario.id, eventId: ep8.id },
    { score: 5, comment: "Fue mi primera carrera popular y no pudo ir mejor. ¡Muchísimas gracias!", raterId: marta.id,  creatorId: mario.id, eventId: ep8.id },
  ]});
  console.log("⭐ Valoraciones creadas: 34");

  console.log("\n✨ Seed completado.");
  console.log("   Contraseña de todos los usuarios: Test1234!");
  console.log("   admin@test.com   → ADMIN");
  console.log("   ana@test.com     → USER (organizadora)");
  console.log("   carlos@test.com  → USER (organizador tech)");
  console.log("   lucia@test.com   → USER (gastronomía)");
  console.log("   mario@test.com   → USER (deporte)");
  console.log("   sofia@test.com   → USER");
  console.log("   elena@test.com   → USER");
  console.log("   pablo@test.com   → USER");
  console.log("   laura@test.com   → USER");
  console.log("   david@test.com   → USER");
  console.log("   marta@test.com   → USER");
  console.log("   javier@test.com  → USER");
}

main()
  .catch((e) => { console.error("❌ Error en el seed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
