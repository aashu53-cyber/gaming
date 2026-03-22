module.exports = (io, socket) => {
    socket.on('joinRoom', (data) => {
        // Handle both string or object input
        const roomCode = (typeof data === 'string') ? data : data.roomCode;
        
        if (!roomCode) {
            console.error("JoinRoom failed: No roomCode provided");
            return;
        }

        socket.join(roomCode);
        console.log(`User ${socket.id} joined room: ${roomCode}`);

        setTimeout(() => {
            const clients = io.sockets.adapter.rooms.get(roomCode);
            const numClients = clients ? clients.size : 0;

            if (numClients === 1) {
                socket.emit('assignRole', { role: 'host', symbol: 'X' });
            } 
            else if (numClients === 2) {
                socket.emit('assignRole', { role: 'guest', symbol: 'O' });
                io.in(roomCode).emit('playerJoined');
            } 
            else {
                socket.emit('error', 'Room is full');
                socket.leave(roomCode);
            }
        }, 50); 
    });
};