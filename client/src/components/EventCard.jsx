import { Link } from "react-router-dom";

const CATEGORY_LABELS = {
  MUSICA: "🎵 Música", DEPORTE: "⚽ Deporte", ARTE: "🎨 Arte",
  TECNOLOGIA: "💻 Tecnología", GASTRONOMIA: "🍽️ Gastronomía",
  EDUCACION: "📚 Educación", NEGOCIOS: "💼 Negocios", OTRO: "📌 Otro",
};

export default function EventCard({ event, distance }) {
  const date = new Date(event.date);
  const day   = date.toLocaleDateString("es-ES", { day: "2-digit" });
  const month = date.toLocaleDateString("es-ES", { month: "short" }).toUpperCase();
  const year  = date.getFullYear();
  const time  = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  return (
    <Link to={`/events/${event.id}`} className="group block">
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 hover:border-amber-400/50 transition-colors duration-200">

        {/* Cabecera: fecha + categoría */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-start gap-4">
            <div className="text-center bg-stone-800 rounded-lg px-3 py-2 min-w-[56px]">
              <p className="text-amber-400 font-mono text-xs">{month}</p>
              <p className="text-stone-100 font-serif text-2xl leading-none">{day}</p>
              <p className="text-stone-500 font-mono text-xs">{year}</p>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-stone-100 font-semibold text-base leading-tight mb-1 group-hover:text-amber-400 transition-colors line-clamp-2">
                {event.title}
              </h3>
              <p className="text-stone-500 text-xs font-mono">{time} · {event.location}</p>
            </div>
          </div>
        </div>

        {/* Categoría */}
        <div className="mb-3">
          <span className="text-xs font-mono bg-stone-800 text-stone-400 px-2 py-1 rounded-full">
            {CATEGORY_LABELS[event.category] || "📌 Otro"}
          </span>
        </div>

        {event.description && (
          <p className="text-stone-400 text-sm leading-relaxed line-clamp-2 mb-4">
            {event.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-stone-800">
          <span className="text-stone-600 text-xs">
            Por <span className="text-stone-400">{event.creator?.name}</span>
          </span>
          <div className="flex items-center gap-3">
            {distance !== null && distance !== Infinity && (
              <span className="text-amber-400/70 text-xs font-mono">
                {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
              </span>
            )}
            <span className="text-stone-600 text-xs font-mono">
              {event._count?.enrollments ?? 0} inscritos
            </span>
          </div>
        </div>

      </div>
    </Link>
  );
}