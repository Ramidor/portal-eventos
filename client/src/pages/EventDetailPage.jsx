import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Navbar from "../components/Navbar";
import EventWall from "../components/EventWall";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CATEGORY_LABELS = {
  MUSICA: "🎵 Música", DEPORTE: "⚽ Deporte", ARTE: "🎨 Arte",
  TECNOLOGIA: "💻 Tecnología", GASTRONOMIA: "🍽️ Gastronomía",
  EDUCACION: "📚 Educación", NEGOCIOS: "💼 Negocios", OTRO: "📌 Otro",
};

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [enrollments, setEnrollments]   = useState([]);
  const [isEnrolled, setIsEnrolled]     = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError]   = useState("");

  const isCreator = user && event && user.id === event.creatorId;

  useEffect(() => {
    Promise.all([
      api.get(`/events/${id}`),
      api.get(`/events/${id}/enrollments`),
    ])
      .then(([eventRes, enrollRes]) => {
        setEvent(eventRes.data);
        setEnrollments(enrollRes.data.enrollments);
        if (user) setIsEnrolled(enrollRes.data.enrollments.some((e) => e.userId === user.id));
      })
      .catch(() => setError("Error al cargar el evento"))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) return navigate("/login");
    setEnrollLoading(true); setEnrollError("");
    try {
      await api.post(`/events/${id}/enroll`);
      const { data } = await api.get(`/events/${id}/enrollments`);
      setEnrollments(data.enrollments); setIsEnrolled(true);
    } catch (err) {
      setEnrollError(err.response?.data?.error || "Error al inscribirse");
    } finally { setEnrollLoading(false); }
  };

  const handleUnenroll = async () => {
    setEnrollLoading(true); setEnrollError("");
    try {
      await api.delete(`/events/${id}/enroll`);
      const { data } = await api.get(`/events/${id}/enrollments`);
      setEnrollments(data.enrollments); setIsEnrolled(false);
    } catch (err) {
      setEnrollError(err.response?.data?.error || "Error al cancelar inscripción");
    } finally { setEnrollLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que quieres eliminar este evento?")) return;
    try {
      await api.delete(`/events/${id}`);
      navigate("/events");
    } catch { setError("Error al eliminar el evento"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-950"><Navbar />
      <div className="flex items-center justify-center h-64">
        <span className="text-stone-500 font-mono text-sm animate-pulse">Cargando...</span>
      </div>
    </div>
  );

  if (error || !event) return (
    <div className="min-h-screen bg-stone-950"><Navbar />
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-red-400 font-mono text-sm">{error || "Evento no encontrado"}</p>
      </div>
    </div>
  );

  const date = new Date(event.date);
  const formattedDate = date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formattedTime = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Cabecera */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-stone-500 font-mono text-xs tracking-widest uppercase capitalize">{formattedDate}</p>
            <span className="text-xs font-mono bg-stone-800 text-stone-400 px-2 py-1 rounded-full">
              {CATEGORY_LABELS[event.category] || "📌 Otro"}
            </span>
          </div>
          <h1 className="text-4xl font-serif text-stone-100 mb-4">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-stone-400 text-sm">
            <span className="font-mono">🕐 {formattedTime}</span>
            <span className="font-mono">📍 {event.location}</span>
            <span>Organizado por <span className="text-stone-200">{event.creator?.name}</span></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">

            {/* Imagen */}
            {event.image && (
              <img src={event.image} alt={event.title}
                className="w-full h-56 object-cover rounded-xl border border-stone-800"
              />
            )}

            {/* Descripción */}
            {event.description && (
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
                <h2 className="text-stone-400 font-mono text-xs tracking-widest uppercase mb-4">Descripción</h2>
                <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            )}

            {/* Mapa */}
            {event.latitude && event.longitude && (
              <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-stone-800">
                  <h2 className="text-stone-400 font-mono text-xs tracking-widest uppercase">Ubicación</h2>
                </div>
                <div className="h-64">
                  <MapContainer center={[event.latitude, event.longitude]} zoom={15} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                    />
                    <Marker position={[event.latitude, event.longitude]}>
                      <Popup>{event.title}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}

            {/* Inscritos */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
              <h2 className="text-stone-400 font-mono text-xs tracking-widest uppercase mb-4">
                Inscritos ({enrollments.length})
              </h2>
              {enrollments.length === 0 ? (
                <p className="text-stone-600 text-sm">Sé el primero en inscribirte.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {enrollments.map((e) => (
                    <span key={e.userId} className="bg-stone-800 text-stone-300 text-xs font-mono px-3 py-1 rounded-full">
                      {e.user.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Muro */}
            <EventWall eventId={Number(id)} />
          </div>

          {/* Columna lateral */}
          <div className="space-y-4">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
              {!isCreator && (
                <>
                  {isEnrolled ? (
                    <button onClick={handleUnenroll} disabled={enrollLoading}
                      className="w-full border border-stone-700 hover:border-red-500 text-stone-400 hover:text-red-400 font-semibold py-3 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50">
                      {enrollLoading ? "..." : "Cancelar inscripción"}
                    </button>
                  ) : (
                    <button onClick={handleEnroll} disabled={enrollLoading}
                      className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-semibold py-3 rounded-lg text-sm transition-colors cursor-pointer">
                      {enrollLoading ? "..." : "Inscribirse"}
                    </button>
                  )}
                  {enrollError && <p className="text-red-400 text-xs font-mono">{enrollError}</p>}
                </>
              )}
              {isCreator && (
                <>
                  <p className="text-amber-400 font-mono text-xs text-center tracking-widest uppercase">Tu evento</p>
                  <Link to={`/events/${id}/edit`}
                    className="block w-full text-center border border-stone-700 hover:border-amber-400 text-stone-400 hover:text-amber-400 font-semibold py-3 rounded-lg text-sm transition-colors">
                    Editar
                  </Link>
                  <button onClick={handleDelete}
                    className="w-full border border-stone-700 hover:border-red-500 text-stone-400 hover:text-red-400 font-semibold py-3 rounded-lg text-sm transition-colors cursor-pointer">
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}