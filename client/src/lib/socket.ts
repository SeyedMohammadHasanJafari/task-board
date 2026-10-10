import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
        : undefined);

    socket = io(socketUrl || window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[socket] Connected with ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('[socket] Connection Error:', error.message);
    });
  }

  return socket;
}
