const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const roomHandler = require('./src/rooms');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    roomHandler(io,socket);

    // 2. UNIVERSAL RELAY (The "Post Office")
    // This receives data from any game and sends it to the other player in the room
    socket.on('sync_game_state', (data) => {
        // data structure: { roomCode, gameID, payload }
        socket.to(data.roomCode).emit('receive_game_update', {
            gameID: data.gameID,
            payload: data.payload
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));