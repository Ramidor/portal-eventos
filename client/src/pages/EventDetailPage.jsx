import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../utils/leafletFix";
import Navbar from "../components/Navbar";
import EventWall from "../components/EventWall";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "../constants/categories";
import { Tag, Clock, MapPin } from "lucide-react";

function ImageCarousel({ images, title }) {
  const [idx, setIdx] = useState(0);
  const prev = useCallback(
    () => setIdx((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setIdx((i) => (i + 1) % images.length),
    [images.length],
  );
  if (!images?.length) return null;
  return (
    <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
      <img
        src={images[idx]}
        aria-hidden="true"
        className="absolute inset-0 w-full h-64 object-cover scale-110 blur-lg opacity-50"
      />
      <img
        src={images[idx]}
        alt={`${title} ${idx + 1}`}
        className="relative w-full h-64 object-contain"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -tranzinc-y-1/2 bg-zinc-950/70 hover:bg-zinc-950/90 text-zinc-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -tranzinc-y-1/2 bg-zinc-950/70 hover:bg-zinc-950/90 text-zinc-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -tranzinc-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${i === idx ? "bg-orange-400" : "bg-zinc-500 hover:bg-zinc-300"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-2xl transition-colors ${readonly ? "cursor-default" : "cursor-pointer"} ${
            star <= (hovered || value) ? "text-orange-400" : "text-zinc-700"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  // Valoraciones
  const [ratings, setRatings] = useState([]);
  const [ratingsAvg, setRatingsAvg] = useState(null);
  const [myRating, setMyRating] = useState(null);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState("");

  const isCreator = user && event && user.id === event.creatorId;
  const isPast = event && new Date(event.date) < new Date();
  const canRate = isPast && isEnrolled && !isCreator;

  // Carga el evento y el estado de inscripción del usuario actual
  useEffect(() => {
    const fetchEvent = api.get(`/events/${id}`);
    const fetchEnrolled = user
      ? api.get(`/events/${id}/enrollments/me`)
      : Promise.resolve({ data: { isEnrolled: false } });

    Promise.allSettled([fetchEvent, fetchEnrolled])
      .then(([eventRes, meRes]) => {
        if (eventRes.status === "rejected") {
          setError("Error al cargar el evento");
          return;
        }
        setEvent(eventRes.value.data);
        setIsEnrolled(
          meRes.status === "fulfilled" ? meRes.value.data.isEnrolled : false,
        );
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  // Lista completa de inscritos: solo visible para el creador
  useEffect(() => {
    if (!event || !user || event.creatorId !== user.id) return;
    api
      .get(`/events/${id}/enrollments`)
      .then(({ data }) => setEnrollments(data.enrollments))
      .catch(() => {});
  }, [event, user, id]);

  const handleEnroll = async () => {
    if (!user) return navigate("/login");
    setEnrollLoading(true);
    setEnrollError("");
    try {
      await api.post(`/events/${id}/enroll`);
      setIsEnrolled(true);
      setEvent((prev) => ({
        ...prev,
        _count: { ...prev._count, enrollments: prev._count.enrollments + 1 },
      }));
    } catch (err) {
      setEnrollError(err.response?.data?.error || "Error al inscribirse");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!confirm("¿Cancelar tu inscripción en este evento?")) return;
    setEnrollLoading(true);
    setEnrollError("");
    try {
      await api.delete(`/events/${id}/enroll`);
      setIsEnrolled(false);
      setEvent((prev) => ({
        ...prev,
        _count: { ...prev._count, enrollments: prev._count.enrollments - 1 },
      }));
    } catch (err) {
      setEnrollError(
        err.response?.data?.error || "Error al cancelar inscripción",
      );
    } finally {
      setEnrollLoading(false);
    }
  };

  // Valoraciones: cargar lista + mi valoración cuando el evento ya ha pasado
  useEffect(() => {
    if (!event || !isPast) return;
    api
      .get(`/events/${id}/ratings`)
      .then(({ data }) => {
        setRatings(data.ratings);
        setRatingsAvg(data.average);
      })
      .catch(() => {});
    if (user && !isCreator) {
      api
        .get(`/events/${id}/ratings/me`)
        .then(({ data }) => {
          if (data.rating) {
            setMyRating(data.rating);
            setRatingScore(data.rating.score);
            setRatingComment(data.rating.comment || "");
          }
        })
        .catch(() => {});
    }
  }, [event, isPast, id, user, isCreator]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!ratingScore) return setRatingError("Selecciona una puntuación");
    setRatingLoading(true);
    setRatingError("");
    try {
      const { data } = await api.post(`/events/${id}/ratings`, {
        score: ratingScore,
        comment: ratingComment.trim() || null,
      });
      setMyRating(data.rating);
      // Refrescar lista y media
      api.get(`/events/${id}/ratings`).then(({ data: d }) => {
        setRatings(d.ratings);
        setRatingsAvg(d.average);
      });
    } catch (err) {
      setRatingError(
        err.response?.data?.error || "Error al guardar la valoración",
      );
    } finally {
      setRatingLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que quieres eliminar este evento?")) return;
    try {
      await api.delete(`/events/${id}`);
      navigate("/events");
    } catch {
      setError("Error al eliminar el evento");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <span className="text-zinc-500 font-mono text-sm animate-pulse">
            Cargando...
          </span>
        </div>
      </div>
    );

  if (error || !event)
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <p className="text-red-400 font-mono text-sm">
            {error || "Evento no encontrado"}
          </p>
        </div>
      </div>
    );

  const date = new Date(event.date);
  const formattedDate = date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const enrolledCount = event._count?.enrollments ?? 0;
  const spotsLeft =
    event.maxAttendees !== null ? event.maxAttendees - enrolledCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Cabecera */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase capitalize">
              {formattedDate}
            </p>
            {(() => {
              const CatIcon = CATEGORY_ICONS[event.category] || Tag;
              return (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full">
                  <CatIcon size={11} />
                  {CATEGORY_LABELS[event.category] || "Otro"}
                </span>
              );
            })()}
          </div>
          <h1 className="text-4xl font-serif text-zinc-100 mb-4">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-zinc-400 text-sm">
            <span className="inline-flex items-center gap-1.5 font-mono">
              <Clock size={14} />
              {formattedTime}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono">
              <MapPin size={14} />
              {event.location}
            </span>
            <span>
              Organizado por{" "}
              <Link
                to={`/users/${event.creator?.id}`}
                className="text-zinc-200 hover:text-orange-400 transition-colors"
              >
                {event.creator?.name}
              </Link>
              {event.creatorRating?.average !== null &&
                event.creatorRating?.average !== undefined && (
                  <span className="text-orange-400 font-mono text-xs ml-2">
                    ★ {event.creatorRating.average}
                    <span className="text-zinc-500 ml-1">
                      ({event.creatorRating.total})
                    </span>
                  </span>
                )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Imagen */}
            <ImageCarousel images={event.images} title={event.title} />

            {/* Descripción */}
            {event.description && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-zinc-400 font-mono text-xs tracking-widest uppercase mb-4">
                  Descripción
                </h2>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}

            {/* Mapa */}
            {event.latitude && event.longitude && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800">
                  <h2 className="text-zinc-400 font-mono text-xs tracking-widest uppercase">
                    Ubicación
                  </h2>
                </div>
                <div className="h-64">
                  <MapContainer
                    center={[event.latitude, event.longitude]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                  >
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
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-zinc-400 font-mono text-xs tracking-widest uppercase mb-4">
                Inscritos ({enrolledCount})
              </h2>
              {isCreator ? (
                enrollments.length === 0 ? (
                  <p className="text-zinc-600 text-sm">
                    Todavía nadie se ha inscrito.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {enrollments.map((e) => (
                      <span
                        key={e.userId}
                        className="bg-zinc-800 text-zinc-300 text-xs font-mono px-3 py-1 rounded-full"
                      >
                        {e.user.name}
                      </span>
                    ))}
                  </div>
                )
              ) : (
                <p className="text-zinc-600 text-sm">
                  {enrolledCount === 0
                    ? "Sé el primero en inscribirte."
                    : `${enrolledCount} persona${enrolledCount !== 1 ? "s" : ""} apuntada${enrolledCount !== 1 ? "s" : ""}.`}
                </p>
              )}
            </div>

            {/* Muro — se remonta al cambiar la inscripción para reconectar el WebSocket */}
            <EventWall key={String(isEnrolled)} eventId={Number(id)} />

            {/* Valoraciones — solo visibles cuando el evento ya ha terminado */}
            {isPast && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-zinc-400 font-mono text-xs tracking-widest uppercase">
                    Valoraciones
                  </h2>
                  {ratingsAvg !== null && (
                    <div className="flex items-center gap-2">
                      <StarRating value={Math.round(ratingsAvg)} readonly />
                      <span className="text-zinc-300 font-mono text-sm">
                        {ratingsAvg.toFixed(1)}
                      </span>
                      <span className="text-zinc-600 text-xs">
                        ({ratings.length})
                      </span>
                    </div>
                  )}
                </div>

                {/* Formulario de valoración: solo inscritos no-creadores */}
                {canRate && (
                  <form
                    onSubmit={handleRatingSubmit}
                    className="space-y-3 border-t border-zinc-800 pt-5"
                  >
                    <p className="text-zinc-400 text-xs font-mono tracking-widest uppercase">
                      {myRating ? "Tu valoración" : "Valora este evento"}
                    </p>
                    <StarRating value={ratingScore} onChange={setRatingScore} />
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Comentario opcional..."
                      maxLength={300}
                      rows={2}
                      className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-2 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-400 transition-colors resize-none"
                    />
                    {ratingError && (
                      <p className="text-red-400 text-xs font-mono">
                        {ratingError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={ratingLoading || !ratingScore}
                      className="bg-orange-400 hover:bg-orange-300 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-semibold px-5 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                    >
                      {ratingLoading
                        ? "Guardando..."
                        : myRating
                          ? "Actualizar"
                          : "Enviar valoración"}
                    </button>
                  </form>
                )}

                {/* Lista de valoraciones */}
                {ratings.length === 0 ? (
                  <p className="text-zinc-600 text-sm">
                    Todavía no hay valoraciones.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {ratings.map((r) => (
                      <div key={r.id} className="border-t border-zinc-800 pt-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-zinc-300 text-sm font-medium">
                            {r.rater.name}
                          </span>
                          <StarRating value={r.score} readonly />
                        </div>
                        {r.comment && (
                          <p className="text-zinc-500 text-sm leading-relaxed">
                            {r.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Columna lateral */}
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              {/* Aforo */}
              {event.maxAttendees !== null && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-zinc-500 font-mono text-xs">
                      Aforo
                    </span>
                    <span className="text-zinc-400 font-mono text-xs">
                      {enrolledCount} / {event.maxAttendees}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${isFull ? "bg-red-500" : "bg-orange-400"}`}
                      style={{
                        width: `${Math.min(100, (enrolledCount / event.maxAttendees) * 100)}%`,
                      }}
                    />
                  </div>
                  {!isFull && (
                    <p className="text-zinc-600 font-mono text-xs mt-1">
                      {spotsLeft} plazas libres
                    </p>
                  )}
                  {isFull && (
                    <p className="text-red-400 font-mono text-xs mt-1">
                      Aforo completo
                    </p>
                  )}
                </div>
              )}

              {!isCreator && !isPast && (
                <>
                  {isEnrolled ? (
                    <button
                      onClick={handleUnenroll}
                      disabled={enrollLoading}
                      className="w-full border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-400 font-semibold py-3 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {enrollLoading ? "..." : "Cancelar inscripción"}
                    </button>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrollLoading || isFull}
                      className="w-full bg-orange-400 hover:bg-orange-300 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-semibold py-3 rounded-lg text-sm transition-colors cursor-pointer"
                    >
                      {enrollLoading
                        ? "..."
                        : isFull
                          ? "Aforo completo"
                          : "Inscribirse"}
                    </button>
                  )}
                  {enrollError && (
                    <p className="text-red-400 text-xs font-mono">
                      {enrollError}
                    </p>
                  )}
                </>
              )}
              {(isCreator || isAdmin) && (
                <>
                  <p className="text-orange-400 font-mono text-xs text-center tracking-widest uppercase">
                    {isCreator ? "Tu evento" : "Administrador"}
                  </p>
                  <Link
                    to={`/events/${id}/edit`}
                    className="block w-full text-center border border-zinc-700 hover:border-orange-400 text-zinc-400 hover:text-orange-400 font-semibold py-3 rounded-lg text-sm transition-colors"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="w-full border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-400 font-semibold py-3 rounded-lg text-sm transition-colors cursor-pointer"
                  >
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
