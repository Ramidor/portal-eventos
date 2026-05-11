import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useWall from "../hooks/useWall";

export default function EventWall({ eventId }) {
  const { user, token } = useAuth();
  console.log("EventWall montado:", { eventId, token }); // ← añade esto
  const navigate = useNavigate();
  const { messages, connected, error, sendMessage } = useWall(eventId, token);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  // Scroll automático al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  // Usuario no logueado
  if (!user) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 text-center">
        <p className="text-stone-500 text-sm mb-3">
          Inicia sesión para acceder al muro del evento.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="text-amber-400 hover:text-amber-300 font-mono text-xs transition-colors cursor-pointer"
        >
          Iniciar sesión →
        </button>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">

      {/* Cabecera */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
        <h2 className="text-stone-400 font-mono text-xs tracking-widest uppercase">
          Muro del evento
        </h2>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-stone-600"}`} />
          <span className="text-stone-600 font-mono text-xs">
            {connected ? "En vivo" : "Conectando..."}
          </span>
        </div>
      </div>

      {/* Error de acceso (no inscrito) */}
      {error && (
        <div className="px-6 py-4 bg-red-950/30 border-b border-red-900">
          <p className="text-red-400 text-xs font-mono">{error}</p>
        </div>
      )}

      {/* Lista de mensajes */}
      <div className="h-80 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && !error && (
          <p className="text-stone-600 text-sm text-center py-8">
            No hay mensajes todavía. ¡Sé el primero!
          </p>
        )}

        {messages.map((msg) => {
          const isOwn = msg.userId === user.id;
          const time = new Date(msg.createdAt).toLocaleTimeString("es-ES", {
            hour: "2-digit", minute: "2-digit",
          });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
            >
              <div className={`max-w-xs lg:max-w-sm rounded-xl px-4 py-2 ${
                isOwn
                  ? "bg-amber-400 text-stone-950"
                  : "bg-stone-800 text-stone-200"
              }`}>
                {!isOwn && (
                  <p className="text-xs font-semibold mb-1 text-stone-400">
                    {msg.user?.name}
                  </p>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
              <p className="text-stone-600 font-mono text-xs mt-1">{time}</p>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-stone-800 px-4 py-3">
        {!error && (
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={connected ? "Escribe un mensaje..." : "Conectando..."}
              disabled={!connected}
              maxLength={500}
              className="flex-1 bg-stone-800 border border-stone-700 text-stone-100 rounded-lg px-4 py-2 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!connected || !input.trim()}
              className="bg-amber-400 hover:bg-amber-300 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Enviar
            </button>
          </form>
        )}
      </div>

    </div>
  );
}