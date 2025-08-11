const express = require('express');
        const http = require('http');
        const socketIo = require('socket.io');
        
        const app = express();
        const server = http.createServer(app);
        const io = socketIo(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        app.use(express.static('public'));
        
        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);
            
            socket.on('draw', (data) => {
                socket.broadcast.emit('draw', data);
            });
            
            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        });
        
        const PORT = process.env.PORT || 8080;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });