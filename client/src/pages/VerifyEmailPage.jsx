import { useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { MailOpen } from "lucide-react";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const inputRefs = useRef([]);

  // Maneja el input dígito a dígito con salto automático al siguiente campo
  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // solo dígitos
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6)
      return setError("Introduce los 6 dígitos del código");
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/verify-email", {
        email,
        code: fullCode,
      });
      login(data.user, data.token);
      navigate("/events");
    } catch (err) {
      const serverCode = err.response?.data?.code;
      setError(err.response?.data?.error || "Error al verificar");
      if (serverCode === "CODE_EXPIRED") {
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return setError("Introduce tu email para reenviar el código");
    setResending(true);
    setResendMsg("");
    setError("");
    try {
      await api.post("/auth/resend-verification", { email });
      setResendMsg("Nuevo código enviado. Revisa tu email.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Error al reenviar el código");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <MailOpen size={48} className="text-orange-400" />
          </div>
          <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-2">
            Verificación
          </p>
          <h1 className="text-3xl font-serif text-zinc-100 mb-3">
            Revisa tu email
          </h1>
          <p className="text-zinc-400 text-sm">
            Hemos enviado un código de 6 dígitos a{" "}
            <span className="text-zinc-200">{email || "tu email"}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input del email si no vino por state */}
          {!emailFromState && (
            <div>
              <label className="block text-zinc-400 text-xs font-mono tracking-widest uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
          )}

          {/* Inputs OTP */}
          <div>
            <label className="block text-zinc-400 text-xs font-mono tracking-widest uppercase mb-4 text-center">
              Código de verificación
            </label>
            <div className="flex gap-3 justify-center" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-mono font-bold bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg focus:outline-none focus:border-orange-400 transition-colors"
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-mono bg-red-950/30 border border-red-900 rounded-lg px-4 py-3 text-center">
              {error}
            </p>
          )}
          {resendMsg && (
            <p className="text-green-400 text-xs font-mono text-center">
              {resendMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.join("").length < 6}
            className="w-full bg-orange-400 hover:bg-orange-300 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-semibold py-3 rounded-lg text-sm transition-colors cursor-pointer"
          >
            {loading ? "Verificando..." : "Verificar cuenta"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-zinc-500 hover:text-orange-400 font-mono text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {resending ? "Enviando..." : "¿No recibiste el código? Reenviar"}
          </button>
          <div>
            <Link
              to="/login"
              className="text-zinc-600 hover:text-zinc-400 font-mono text-xs transition-colors"
            >
              ← Volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
