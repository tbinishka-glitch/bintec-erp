import { createServer } from 'node:http';
import { Server } from 'socket.io';

const port = 3001;
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Track online users
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('Chat Socket connected:', socket.id);

  socket.on('user-online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('online-users', Array.from(onlineUsers.keys()));
    console.log(`User ${userId} is now online`);
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on('send-message', (data) => {
    // data: { groupId, message }
    io.to(data.groupId).emit('new-message', data.message);
  });

  socket.on('typing-start', (data) => {
    // data: { groupId, userId, userName }
    socket.to(data.groupId).emit('user-typing', data);
  });

  socket.on('typing-stop', (data) => {
    // data: { groupId, userId }
    socket.to(data.groupId).emit('user-typing-stop', data);
  });

  socket.on('delete-message', (data) => {
    // data: { groupId, messageId }
    io.to(data.groupId).emit('message-deleted', data.messageId);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('online-users', Array.from(onlineUsers.keys()));
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

httpServer.listen(port, () => {
  console.log(`> Chat Hub Server ready on port ${port}`);
});
