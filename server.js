const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');

const formatMessages = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUser,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set statics Files
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';
// Run when client connect
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // Welcome
    socket.emit('message', formatMessages(botName, 'Welcome To ChatCord!'));

    //  Broadcast when user connect
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessages(botName, `A ${user.username} Has Joined The Chat`)
      );

    // Send Users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUser(user.room),
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessages(user.username, msg));
  });

  // Runs when a client left the chat
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessages(botName, `A ${user.username} Has Left The Chat`)
      );
    }
    // Send Users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUser(user.room),
    });
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server runnnig on Port ${port}`));
