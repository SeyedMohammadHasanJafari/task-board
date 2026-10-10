import { Server as SocketIOServer, type Socket } from 'socket.io';
import type { Server as HTTPServer } from 'node:http';
import { ENV } from '../config/env.js';

export interface ActiveUser {
  socketId: string;
  userId: string;
  name: string;
  avatarColor: string;
  isGuest: boolean;
}

export interface CursorPayload {
  boardId: string;
  x: number;
  y: number;
  user: {
    userId: string;
    name: string;
    avatarColor: string;
  };
}

// Maps boardId -> Map(socketId -> ActiveUser)
const boardPresence = new Map<string, Map<string, ActiveUser>>();

// Track which boards a socket is currently in for cleanup on disconnect
const socketRooms = new Map<string, Set<string>>();

let globalIO: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return globalIO;
}

import { isOriginAllowed } from '../config/cors.js';

export function setupSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS origin rejected'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  globalIO = io;

  io.on('connection', (socket: Socket) => {
    socketRooms.set(socket.id, new Set<string>());

    // User joins a specific board room
    socket.on('join-board', ({ boardId, user }: { boardId: string; user: ActiveUser }) => {
      if (!boardId || !user) return;

      socket.join(boardId);
      socketRooms.get(socket.id)?.add(boardId);

      if (!boardPresence.has(boardId)) {
        boardPresence.set(boardId, new Map());
      }

      const activeUser: ActiveUser = {
        socketId: socket.id,
        userId: user.userId || user.socketId,
        name: user.name || 'Anonymous Guest',
        avatarColor: user.avatarColor || '#06b6d4',
        isGuest: !!user.isGuest,
      };

      boardPresence.get(boardId)!.set(socket.id, activeUser);

      // Broadcast active user presence list to everyone in the room
      const currentUsers = Array.from(boardPresence.get(boardId)!.values());
      io.to(boardId).emit('presence-update', currentUsers);
      socket.to(boardId).emit('user-joined', activeUser);
    });

    // Throttled cursor position broadcast (sent to others in room)
    socket.on('cursor-move', (payload: CursorPayload) => {
      if (!payload || !payload.boardId) return;
      socket.to(payload.boardId).emit('cursor-update', {
        socketId: socket.id,
        x: payload.x,
        y: payload.y,
        user: payload.user,
      });
    });

    // Real-Time Card Movement Sync
    socket.on('card-move', (data: {
      boardId: string;
      cardId: string;
      sourceColumn: string;
      destColumn: string;
      newOrder: number;
      siblingIds?: string[];
    }) => {
      if (!data || !data.boardId) return;
      // Broadcast to all other clients on the board so they update instantly
      socket.to(data.boardId).emit('card-moved', data);
    });

    // Real-Time Card Created Sync
    socket.on('card-created', (data: { boardId: string; card: any }) => {
      if (!data || !data.boardId) return;
      socket.to(data.boardId).emit('card-created', data.card);
    });

    // Real-Time Card Updated Sync
    socket.on('card-updated', (data: { boardId: string; card: any }) => {
      if (!data || !data.boardId) return;
      socket.to(data.boardId).emit('card-updated', data.card);
    });

    // Real-Time Card Deleted Sync
    socket.on('card-deleted', (data: { boardId: string; cardId: string }) => {
      if (!data || !data.boardId) return;
      socket.to(data.boardId).emit('card-deleted', { cardId: data.cardId });
    });

    // Real-Time Column Updated/Created Sync
    socket.on('column-update', (data: { boardId: string; columns: any[] }) => {
      if (!data || !data.boardId) return;
      socket.to(data.boardId).emit('column-updated', data.columns);
    });

    // Explicit leave board
    socket.on('leave-board', ({ boardId }: { boardId: string }) => {
      cleanupSocketFromBoard(socket, boardId, io);
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      const boards = socketRooms.get(socket.id);
      if (boards) {
        boards.forEach((boardId) => {
          cleanupSocketFromBoard(socket, boardId, io);
        });
      }
      socketRooms.delete(socket.id);
    });
  });

  return io;
}

function cleanupSocketFromBoard(socket: Socket, boardId: string, io: SocketIOServer) {
  socket.leave(boardId);
  socketRooms.get(socket.id)?.delete(boardId);

  const room = boardPresence.get(boardId);
  if (room && room.has(socket.id)) {
    const leftUser = room.get(socket.id);
    room.delete(socket.id);

    // Notify room of departure and updated user list
    const remainingUsers = Array.from(room.values());
    io.to(boardId).emit('presence-update', remainingUsers);
    io.to(boardId).emit('cursor-removed', { socketId: socket.id });
    if (leftUser) {
      socket.to(boardId).emit('user-left', leftUser);
    }

    if (room.size === 0) {
      boardPresence.delete(boardId);
    }
  }
}
