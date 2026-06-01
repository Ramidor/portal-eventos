import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import api from "../services/api";

export default function ResendVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 1. Leemos el email de la URL directamente al principio
  const urlEmail = searchParams.get("email") || "";
  
  // 2. Usamos ese valor como estado inicial (¡adiós useEffect!)
  const [email, setEmail]     = useState(urlEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError(""); 
    try {
      await api.post("/auth/resend-verification", { email });
      navigate("/verify-email", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.error || "Error al reenviar el email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4"><RefreshCw size={40} className="text-orange-400" /></div>
          <h1 className="text-2xl font-serif text-zinc-100 mb-2">Reenviar código</h1>
          <p className="text-zinc-500 text-sm">Introduce tu email y te enviaremos un nuevo código numérico de 6 dígitos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required 
            placeholder="tu@email.com"
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-400 transition-colors"
          />
          {error && <p className="text-red-400 text-xs font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">{error}</p>}
          
          <button type="submit" disabled={loading || !email}
            className="w-full bg-orange-400 hover:bg-orange-300 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-semibold py-3 rounded-lg text-sm transition-colors cursor-pointer">
            {loading ? "Enviando..." : "Enviar nuevo código"}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-500 text-sm">
          <Link to="/login" className="text-orange-400 hover:text-orange-300 transition-colors">
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  );
}