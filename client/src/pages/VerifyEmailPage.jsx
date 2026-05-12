/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    // El backend redirige a /login?verified=true si el token es válido
    // Esta página solo se muestra si algo falló o el usuario llega aquí directamente
    const verified = searchParams.get("verified");
    if (verified === "true") {
      setStatus("success");
    } else {
      setStatus("pending");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center">

        {status === "pending" && (
          <>
            <div className="text-5xl mb-6">📬</div>
            <h1 className="text-2xl font-serif text-stone-100 mb-3">Revisa tu email</h1>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              Te hemos enviado un enlace de verificación. Haz clic en él para activar tu cuenta.
            </p>
            <p className="text-stone-600 text-xs font-mono">
              ¿No lo recibes?{" "}
              <Link to="/resend-verification" className="text-amber-400 hover:text-amber-300 transition-colors">
                Reenviar enlace
              </Link>
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl mb-6">✅</div>
            <h1 className="text-2xl font-serif text-stone-100 mb-3">Email verificado</h1>
            <p className="text-stone-400 text-sm mb-6">
              Tu cuenta ha sido activada correctamente.
            </p>
            <Link
              to="/login"
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              Iniciar sesión
            </Link>
          </>
        )}

      </div>
    </div>
  );
}