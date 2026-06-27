import { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORIES } from "../constants/categories";
import "../utils/leafletFix";
import api from "../services/api";

const MAX_IMAGES = 5;

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

export default function EventForm({
  initialData = {},
  onSubmit,
  loading,
  error,
  submitLabel = "Guardar",
}) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    date: toDatetimeLocal(initialData.date),
    location: initialData.location || "",
    latitude: initialData.latitude || null,
    longitude: initialData.longitude || null,
    category: initialData.category || "OTRO",
    maxAttendees: initialData.maxAttendees || "",
  });

  const [images, setImages] = useState(initialData.images || []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [searchQuery, setSearchQuery] = useState(initialData.location || "");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [mapCenter, setMapCenter] = useState(
    initialData.latitude && initialData.longitude
      ? [initialData.latitude, initialData.longitude]
      : [40.416775, -3.70379], // Madrid por defecto
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
        { headers: { "Accept-Language": "es" } },
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
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.display_name) {
          setForm((prev) => ({ ...prev, location: data.display_name }));
          setSearchQuery(data.display_name);
        }
      })
      .catch(() => {});
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = MAX_IMAGES - images.length;
    if (files.length > remaining) {
      setUploadError(
        `Solo puedes añadir ${remaining} imagen${remaining !== 1 ? "es" : ""} más (máx. ${MAX_IMAGES})`,
      );
      e.target.value = "";
      return;
    }
    const tooBig = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (tooBig.length) {
      setUploadError(
        `${tooBig.map((f) => f.name).join(", ")} supera${tooBig.length > 1 ? "n" : ""} los 5 MB permitidos`,
      );
      e.target.value = "";
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      const { data } = await api.post("/upload", formData);
      setImages((prev) => [...prev, ...data.urls]);
    } catch {
      setUploadError(
        "Error al subir las imágenes. Comprueba el formato y el tamaño (máx. 5 MB).",
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const minDateStr = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  })();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      images,
      maxAttendees: form.maxAttendees !== "" ? Number(form.maxAttendees) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-zinc-400 text-xs font-mono tracking-widest uppercase mb-2">
          Título <span className="text-orange-400">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          placeholder="Nombre del evento"
          className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-400 transition-colors"
        />
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-zinc-400 text-xs font-mono tracking-widest uppercase mb-2">
          Categoría <span className="text-orange-400">*</span>
        </label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-zinc-400 text-xs font-mono tracking-widest uppercase mb-2">
          Descripción
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="Describe el evento..."
          className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-400 transition-colors resize-none"
        />
      </div>

      {/* Fecha */}
      <div>
        <label className="block text-zinc-400 text-xs font-mono tracking-widest uppercase mb-2">
          Fecha y hora <span className="text-orange-400">*</span>
        </label>
        <input
          type="datetime-local"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          min={minDateStr}
          className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors [color-scheme:dark]"
        />
      </div>

      {/* Ubicación con mapa */}
      <div>
        <label className="block text-zinc-400 text-xs font-mono tracking-widest uppercase mb-2">
          Ubicación <span className="text-orange-400">*</span>
        </label>

        {/* Buscador de dirección */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleSearch())
            }
            placeholder="Busca una dirección o lugar..."
            className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-400 transition-colors"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {searching ? "..." : "Buscar"}
          </button>
        </div>

        {searchError && (
          <p className="text-red-400 text-xs font-mono mb-2">{searchError}</p>
        )}

        {/* Campo de texto editable con el nombre del lugar */}
        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleChange}
          required
          placeholder={
            form.location
              ? "Nombre del lugar"
              : "Nombre del lugar (busca arriba o haz clic en el mapa)"
          }
          className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-400 transition-colors mb-3"
        />

        {/* Mapa */}
        <div className="rounded-xl overflow-hidden border border-zinc-700 h-64">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
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
        <p className="text-zinc-600 text-xs font-mono mt-1">
          Haz clic en el mapa para ajustar la ubicación exacta
        </p>
      </div>

      {/* Imágenes */}
      <div>
        <label className="block text-zinc-400 text-xs font-mono tracking-widest uppercase mb-2">
          Imágenes
          <span className="text-zinc-600 normal-case font-sans tracking-normal ml-1">
            — {images.length}/{MAX_IMAGES} · máx. 5 MB por imagen
          </span>
        </label>

        {/* Grid de previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {images.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  alt=""
                  className="w-full h-24 object-cover rounded-lg border border-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-zinc-950/80 text-zinc-400 hover:text-red-400 rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  ✕
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-orange-400/90 text-zinc-950 text-[10px] font-mono px-1.5 py-0.5 rounded">
                    portada
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botón añadir */}
        {images.length < MAX_IMAGES && (
          <label
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-zinc-700 text-zinc-400 hover:border-orange-400 hover:text-orange-400 transition-colors text-sm ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {uploading
              ? "Subiendo..."
              : images.length === 0
                ? "Seleccionar imágenes"
                : `Añadir más (${images.length}/${MAX_IMAGES})`}
          </label>
        )}

        {uploadError && (
          <p className="text-red-400 text-xs font-mono mt-2">{uploadError}</p>
        )}
      </div>

      {/* Aforo máximo */}
      <div>
        <label className="block text-zinc-400 text-xs font-mono tracking-widest uppercase mb-2">
          Aforo máximo{" "}
          <span className="text-zinc-600 normal-case font-sans tracking-normal">
            — opcional
          </span>
        </label>
        <input
          type="number"
          name="maxAttendees"
          value={form.maxAttendees}
          onChange={handleChange}
          min="1"
          placeholder="Sin límite"
          className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-400 transition-colors"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-400 hover:bg-orange-300 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-semibold py-3 rounded-lg text-sm transition-colors duration-200 cursor-pointer"
      >
        {loading ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
