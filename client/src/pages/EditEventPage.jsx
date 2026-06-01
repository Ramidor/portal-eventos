import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import EventForm from "../components/EventForm";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function EditEventPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => {
        if (data.creatorId !== user?.id) { navigate(`/events/${id}`, { replace: true }); return; }
        setEvent(data);
      })
      .catch(() => setFetchError("Error al cargar el evento"));
  }, [id, user, navigate]);

  const handleSubmit = async (form) => {
    setLoading(true); setSubmitError("");
    try {
      await api.put(`/events/${id}`, form);
      navigate(`/events/${id}`);
    } catch (err) {
      setSubmitError(err.response?.data?.error || "Error al actualizar el evento");
    } finally { setLoading(false); }
  };

  if (fetchError) return (
    <PageLayout maxWidth="max-w-2xl">
      <p className="text-red-400 font-mono text-sm text-center py-20">{fetchError}</p>
    </PageLayout>
  );

  if (!event) return (
    <PageLayout maxWidth="max-w-2xl">
      <div className="flex items-center justify-center h-64">
        <span className="text-zinc-500 font-mono text-sm animate-pulse">Cargando...</span>
      </div>
    </PageLayout>
  );

  return (
    <PageLayout maxWidth="max-w-2xl">
      <div className="mb-10">
        <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-2">Editar evento</p>
        <h1 className="text-4xl font-serif text-zinc-100 line-clamp-2">{event.title}</h1>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
        <EventForm initialData={event} onSubmit={handleSubmit} loading={loading} error={submitError} submitLabel="Guardar cambios" />
      </div>
    </PageLayout>
  );
}
