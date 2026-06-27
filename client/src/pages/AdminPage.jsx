/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { useAuth } from "../context/AuthContext";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "../constants/categories";
import { Tag } from "lucide-react";
import api from "../services/api";

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(
    () =>
      api.get("/users/admin/users").then(({ data }) => setUsers(data.users)),
    [],
  );

  const fetchEvents = useCallback(
    () =>
      api.get("/events/admin/all").then(({ data }) => setEvents(data.events)),
    [],
  );

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([fetchUsers(), fetchEvents()])
      .catch(() => setError("Error al cargar datos"))
      .finally(() => setLoading(false));
  }, [fetchUsers, fetchEvents]);

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
    if (!confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`))
      return;
    try {
      await api.delete(`/users/admin/users/${targetId}`);
      setUsers((prev) => prev.filter((u) => u.id !== targetId));
      await fetchEvents(); // actualiza el nombre del creador en los eventos organizados por ese usuario
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar usuario");
    }
  };

  const handleDeleteEvent = async (eventId, title) => {
    if (
      !confirm(
        `¿Eliminar el evento "${title}"? Esta acción no se puede deshacer.`,
      )
    )
      return;
    try {
      await api.delete(`/events/${eventId}`);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      await fetchUsers(); // actualiza el contador de eventos organizados por usuario
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar evento");
    }
  };

  return (
    <PageLayout maxWidth="max-w-5xl">
      <div className="mb-8">
        <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-2">
          Panel de administración
        </p>
        <h1 className="text-4xl font-serif text-zinc-100">Gestión</h1>
      </div>

      {/* Pestañas */}
      <div className="flex gap-1 mb-8 border-b border-zinc-800">
        {[
          { key: "users", label: "Usuarios" },
          { key: "events", label: "Eventos" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2.5 font-mono text-xs tracking-widest uppercase transition-colors cursor-pointer ${
              tab === key
                ? "text-orange-400 border-b-2 border-orange-400 -mb-px"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-zinc-500 font-mono text-sm animate-pulse">
          Cargando...
        </p>
      )}
      {error && (
        <p className="text-red-400 text-sm font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* ── Tabla Usuarios ── */}
      {!loading && !error && tab === "users" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-500 font-mono text-xs tracking-widest uppercase px-6 py-4">
                  Usuario
                </th>
                <th className="text-left text-zinc-500 font-mono text-xs tracking-widest uppercase px-6 py-4">
                  Rol
                </th>
                <th className="text-left text-zinc-500 font-mono text-xs tracking-widest uppercase px-6 py-4 hidden md:table-cell">
                  Eventos
                </th>
                <th className="text-left text-zinc-500 font-mono text-xs tracking-widest uppercase px-6 py-4 hidden md:table-cell">
                  Inscripciones
                </th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-zinc-200">{u.name}</p>
                    <p className="text-zinc-500 text-xs font-mono">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded-full ${
                        u.role === "ADMIN"
                          ? "bg-orange-400/10 text-orange-400"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 hidden md:table-cell">
                    {u._count?.organizedEvents ?? 0}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 hidden md:table-cell">
                    {u._count?.enrollments ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    {u.id !== user.id ? (
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => handleRoleChange(u.id, u.role)}
                          className="text-zinc-500 hover:text-orange-400 font-mono text-xs transition-colors cursor-pointer"
                        >
                          {u.role === "ADMIN" ? "→ USER" : "→ ADMIN"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="text-zinc-600 hover:text-red-400 font-mono text-xs transition-colors cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : (
                      <span className="text-zinc-700 font-mono text-xs">
                        Tú
                      </span>
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-500 font-mono text-xs tracking-widest uppercase px-6 py-4">
                  Evento
                </th>
                <th className="text-left text-zinc-500 font-mono text-xs tracking-widest uppercase px-6 py-4 hidden md:table-cell">
                  Categoría
                </th>
                <th className="text-left text-zinc-500 font-mono text-xs tracking-widest uppercase px-6 py-4 hidden md:table-cell">
                  Inscritos
                </th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const isPast = new Date(e.date) < new Date();
                return (
                  <tr
                    key={e.id}
                    className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p
                        className={`font-medium ${isPast ? "text-zinc-500" : "text-zinc-200"}`}
                      >
                        {e.title}
                      </p>
                      <p className="text-zinc-600 text-xs font-mono">
                        {new Date(e.date).toLocaleDateString("es-ES")} ·{" "}
                        {e.creator?.name}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 hidden md:table-cell text-xs font-mono">
                      {(() => {
                        const I = CATEGORY_ICONS[e.category] || Tag;
                        return (
                          <span className="inline-flex items-center gap-1">
                            <I size={11} />
                            {CATEGORY_LABELS[e.category] || "Otro"}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 hidden md:table-cell">
                      {e._count?.enrollments ?? 0}
                      {e.maxAttendees && (
                        <span className="text-zinc-600">
                          {" "}
                          / {e.maxAttendees}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          to={`/events/${e.id}/edit`}
                          className="text-zinc-600 hover:text-orange-400 font-mono text-xs transition-colors"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDeleteEvent(e.id, e.title)}
                          className="text-zinc-600 hover:text-red-400 font-mono text-xs transition-colors cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {events.length === 0 && (
            <p className="text-zinc-600 text-sm font-mono text-center py-10">
              No hay eventos.
            </p>
          )}
        </div>
      )}
    </PageLayout>
  );
}
