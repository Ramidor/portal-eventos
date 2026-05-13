import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function EventRow({ event }) {
  const date = new Date(event.date);
  const formatted = date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  return (
    <Link to={`/events/${event.id}`}
      className="flex items-center justify-between py-3 border-b border-stone-800 last:border-0 hover:bg-stone-800/30 -mx-2 px-2 rounded transition-colors">
      <div>
        <p className="text-stone-200 text-sm font-medium">{event.title}</p>
        <p className="text-stone-500 text-xs font-mono">{formatted} · {event.location}</p>
      </div>
      {event._count && (
        <span className="text-stone-600 text-xs font-mono ml-4 shrink-0">{event._count.enrollments} inscritos</span>
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
    name: user?.name || "", email: user?.email || "",
    currentPassword: "", newPassword: "",
  });
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/users/me/events"), api.get("/users/me/enrollments")])
      .then(([eventsRes, enrollRes]) => {
        setMyEvents(eventsRes.data.events);
        setMyEnrollments(enrollRes.data.enrollments);
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
      if (form.email !== user.email) payload.email = form.email;
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      if (Object.keys(payload).length === 0) { setEditing(false); setSaving(false); return; }

      const { data } = await api.put("/users/me", payload);
      login(data.user, token);
      setForm({ name: data.user.name, email: data.user.email, currentPassword: "", newPassword: "" });
      setSaveSuccess(true); setEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.error || "Error al guardar");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-stone-500 font-mono text-xs tracking-widest uppercase mb-2">Mi cuenta</p>
          <h1 className="text-4xl font-serif text-stone-100">{user?.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Perfil */}
          <div className="lg:col-span-1">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-stone-400 font-mono text-xs tracking-widest uppercase">Perfil</h2>
                {!editing && (
                  <button onClick={() => setEditing(true)}
                    className="text-amber-400 hover:text-amber-300 font-mono text-xs transition-colors cursor-pointer">
                    Editar
                  </button>
                )}
              </div>

              {!editing ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-stone-600 text-xs font-mono mb-1">Nombre</p>
                    <p className="text-stone-200 text-sm">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-stone-600 text-xs font-mono mb-1">Email</p>
                    <p className="text-stone-200 text-sm">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-stone-600 text-xs font-mono mb-1">Rol</p>
                    <span className={`text-xs font-mono px-2 py-1 rounded-full ${
                      user?.role === "ADMIN" ? "bg-amber-400/10 text-amber-400" : "bg-stone-800 text-stone-400"
                    }`}>{user?.role}</span>
                  </div>
                  {saveSuccess && <p className="text-green-400 text-xs font-mono">Perfil actualizado ✓</p>}
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-stone-500 text-xs font-mono mb-1">Nombre</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange}
                      className="w-full bg-stone-800 border border-stone-700 text-stone-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-xs font-mono mb-1">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      className="w-full bg-stone-800 border border-stone-700 text-stone-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 transition-colors" />
                  </div>

                  {/* Cambio de contraseña */}
                  <div className="pt-2 border-t border-stone-700">
                    <p className="text-stone-500 text-xs font-mono mb-3">Cambiar contraseña</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-stone-600 text-xs font-mono mb-1">Contraseña actual</label>
                        <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange}
                          placeholder="Tu contraseña actual"
                          className="w-full bg-stone-800 border border-stone-700 text-stone-100 rounded-lg px-3 py-2 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-stone-600 text-xs font-mono mb-1">Nueva contraseña</label>
                        <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange}
                          placeholder="Mínimo 8 caracteres"
                          className="w-full bg-stone-800 border border-stone-700 text-stone-100 rounded-lg px-3 py-2 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {saveError && <p className="text-red-400 text-xs font-mono">{saveError}</p>}
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={saving}
                      className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-semibold py-2 rounded-lg text-xs transition-colors cursor-pointer">
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                    <button type="button" onClick={() => { setEditing(false); setSaveError(""); }}
                      className="flex-1 border border-stone-700 text-stone-400 hover:text-stone-200 font-semibold py-2 rounded-lg text-xs transition-colors cursor-pointer">
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Eventos e inscripciones */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
              <h2 className="text-stone-400 font-mono text-xs tracking-widest uppercase mb-4">
                Eventos organizados ({myEvents.length})
              </h2>
              {loading ? <p className="text-stone-600 text-sm animate-pulse">Cargando...</p>
                : myEvents.length === 0 ? <p className="text-stone-600 text-sm">Todavía no has organizado ningún evento.</p>
                : myEvents.map((e) => <EventRow key={e.id} event={e} />)}
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
              <h2 className="text-stone-400 font-mono text-xs tracking-widest uppercase mb-4">
                Inscripciones ({myEnrollments.length})
              </h2>
              {loading ? <p className="text-stone-600 text-sm animate-pulse">Cargando...</p>
                : myEnrollments.length === 0 ? <p className="text-stone-600 text-sm">Todavía no estás inscrito en ningún evento.</p>
                : myEnrollments.map((e) => <EventRow key={e.event.id} event={e.event} />)}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}