const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*"
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinRoom', (player) => {
    console.log(`Player joined: ${player.name}`);

    // Emit the createRoomSuccess event to the client
    socket.emit('createRoomSuccess', player);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});