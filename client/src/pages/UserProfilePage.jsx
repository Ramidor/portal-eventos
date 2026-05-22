import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { CATEGORY_LABELS } from "../constants/categories";

export default function UserProfilePage() {
  const { id } = useParams();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    api.get(`/users/${id}/public`)
      .then(({ data }) => setData(data))
      .catch(() => setError("Usuario no encontrado"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <span className="text-stone-500 font-mono text-sm animate-pulse">Cargando...</span>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-red-400 font-mono text-sm">{error || "Usuario no encontrado"}</p>
      </div>
    </div>
  );

  const { user, events, ratingSummary, ratings } = data;
  const pastEvents   = events.filter((e) => new Date(e.date) < new Date());
  const futureEvents = events.filter((e) => new Date(e.date) >= new Date());

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Cabecera */}
        <div className="mb-10">
          <p className="text-stone-500 font-mono text-xs tracking-widest uppercase mb-2">Organizador</p>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-serif text-stone-100">{user.name}</h1>
            {ratingSummary.average !== null && (
              <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2">
                <span className="text-amber-400 text-lg">★</span>
                <span className="text-stone-100 font-mono font-semibold">{ratingSummary.average}</span>
                <span className="text-stone-500 text-sm">({ratingSummary.total} valoraciones)</span>
              </div>
            )}
          </div>
          <p className="text-stone-500 text-sm mt-2">
            {events.length} evento{events.length !== 1 ? "s" : ""} organizado{events.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Eventos */}
          <div className="lg:col-span-2 space-y-6">

            {futureEvents.length > 0 && (
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                <h2 className="text-stone-400 font-mono text-xs tracking-widest uppercase mb-4">
                  Próximos eventos ({futureEvents.length})
                </h2>
                <div className="space-y-3">
                  {futureEvents.map((e) => <EventRow key={e.id} event={e} />)}
                </div>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                <h2 className="text-stone-400 font-mono text-xs tracking-widest uppercase mb-4">
                  Eventos pasados ({pastEvents.length})
                </h2>
                <div className="space-y-3">
                  {pastEvents.map((e) => <EventRow key={e.id} event={e} />)}
                </div>
              </div>
            )}

            {events.length === 0 && (
              <p className="text-stone-600 font-mono text-sm">Todavía no ha organizado ningún evento.</p>
            )}
          </div>

          {/* Valoraciones */}
          <div className="space-y-4">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
              <h2 className="text-stone-400 font-mono text-xs tracking-widest uppercase mb-4">Valoraciones</h2>

              {ratings.length === 0 ? (
                <p className="text-stone-600 text-sm">Sin valoraciones todavía.</p>
              ) : (
                <div className="space-y-4">
                  {ratings.map((r) => (
                    <div key={r.id} className="border-t border-stone-800 pt-4 first:border-0 first:pt-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-stone-300 text-sm font-medium">{r.rater.name}</span>
                        <span className="text-amber-400 font-mono text-sm">{"★".repeat(r.score)}{"☆".repeat(5 - r.score)}</span>
                      </div>
                      {r.comment && (
                        <p className="text-stone-500 text-sm leading-relaxed">{r.comment}</p>
                      )}
                      <Link
                        to={`/events/${r.event.id}`}
                        className="text-stone-600 hover:text-amber-400 font-mono text-xs mt-1 block transition-colors"
                      >
                        {r.event.title}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function EventRow({ event }) {
  const date = new Date(event.date);
  const formatted = date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  const isPast = date < new Date();
  return (
    <Link
      to={`/events/${event.id}`}
      className="flex items-center justify-between py-3 border-b border-stone-800 last:border-0 hover:bg-stone-800/30 -mx-2 px-2 rounded transition-colors"
    >
      <div>
        <p className={`text-sm font-medium ${isPast ? "text-stone-500" : "text-stone-200"}`}>{event.title}</p>
        <p className="text-stone-500 text-xs font-mono mt-0.5">
          {CATEGORY_LABELS[event.category] || "📌 Otro"} · {formatted}
        </p>
      </div>
      <span className="text-stone-600 text-xs font-mono ml-4 shrink-0">
        {event._count.enrollments} inscritos
      </span>
    </Link>
  );
}
