/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import PageLayout from "../components/PageLayout";
import EventCard from "../components/EventCard";
import api from "../services/api";

import { MapPin } from "lucide-react";
import { CATEGORIES as BASE_CATEGORIES } from "../constants/categories";

const CATEGORIES = [
  { value: "", label: "Todas las categorías" },
  ...BASE_CATEGORIES,
];
const PAGE_SIZE = 20;

function getDistance(userCoords, event) {
  if (!userCoords || event.latitude == null || event.longitude == null)
    return Infinity;
  const R = 6371;
  const dLat = ((event.latitude - userCoords.lat) * Math.PI) / 180;
  const dLng = ((event.longitude - userCoords.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((userCoords.lat * Math.PI) / 180) *
      Math.cos((event.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [userCoords, setUserCoords] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);

  // Debounce de la búsqueda; resetea la página en el mismo batch
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (location) params.append("location", location);
    if (debouncedSearch) params.append("search", debouncedSearch);
    params.append("page", String(page));
    params.append("limit", String(PAGE_SIZE));

    setLoading(true);
    setError("");

    api
      .get(`/events?${params.toString()}`)
      .then(({ data }) => {
        if (cancelled) return;
        setEvents(data.events ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => {
        if (!cancelled) setError("Error al cargar los eventos");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, location, debouncedSearch, page]);

  const handleLocationFilter = () => {
    if (!navigator.geolocation) {
      setError("La geolocalización no está disponible en este navegador");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setError("");
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortByDistance(true);
      },
      () => setError("No se pudo obtener tu ubicación"),
    );
  };

  // El backend ya filtra por título/ubicación con ?search. El sort por distancia
  // se aplica sobre la página actual.
  const displayed =
    sortByDistance && userCoords
      ? [...events].sort(
          (a, b) => getDistance(userCoords, a) - getDistance(userCoords, b),
        )
      : events;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <PageLayout>
      <div className="mb-10">
        <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-2">
          Próximos eventos
        </p>
        <h1 className="text-4xl font-serif text-zinc-100">
          Descubre qué está pasando
        </h1>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          className="flex-1 min-w-[200px] bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-400 transition-colors"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setPage(1);
          }}
          placeholder="Filtrar por ciudad..."
          className="bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-400 transition-colors w-48"
        />
        <button
          onClick={handleLocationFilter}
          className={`px-4 py-3 rounded-lg text-sm font-mono transition-colors cursor-pointer border ${
            sortByDistance
              ? "bg-orange-400 text-zinc-950 border-orange-400"
              : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-orange-400 hover:text-orange-400"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} />
            Cerca de mí
          </span>
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-zinc-500 font-mono text-sm">
          <span className="animate-pulse">●</span> Cargando eventos...
        </div>
      )}
      {error && (
        <p className="text-red-400 text-sm font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      {!loading && !error && displayed.length === 0 && (
        <div className="text-center py-20">
          <p className="text-zinc-600 font-mono text-sm">
            No hay eventos que coincidan con los filtros.
          </p>
        </div>
      )}
      {!loading && !error && displayed.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {displayed.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                distance={
                  sortByDistance ? getDistance(userCoords, event) : null
                }
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="font-mono text-xs px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:border-orange-400 hover:text-orange-400 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              <span className="text-zinc-500 font-mono text-xs">
                Página {page} de {totalPages} · {total} eventos
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="font-mono text-xs px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:border-orange-400 hover:text-orange-400 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
