import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres");
    }
    setLoading(true);
    try {
      // Registrar y luego login automático
      await api.post("/auth/register", form);
      const { data } = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      login(data.user, data.token);
      navigate("/events");
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex">

      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-stone-900 border-r border-stone-800">
        <div>
          <span className="text-amber-400 font-mono text-xs tracking-[0.3em] uppercase">
            Portal de Eventos
          </span>
        </div>
        <div>
          <h1 className="text-6xl font-serif text-stone-100 leading-tight mb-6">
            Tu próximo<br />
            evento<br />
            <span className="text-amber-400">te espera.</span>
          </h1>
          <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
            Únete y empieza a organizar o descubrir eventos. Sin restricciones de rol.
          </p>
        </div>
        <div className="text-stone-600 font-mono text-xs">
          © {new Date().getFullYear()} — TFG
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          <div className="mb-10">
            <p className="text-stone-500 font-mono text-xs tracking-widest uppercase mb-2">
              Nuevo usuario
            </p>
            <h2 className="text-3xl font-serif text-stone-100">
              Crear cuenta
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-stone-400 text-xs font-mono tracking-widest uppercase mb-2">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Tu nombre"
                className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-stone-400 text-xs font-mono tracking-widest uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
                className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-stone-400 text-xs font-mono tracking-widest uppercase mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-semibold py-3 rounded-lg text-sm transition-colors duration-200 cursor-pointer"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-8 text-center text-stone-500 text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}