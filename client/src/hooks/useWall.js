import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

/**
 * Hook que gestiona la conexión WebSocket al muro de un evento.
 * Se conecta al montar, se desconecta al desmontar.
 */
export default function useWall(eventId, token) {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Token al conectar WS:", token);
    if (!token || !eventId) return;

    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
      auth: { token },
    });
    

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setError("");
      socket.emit("joinEvent", { eventId });
    });

    socket.on("messageHistory", (history) => {
      setMessages(history);
    });

    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("wallError", ({ error: err }) => {
      setError(err);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      setError(err.message);
      setConnected(false);
    });

    return () => {
      socket.emit("leaveEvent", { eventId });
      socket.disconnect();
    };
  }, [eventId, token]);

  const sendMessage = useCallback((content) => {
    socketRef.current?.emit("sendMessage", { eventId, content });
  }, [eventId]);

  return { messages, connected, error, sendMessage };
}