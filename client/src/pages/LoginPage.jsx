import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const justVerified = searchParams.get("verified") === "true";

  const handleChange = (e) => { 
    setForm({ ...form, [e.target.name]: e.target.value }); 
    setError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.user, data.token);
      navigate("/events");
    } catch (err) {
      const serverError = err.response?.data?.error || "Error al iniciar sesión";
      const code        = err.response?.data?.code;
      
      // 2. MODIFICADO: Activamos el estado si el backend nos devuelve el código
      if (code === "EMAIL_NOT_VERIFIED") {
        navigate("/verify-email", { state: { email: form.email } });
      } else {
        setError(serverError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline={<>Organiza.<br />Conecta.<br /><span className="text-amber-400">Vive.</span></>}
      subtitle="Crea y descubre eventos. Cualquier usuario puede organizar y asistir."
    >
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <p className="text-stone-500 font-mono text-xs tracking-widest uppercase mb-2">Bienvenido de nuevo</p>
          <h2 className="text-3xl font-serif text-stone-100">Iniciar sesión</h2>
        </div>

        {justVerified && (
          <div className="mb-6 bg-green-950/30 border border-green-800 rounded-lg px-4 py-3">
            <p className="text-green-400 text-xs font-mono">✓ Email verificado correctamente. Ya puedes iniciar sesión.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-stone-400 text-xs font-mono tracking-widest uppercase mb-2">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="tu@email.com"
              className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors" />
          </div>
          <div>
            <label className="block text-stone-400 text-xs font-mono tracking-widest uppercase mb-2">Contraseña</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••"
              className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors" />
          </div>
          {error && <p className="text-red-400 text-xs font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-semibold py-3 rounded-lg text-sm transition-colors duration-200 cursor-pointer">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-8 text-center text-stone-500 text-sm">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-amber-400 hover:text-amber-300 transition-colors">Regístrate</Link>
        </p>
      </div>
    </AuthLayout>
  );
}