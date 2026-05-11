import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import EventForm from "../components/EventForm";
import api from "../services/api";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (form) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/events", form);
      navigate(`/events/${data.event.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el evento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-stone-500 font-mono text-xs tracking-widest uppercase mb-2">
            Nuevo evento
          </p>
          <h1 className="text-4xl font-serif text-stone-100">
            Crea tu evento
          </h1>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-8">
          <EventForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            submitLabel="Crear evento"
          />
        </div>
      </main>
    </div>
  );
}