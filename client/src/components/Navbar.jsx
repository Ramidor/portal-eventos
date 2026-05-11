import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-stone-800 bg-stone-950 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/events"
          className="text-amber-400 font-mono text-xs tracking-[0.3em] uppercase hover:text-amber-300 transition-colors"
        >
          Portal de Eventos
        </Link>

        {/* Acciones */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/events/new"
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                + Crear evento
              </Link>
              <Link
                to="/profile"
                className="text-stone-400 hover:text-stone-100 text-sm transition-colors"
              >
                {user.name}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-stone-500 hover:text-amber-400 font-mono text-xs transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-stone-600 hover:text-red-400 font-mono text-xs transition-colors cursor-pointer"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-stone-400 hover:text-stone-100 text-sm transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}