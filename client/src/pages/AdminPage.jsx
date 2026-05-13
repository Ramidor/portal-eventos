import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { CATEGORY_LABELS } from "../constants/categories";
import api from "../services/api";

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("users");

  const [users, setUsers]   = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  const fetchUsers = () =>
    api.get("/users/admin/users").then(({ data }) => setUsers(data.users));

  const fetchEvents = () =>
    api.get("/events/admin/all").then(({ data }) => setEvents(data.events));

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([fetchUsers(), fetchEvents()])
      .catch(() => setError("Error al cargar datos"))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (targetId, currentRole) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`¿Cambiar rol a ${newRole}?`)) return;
    try {
      await api.patch(`/users/admin/users/${targetId}/role`, { role: newRole });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Error al cambiar rol");
    }
  };

  const handleDeleteUser = async (targetId, name) => {
    if (!confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/users/admin/users/${targetId}`);
      setUsers((prev) => prev.filter((u) => u.id !== targetId));
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar usuario");
    }
  };

  const handleDeleteEvent = async (eventId, title) => {
    if (!confirm(`¿Eliminar el evento "${title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/events/${eventId}`);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar evento");
    }
  };

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">

        <div className="mb-8">
          <p className="text-stone-500 font-mono text-xs tracking-widest uppercase mb-2">
            Panel de administración
          </p>
          <h1 className="text-4xl font-serif text-stone-100">Gestión</h1>
        </div>

        {/* Pestañas */}
        <div className="flex gap-1 mb-8 border-b border-stone-800">
          {[{ key: "users", label: "Usuarios" }, { key: "events", label: "Eventos" }].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2.5 font-mono text-xs tracking-widest uppercase transition-colors cursor-pointer ${
                tab === key
                  ? "text-amber-400 border-b-2 border-amber-400 -mb-px"
                  : "text-stone-500 hover:text-stone-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && <p className="text-stone-500 font-mono text-sm animate-pulse">Cargando...</p>}
        {error && (
          <p className="text-red-400 text-sm font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {/* ── Tabla Usuarios ── */}
        {!loading && !error && tab === "users" && (
          <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="text-left text-stone-500 font-mono text-xs tracking-widest uppercase px-6 py-4">Usuario</th>
                  <th className="text-left text-stone-500 font-mono text-xs tracking-widest uppercase px-6 py-4">Rol</th>
                  <th className="text-left text-stone-500 font-mono text-xs tracking-widest uppercase px-6 py-4 hidden md:table-cell">Eventos</th>
                  <th className="text-left text-stone-500 font-mono text-xs tracking-widest uppercase px-6 py-4 hidden md:table-cell">Inscripciones</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-stone-800/50 last:border-0 hover:bg-stone-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-stone-200">{u.name}</p>
                      <p className="text-stone-500 text-xs font-mono">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-mono px-2 py-1 rounded-full ${
                        u.role === "ADMIN" ? "bg-amber-400/10 text-amber-400" : "bg-stone-800 text-stone-400"
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4 text-stone-400 hidden md:table-cell">{u._count?.organizedEvents ?? 0}</td>
                    <td className="px-6 py-4 text-stone-400 hidden md:table-cell">{u._count?.enrollments ?? 0}</td>
                    <td className="px-6 py-4">
                      {u.id !== user.id ? (
                        <div className="flex items-center gap-3 justify-end">
                          <button onClick={() => handleRoleChange(u.id, u.role)}
                            className="text-stone-500 hover:text-amber-400 font-mono text-xs transition-colors cursor-pointer">
                            {u.role === "ADMIN" ? "→ USER" : "→ ADMIN"}
                          </button>
                          <button onClick={() => handleDeleteUser(u.id, u.name)}
                            className="text-stone-600 hover:text-red-400 font-mono text-xs transition-colors cursor-pointer">
                            Eliminar
                          </button>
                        </div>
                      ) : (
                        <span className="text-stone-700 font-mono text-xs">Tú</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Tabla Eventos ── */}
        {!loading && !error && tab === "events" && (
          <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="text-left text-stone-500 font-mono text-xs tracking-widest uppercase px-6 py-4">Evento</th>
                  <th className="text-left text-stone-500 font-mono text-xs tracking-widest uppercase px-6 py-4 hidden md:table-cell">Categoría</th>
                  <th className="text-left text-stone-500 font-mono text-xs tracking-widest uppercase px-6 py-4 hidden md:table-cell">Inscritos</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {events.map((e) => {
                  const isPast = new Date(e.date) < new Date();
                  return (
                    <tr key={e.id} className="border-b border-stone-800/50 last:border-0 hover:bg-stone-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className={`font-medium ${isPast ? "text-stone-500" : "text-stone-200"}`}>{e.title}</p>
                        <p className="text-stone-600 text-xs font-mono">
                          {new Date(e.date).toLocaleDateString("es-ES")} · {e.creator?.name}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-stone-400 hidden md:table-cell text-xs font-mono">
                        {CATEGORY_LABELS[e.category] || "📌 Otro"}
                      </td>
                      <td className="px-6 py-4 text-stone-400 hidden md:table-cell">
                        {e._count?.enrollments ?? 0}
                        {e.maxAttendees && (
                          <span className="text-stone-600"> / {e.maxAttendees}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteEvent(e.id, e.title)}
                          className="text-stone-600 hover:text-red-400 font-mono text-xs transition-colors cursor-pointer">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {events.length === 0 && (
              <p className="text-stone-600 text-sm font-mono text-center py-10">No hay eventos.</p>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
