import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom"; // Faltaba importar Link
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function VerifyEmailPage() {
  const { login } = useAuth(); 
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Faltaba declarar este estado

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Enviamos el email y el código al backend
      const { data } = await api.post("/auth/verify-email", { email, code });
      
      // Iniciamos sesión automáticamente en el estado global
      login(data.user, data.token); 
      
      // Redirigimos directamente al dashboard de eventos
      navigate("/events"); 
    } catch (err) {
      setError(err.response?.data?.error || "Código inválido o expirado.");
    } finally {
      setLoading(false); // Detenemos la carga
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-6">🔢</div>
        <h1 className="text-2xl font-serif text-stone-100 mb-3">Introduce tu código</h1>
        <p className="text-stone-400 text-sm leading-relaxed mb-6">
          Hemos enviado un código de 6 dígitos a: <br />
          <span className="font-bold text-stone-200">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            maxLength="6"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} 
            className="w-full p-4 text-center text-3xl tracking-[0.5em] font-mono bg-stone-900 border border-stone-800 rounded-lg text-stone-100 focus:outline-none focus:border-amber-400 transition-colors"
            required
          />

          {error && (
            <p className="text-red-400 text-xs font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-stone-950 font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
          >
            {loading ? "Verificando..." : "Verificar cuenta"}
          </button>
        </form>

        <p className="text-stone-600 text-xs mt-8">
          ¿No has recibido nada o el código ha caducado? <br />
          <Link 
            to={`/resend-verification?email=${encodeURIComponent(email)}`} 
            className="text-amber-400 hover:text-amber-300 transition-colors underline mt-2 inline-block font-bold"
          >
            Solicitar un nuevo código →
          </Link>
        </p>

        <div className="mt-8 pt-8 border-t border-stone-900">
          <Link to="/login" className="text-stone-500 hover:text-stone-300 text-xs transition-colors">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}