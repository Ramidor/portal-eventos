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
    <nav className="border-b border-zinc-800 bg-zinc-950 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/events"
          className="text-orange-400 font-mono text-sm tracking-[0.3em] uppercase hover:text-orange-300 transition-colors"
        >
          Alphavents
        </Link>

        {/* Acciones */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/events/new"
                className="bg-orange-400 hover:bg-orange-300 text-zinc-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
              >
                + Crear evento
              </Link>
              <Link
                to="/profile"
                className="text-zinc-400 hover:text-zinc-100 text-sm transition-colors"
              >
                {user.name}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-zinc-500 hover:text-orange-400 font-mono text-xs transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-zinc-600 hover:text-red-400 font-mono text-sm transition-colors cursor-pointer"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-zinc-400 hover:text-zinc-100 text-sm transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="bg-orange-400 hover:bg-orange-300 text-zinc-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
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
