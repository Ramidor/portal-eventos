import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";

const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: "8 caracteres mínimo", ok: password.length >= 8 },
    { label: "Una mayúscula", ok: /[A-Z]/.test(password) },
    { label: "Un número", ok: /\d/.test(password) },
    { label: "Un símbolo", ok: /[!@#$%^&*()\-_=+{};:,<.>]/.test(password) },
  ];
  return (
    <div className="mt-2 space-y-1">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-2">
          <span
            className={`text-xs font-mono ${c.ok ? "text-green-400" : "text-zinc-600"}`}
          >
            {c.ok ? "✓" : "○"}
          </span>
          <span
            className={`text-xs ${c.ok ? "text-zinc-400" : "text-zinc-600"}`}
          >
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <AuthLayout
        headline={
          <>
            Enlace
            <br />
            <span className="text-orange-400">inválido.</span>
          </>
        }
        subtitle=""
      >
        <div className="w-full max-w-sm text-center">
          <p className="text-zinc-400 text-sm mb-6">
            Este enlace no es válido o ha expirado.
          </p>
          <Link
            to="/forgot-password"
            className="text-orange-400 hover:text-orange-300 font-mono text-xs transition-colors"
          >
            Solicitar nuevo enlace →
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!PASSWORD_REGEX.test(password)) {
      return setError("La contraseña no cumple los requisitos de seguridad");
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, password });
      navigate("/login?verified=true");
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === "TOKEN_EXPIRED") {
        setError("El enlace ha expirado. Solicita uno nuevo.");
      } else {
        setError(
          err.response?.data?.error || "Error al restablecer la contraseña",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline={
        <>
          Nueva
          <br />
          <span className="text-orange-400">contraseña.</span>
        </>
      }
      subtitle="Crea una contraseña segura para tu cuenta."
    >
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-2">
            Seguridad
          </p>
          <h2 className="text-3xl font-serif text-zinc-100">
            Restablecer contraseña
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-zinc-400 text-xs font-mono tracking-widest uppercase mb-2">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
              placeholder="Mínimo 8 caracteres"
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-400 transition-colors"
            />
            <PasswordStrength password={password} />
          </div>
          {error && (
            <div className="text-red-400 text-xs font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">
              {error}
              {error.includes("expirado") && (
                <Link
                  to="/forgot-password"
                  className="block mt-2 text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Solicitar nuevo enlace →
                </Link>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-400 hover:bg-orange-300 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-semibold py-3 rounded-lg text-sm transition-colors cursor-pointer"
          >
            {loading ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
