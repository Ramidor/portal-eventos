import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function EventRow({ event }) {
  const date = new Date(event.date);
  const formatted = date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  return (
    <Link to={`/events/${event.id}`}
      className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 -mx-2 px-2 rounded transition-colors">
      <div>
        <p className="text-zinc-200 text-sm font-medium">{event.title}</p>
        <p className="text-zinc-500 text-xs font-mono">{formatted} · {event.location}</p>
      </div>
      {event._count && (
        <span className="text-zinc-600 text-xs font-mono ml-4 shrink-0">{event._count.enrollments} inscritos</span>
      )}
    </Link>
  );
}

export default function ProfilePage() {
  const { user, login, token } = useAuth();
  const [myEvents, setMyEvents]         = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [editing, setEditing]           = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    currentPassword: "", newPassword: "",
  });
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [ratingSummary, setRatingSummary] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      api.get("/users/me/events"),
      api.get("/users/me/enrollments"),
      api.get("/users/me/rating-summary"),
    ])
      .then(([eventsRes, enrollRes, ratingRes]) => {
        if (eventsRes.status === "fulfilled")  setMyEvents(eventsRes.value.data.events);
        if (enrollRes.status === "fulfilled")  setMyEnrollments(enrollRes.value.data.enrollments);
        if (ratingRes.status === "fulfilled")  setRatingSummary(ratingRes.value.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaveError(""); setSaveSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveError(""); setSaveSuccess(false);
    try {
      const payload = {};
      if (form.name !== user.name) payload.name = form.name;
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      if (Object.keys(payload).length === 0) { setEditing(false); setSaving(false); return; }

      const { data } = await api.put("/users/me", payload);
      login(data.user, token);
      setForm({ name: data.user.name, currentPassword: "", newPassword: "" });
      setSaveSuccess(true); setEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.error || "Error al guardar");
    } finally { setSaving(false); }
  };

  return (
    <PageLayout maxWidth="max-w-4xl">
      <div className="mb-10">
          <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-2">Mi cuenta</p>
          <h1 className="text-4xl font-serif text-zinc-100">{user?.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Perfil */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-zinc-400 font-mono text-xs tracking-widest uppercase">Perfil</h2>
                {!editing && (
                  <button onClick={() => setEditing(true)}
                    className="text-orange-400 hover:text-orange-300 font-mono text-xs transition-colors cursor-pointer">
                    Editar
                  </button>
                )}
              </div>

              {!editing ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-zinc-600 text-xs font-mono mb-1">Nombre</p>
                    <p className="text-zinc-200 text-sm">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 text-xs font-mono mb-1">Email</p>
                    <p className="text-zinc-200 text-sm">{user?.email}</p>
                  </div>
                  {ratingSummary?.total > 0 && (
                    <div>
                      <p className="text-zinc-600 text-xs font-mono mb-1">Valoración como organizador</p>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400 text-base">{"★".repeat(Math.round(ratingSummary.average))}{"☆".repeat(5 - Math.round(ratingSummary.average))}</span>
                        <span className="text-zinc-300 font-mono text-sm">{ratingSummary.average.toFixed(1)}</span>
                        <span className="text-zinc-600 text-xs">({ratingSummary.total})</span>
                      </div>
                    </div>
                  )}
                  {saveSuccess && <p className="text-green-400 text-xs font-mono">Perfil actualizado ✓</p>}
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-zinc-500 text-xs font-mono mb-1">Nombre</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors" />
                  </div>
                  {/* Cambio de contraseña */}
                  <div className="pt-2 border-t border-zinc-700">
                    <p className="text-zinc-500 text-xs font-mono mb-3">Cambiar contraseña</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-zinc-600 text-xs font-mono mb-1">Contraseña actual</label>
                        <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange}
                          placeholder="Tu contraseña actual"
                          className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-400 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-zinc-600 text-xs font-mono mb-1">Nueva contraseña</label>
                        <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange}
                          placeholder="Mínimo 8 caracteres"
                          className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-400 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {saveError && <p className="text-red-400 text-xs font-mono">{saveError}</p>}
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={saving}
                      className="flex-1 bg-orange-400 hover:bg-orange-300 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-semibold py-2 rounded-lg text-xs transition-colors cursor-pointer">
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                    <button type="button" onClick={() => { setEditing(false); setSaveError(""); }}
                      className="flex-1 border border-zinc-700 text-zinc-400 hover:text-zinc-200 font-semibold py-2 rounded-lg text-xs transition-colors cursor-pointer">
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Eventos e inscripciones */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-zinc-400 font-mono text-xs tracking-widest uppercase mb-4">
                Eventos organizados ({myEvents.length})
              </h2>
              {loading ? <p className="text-zinc-600 text-sm animate-pulse">Cargando...</p>
                : myEvents.length === 0 ? <p className="text-zinc-600 text-sm">Todavía no has organizado ningún evento.</p>
                : myEvents.map((e) => <EventRow key={e.id} event={e} />)}
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-zinc-400 font-mono text-xs tracking-widest uppercase mb-4">
                Inscripciones ({myEnrollments.length})
              </h2>
              {loading ? <p className="text-zinc-600 text-sm animate-pulse">Cargando...</p>
                : myEnrollments.length === 0 ? <p className="text-zinc-600 text-sm">Todavía no estás inscrito en ningún evento.</p>
                : myEnrollments.map((e) => <EventRow key={e.event.id} event={e.event} />)}
            </div>
          </div>

        </div>
    </PageLayout>
  );
}