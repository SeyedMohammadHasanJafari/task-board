import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.io Client] Connected with ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚡ [Socket.io Client] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚡ [Socket.io Client] Connection Error:', error.message);
    });
  }

  return socket;
}
