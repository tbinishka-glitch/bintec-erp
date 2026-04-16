import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (userId?: string): Socket => {
  if (!socket) {
    // In development, connect to the standalone socket server on port 3001
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3001';

    socket = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
      autoConnect: true,
    });

    if (userId) {
      socket.emit('user-online', userId);
    }
  }

  // If userId is provided but socket was already created without user-online signal, send it now
  if (userId && socket && (!socket.active || !socket.connected)) {
      socket.emit('user-online', userId);
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
