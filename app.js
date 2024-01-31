const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let users = [];

io.on('connection', (socket) => {
  console.log('a user connected');

  // Broadcast when a user joins the chat
  socket.broadcast.emit('message', { user: 'Admin', text: `${socket.id} has joined the chat` });

  // Listen for new users
  socket.on('new user', (username) => {
    users.push({ id: socket.id, username });
    socket.username = username;
    io.emit('update users', users.map(user => user.username));
    io.emit('message', { user: 'Admin', text: `${username} has joined the chat` });
  });

  // Listen for messages
  socket.on('send message', (msg) => {
    io.emit('message', { user: socket.username, text: msg });
  });

  // Listen for private messages
  socket.on('private message', ({ recipient, message }) => {
    const recipientSocket = users.find(user => user.username === recipient)?.id;
    if (recipientSocket) {
      io.to(recipientSocket).emit('private message', { sender: socket.username, message });
    } else {
      // Handle the case where the recipient is not found
      // You may want to emit an error or handle it differently
      console.log(`Recipient ${recipient} not found`);
    }
  });

  // Listen for disconnect
  socket.on('disconnect', () => {
    users = users.filter(user => user.id !== socket.id);
    io.emit('update users', users.map(user => user.username));
    io.emit('message', { user: 'Admin', text: `${socket.username} has left the chat` });
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
