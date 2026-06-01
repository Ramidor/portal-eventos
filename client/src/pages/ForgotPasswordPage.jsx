import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Error al procesar la solicitud. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline={<>Recupera<br />tu<br /><span className="text-orange-400">acceso.</span></>}
      subtitle="Te enviaremos un enlace a tu email para que puedas crear una nueva contraseña."
    >
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-2">Seguridad</p>
          <h2 className="text-3xl font-serif text-zinc-100">¿Olvidaste tu contraseña?</h2>
        </div>

        {sent ? (
          <div className="bg-green-950/30 border border-green-800 rounded-xl p-6 text-center">
            <p className="text-green-400 font-mono text-sm mb-2">✓ Correo enviado</p>
            <p className="text-zinc-400 text-sm">
              Si el email está registrado y verificado, recibirás un enlace en los próximos minutos.
            </p>
            <Link to="/login" className="inline-block mt-6 text-orange-400 hover:text-orange-300 font-mono text-xs transition-colors">
              ← Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-zinc-400 text-xs font-mono tracking-widest uppercase mb-2">Email</label>
              <input
                type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required placeholder="tu@email.com"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            {error && <p className="text-red-400 text-xs font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-orange-400 hover:bg-orange-300 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-semibold py-3 rounded-lg text-sm transition-colors cursor-pointer">
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
            <p className="text-center text-zinc-500 text-sm">
              <Link to="/login" className="text-orange-400 hover:text-orange-300 transition-colors">← Volver al login</Link>
            </p>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
