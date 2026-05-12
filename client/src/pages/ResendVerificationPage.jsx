import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ResendVerificationPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setMessage("");
    try {
      const { data } = await api.post("/auth/resend-verification", { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Error al reenviar el email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-serif text-stone-100 mb-2">Reenviar verificación</h1>
          <p className="text-stone-500 text-sm">Introduce tu email y te enviaremos un nuevo enlace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required placeholder="tu@email.com"
            className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
          />
          {error   && <p className="text-red-400 text-xs font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">{error}</p>}
          {message && <p className="text-green-400 text-xs font-mono bg-green-950/30 border border-green-900 rounded-lg px-4 py-3">{message}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-semibold py-3 rounded-lg text-sm transition-colors cursor-pointer">
            {loading ? "Enviando..." : "Reenviar enlace"}
          </button>
        </form>

        <p className="mt-6 text-center text-stone-500 text-sm">
          <Link to="/login" className="text-amber-400 hover:text-amber-300 transition-colors">
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  );
}