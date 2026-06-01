import { Link } from "react-router-dom";
import { Tag } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "../constants/categories";

export default function EventCard({ event, distance }) {
  const date  = new Date(event.date);
  const day   = date.toLocaleDateString("es-ES", { day: "2-digit" });
  const month = date.toLocaleDateString("es-ES", { month: "short" }).toUpperCase();
  const year  = date.getFullYear();
  const time  = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const cover    = event.images?.[0];
  const catLabel = CATEGORY_LABELS[event.category] || "Otro";
  const CatIcon  = CATEGORY_ICONS[event.category]  || Tag;

  return (
    <Link to={`/events/${event.id}`} className="group block h-full">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-orange-400/50 transition-colors duration-200 flex flex-col h-full">

        {/* Zona de imagen — altura fija para que todas las cards sean iguales */}
        <div className="h-36 bg-zinc-800 overflow-hidden shrink-0 relative">
          {cover ? (
            <>
              <img src={cover} aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg opacity-60" />
              <img src={cover} alt={event.title}
                className="relative w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CatIcon size={48} className="text-zinc-700" />
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-1">
          {/* Cabecera: fecha + título */}
          <div className="flex items-start gap-4 mb-4">
            <div className="text-center bg-zinc-800 rounded-lg px-3 py-2 min-w-[56px] shrink-0">
              <p className="text-orange-400 font-mono text-xs">{month}</p>
              <p className="text-zinc-100 font-serif text-2xl leading-none">{day}</p>
              <p className="text-zinc-500 font-mono text-xs">{year}</p>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-zinc-100 font-semibold text-base leading-tight mb-1 group-hover:text-orange-400 transition-colors line-clamp-2">
                {event.title}
              </h3>
              <p className="text-zinc-500 text-xs font-mono">{time} · {event.location}</p>
            </div>
          </div>

          {/* Categoría */}
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full">
              <CatIcon size={11} />
              {catLabel}
            </span>
          </div>

          {event.description && (
            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-4">
              {event.description}
            </p>
          )}

          {/* Footer — empujado al fondo */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800 mt-auto">
            <span className="text-zinc-600 text-xs">
              Por <span className="text-zinc-400">{event.creator?.name}</span>
            </span>
            <div className="flex items-center gap-3">
              {distance !== null && distance !== Infinity && (
                <span className="text-orange-400/70 text-xs font-mono">
                  {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                </span>
              )}
              <span className="text-zinc-600 text-xs font-mono">
                {event._count?.enrollments ?? 0} inscritos
              </span>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
