import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type WallMessage = {
  id: number;
  content: string;
  userId: number;
  createdAt: string;
  user: { id: number; name: string };
};

export default function useWall(eventId: number, token: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<WallMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!token || !eventId) return;

    const socket = io(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect',        () => { setConnected(true); setError(''); socket.emit('joinEvent', { eventId }); });
    socket.on('messageHistory', (history: WallMessage[]) => setMessages(history));
    socket.on('newMessage',     (msg: WallMessage) => setMessages((prev) => [...prev, msg]));
    socket.on('wallError',      ({ error: err }: { error: string }) => setError(err));
    socket.on('disconnect',     () => setConnected(false));
    socket.on('connect_error',  (err) => { setError(err.message); setConnected(false); });

    return () => {
      socket.emit('leaveEvent', { eventId });
      socket.disconnect();
    };
  }, [eventId, token]);

  const sendMessage = useCallback((content: string) => {
    socketRef.current?.emit('sendMessage', { eventId, content });
  }, [eventId]);

  return { messages, connected, error, sendMessage };
}
