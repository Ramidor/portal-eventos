/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import api from "../services/api";

import { CATEGORIES as BASE_CATEGORIES } from "../constants/categories";

const CATEGORIES = [{ value: "", label: "Todas las categorías" }, ...BASE_CATEGORIES];

function getDistance(userCoords, event) {
  if (!userCoords || !event.latitude || !event.longitude) return Infinity;
  const R = 6371;
  const dLat = ((event.latitude  - userCoords.lat) * Math.PI) / 180;
  const dLng = ((event.longitude - userCoords.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((userCoords.lat * Math.PI) / 180) *
    Math.cos((event.latitude  * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function EventsPage() {
  const [events, setEvents]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [category, setCategory]         = useState("");
  const [location, setLocation]         = useState("");
  const [userCoords, setUserCoords]     = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (location) params.append("location", location);

    setLoading(true);
    setError("");

    api.get(`/events?${params.toString()}`)
      .then(({ data }) => { if (!cancelled) setEvents(data.events); })
      .catch(() => { if (!cancelled) setError("Error al cargar los eventos"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [category, location]);

  const handleLocationFilter = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortByDistance(true);
      },
      () => alert("No se pudo obtener tu ubicación")
    );
  };

  let filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  if (sortByDistance && userCoords) {
    filtered = [...filtered].sort(
      (a, b) => getDistance(userCoords, a) - getDistance(userCoords, b)
    );
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-stone-500 font-mono text-xs tracking-widest uppercase mb-2">
            Próximos eventos
          </p>
          <h1 className="text-4xl font-serif text-stone-100">Descubre qué está pasando</h1>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="flex-1 min-w-[200px] bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
          />
          <select
            value={category} onChange={(e) => setCategory(e.target.value)}
            className="bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input
            type="text" value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="Filtrar por ciudad..."
            className="bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors w-48"
          />
          <button
            onClick={handleLocationFilter}
            className={`px-4 py-3 rounded-lg text-sm font-mono transition-colors cursor-pointer border ${
              sortByDistance
                ? "bg-amber-400 text-stone-950 border-amber-400"
                : "bg-stone-900 border-stone-700 text-stone-400 hover:border-amber-400 hover:text-amber-400"
            }`}
          >
            📍 Cerca de mí
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-stone-500 font-mono text-sm">
            <span className="animate-pulse">●</span> Cargando eventos...
          </div>
        )}
        {error && (
          <p className="text-red-400 text-sm font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-600 font-mono text-sm">No hay eventos que coincidan con los filtros.</p>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((event) => (
              <EventCard
                key={event.id} event={event}
                distance={sortByDistance ? getDistance(userCoords, event) : null}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}