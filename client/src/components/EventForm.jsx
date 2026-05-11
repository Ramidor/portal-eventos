import { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix icono por defecto de Leaflet con Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CATEGORIES = [
  { value: "MUSICA",      label: "🎵 Música" },
  { value: "DEPORTE",     label: "⚽ Deporte" },
  { value: "ARTE",        label: "🎨 Arte" },
  { value: "TECNOLOGIA",  label: "💻 Tecnología" },
  { value: "GASTRONOMIA", label: "🍽️ Gastronomía" },
  { value: "EDUCACION",   label: "📚 Educación" },
  { value: "NEGOCIOS",    label: "💼 Negocios" },
  { value: "OTRO",        label: "📌 Otro" },
];

function toDatetimeLocal(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Componente interno que captura clicks en el mapa
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function EventForm({ initialData = {}, onSubmit, loading, error, submitLabel = "Guardar" }) {
  const [form, setForm] = useState({
    title:       initialData.title       || "",
    description: initialData.description || "",
    date:        toDatetimeLocal(initialData.date),
    location:    initialData.location    || "",
    latitude:    initialData.latitude    || null,
    longitude:   initialData.longitude   || null,
    image:       initialData.image       || "",
    category:    initialData.category    || "OTRO",
  });

  const [searchQuery, setSearchQuery]   = useState(initialData.location || "");
  const [searching, setSearching]       = useState(false);
  const [searchError, setSearchError]   = useState("");
  const [mapCenter, setMapCenter]       = useState(
    initialData.latitude && initialData.longitude
      ? [initialData.latitude, initialData.longitude]
      : [40.416775, -3.703790] // Madrid por defecto
  );
  const mapRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Geocodificación con Nominatim (OpenStreetMap, gratuito)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "Accept-Language": "es" } }
      );
      const data = await res.json();
      if (data.length === 0) {
        setSearchError("No se encontró esa ubicación");
        return;
      }
      const { lat, lon, display_name } = data[0];
      const newLat = parseFloat(lat);
      const newLng = parseFloat(lon);
      setForm((prev) => ({
        ...prev,
        location: display_name,
        latitude: newLat,
        longitude: newLng,
      }));
      setMapCenter([newLat, newLng]);
      mapRef.current?.flyTo([newLat, newLng], 14);
    } catch {
      setSearchError("Error al buscar la ubicación");
    } finally {
      setSearching(false);
    }
  };

  const handleMapClick = (lat, lng) => {
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    // Geocodificación inversa para obtener el nombre
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.display_name) {
          setForm((prev) => ({ ...prev, location: data.display_name }));
          setSearchQuery(data.display_name);
        }
      })
      .catch(() => {});
  };

  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() + 30);
  const minDateStr = toDatetimeLocal(minDate.toISOString());

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Título */}
      <div>
        <label className="block text-stone-400 text-xs font-mono tracking-widest uppercase mb-2">
          Título <span className="text-amber-400">*</span>
        </label>
        <input
          type="text" name="title" value={form.title} onChange={handleChange} required
          placeholder="Nombre del evento"
          className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
        />
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-stone-400 text-xs font-mono tracking-widest uppercase mb-2">
          Categoría <span className="text-amber-400">*</span>
        </label>
        <select
          name="category" value={form.category} onChange={handleChange}
          className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-stone-400 text-xs font-mono tracking-widest uppercase mb-2">
          Descripción
        </label>
        <textarea
          name="description" value={form.description} onChange={handleChange} rows={4}
          placeholder="Describe el evento..."
          className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors resize-none"
        />
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-stone-400 text-xs font-mono tracking-widest uppercase mb-2">
          Fecha y hora <span className="text-amber-400">*</span>
        </label>
        <input
          type="datetime-local" name="date" value={form.date} onChange={handleChange}
          required min={minDateStr}
          className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition-colors [color-scheme:dark]"
        />
      </div>

      {/* Ubicación con mapa */}
      <div>
        <label className="block text-stone-400 text-xs font-mono tracking-widest uppercase mb-2">
          Ubicación <span className="text-amber-400">*</span>
        </label>

        {/* Buscador de dirección */}
        <div className="flex gap-2 mb-3">
          <input
            type="text" value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
            placeholder="Busca una dirección o lugar..."
            className="flex-1 bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
          />
          <button
            type="button" onClick={handleSearch} disabled={searching}
            className="bg-stone-700 hover:bg-stone-600 text-stone-100 px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {searching ? "..." : "Buscar"}
          </button>
        </div>

        {searchError && (
          <p className="text-red-400 text-xs font-mono mb-2">{searchError}</p>
        )}

        {/* Campo de texto editable con el nombre del lugar */}
        {form.location && (
          <input
            type="text" name="location" value={form.location} onChange={handleChange} required
            placeholder="Nombre del lugar"
            className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors mb-3"
          />
        )}
        {!form.location && (
          <input type="text" name="location" value={form.location} onChange={handleChange}
            required placeholder="Nombre del lugar (busca arriba o haz clic en el mapa)"
            className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors mb-3"
          />
        )}

        {/* Mapa */}
        <div className="rounded-xl overflow-hidden border border-stone-700 h-64">
          <MapContainer
            center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            />
            <MapClickHandler onLocationSelect={handleMapClick} />
            {form.latitude && form.longitude && (
              <Marker position={[form.latitude, form.longitude]} />
            )}
          </MapContainer>
        </div>
        <p className="text-stone-600 text-xs font-mono mt-1">
          Haz clic en el mapa para ajustar la ubicación exacta
        </p>
      </div>

      {/* Imagen */}
      <div>
        <label className="block text-stone-400 text-xs font-mono tracking-widest uppercase mb-2">
          Imagen <span className="text-stone-600 normal-case font-sans tracking-normal">— URL opcional</span>
        </label>
        <input
          type="url" name="image" value={form.image} onChange={handleChange}
          placeholder="https://..."
          className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
        />
        {form.image && (
          <img src={form.image} alt="Preview"
            className="mt-3 w-full h-40 object-cover rounded-lg border border-stone-700"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
      </div>

      {error && (
        <p className="text-red-400 text-xs font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit" disabled={loading}
        className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-semibold py-3 rounded-lg text-sm transition-colors duration-200 cursor-pointer"
      >
        {loading ? "Guardando..." : submitLabel}
      </button>

    </form>
  );
}