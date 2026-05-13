import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;

function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    { label: "8 caracteres mínimo", ok: password.length >= 8 },
    { label: "Una mayúscula",        ok: /[A-Z]/.test(password) },
    { label: "Un número",            ok: /\d/.test(password) },
    { label: "Un símbolo",           ok: /[!@#$%^&*()\-_=+{};:,<.>]/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-1">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-2">
          <span className={`text-xs font-mono ${c.ok ? "text-green-400" : "text-stone-600"}`}>
            {c.ok ? "✓" : "○"}
          </span>
          <span className={`text-xs ${c.ok ? "text-stone-400" : "text-stone-600"}`}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!PASSWORD_REGEX.test(form.password)) {
      return setError("La contraseña no cumple los requisitos de seguridad");
    }
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      // Pasamos el email para prellenarlo en la página de verificación
      navigate("/verify-email", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline={<>Tu próximo<br />evento<br /><span className="text-amber-400">te espera.</span></>}
      subtitle="Únete y empieza a organizar o descubrir eventos. Sin restricciones de rol."
    >
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <p className="text-stone-500 font-mono text-xs tracking-widest uppercase mb-2">Nuevo usuario</p>
          <h2 className="text-3xl font-serif text-stone-100">Crear cuenta</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-stone-400 text-xs font-mono tracking-widest uppercase mb-2">Nombre</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Tu nombre"
              className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors" />
          </div>
          <div>
            <label className="block text-stone-400 text-xs font-mono tracking-widest uppercase mb-2">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="tu@email.com"
              className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors" />
          </div>
          <div>
            <label className="block text-stone-400 text-xs font-mono tracking-widest uppercase mb-2">Contraseña</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Mínimo 8 caracteres"
              className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-lg px-4 py-3 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors" />
            <PasswordStrength password={form.password} />
          </div>
          {error && <p className="text-red-400 text-xs font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-semibold py-3 rounded-lg text-sm transition-colors cursor-pointer">
            {loading ? "Enviando código..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-8 text-center text-stone-500 text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-amber-400 hover:text-amber-300 transition-colors">Inicia sesión</Link>
        </p>
      </div>
    </AuthLayout>
  );
}