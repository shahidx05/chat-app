require('dotenv').config()
const http = require('node:http');
const app = require('./src/app');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

connectDB();

// io.on('connection', (socket) => {
//     console.log('a user connected', socket.id);

//     // socket.emit('welcome', `Welcome, ${socket.id}!`);
//     socket.broadcast.emit('welcome', `Welcome, ${socket.id}!`);
//     // io.emit('welcome', `Welcome, ${socket.id}!`);
//     socket.on('message', (msg) => {
//         io.emit('mess', msg)
//     })

//     socket.on('disconnect', () => {
//         console.log('user disconnected', socket.id);
//     })
// });

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});