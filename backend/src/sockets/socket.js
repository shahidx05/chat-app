const jwt = require('jsonwebtoken');
const User = require('./../models/User');

const initSocket = (io) => {
    // middleware: runs before every connection is accepted
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error('Authentication error: no token'));
            }

            const payload = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(payload.id).select('-password');

            if (!user) {
                return next(new Error('Authentication error: user not found'));
            }

            socket.user = user; // attach user info to this socket
            next();
        } catch (err) {
            next(new Error('Authentication error: invalid token'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`✅ ${socket.user.username} connected (${socket.id})`);
        // console.log('a user connected', socket.id);

        socket.emit('me', socket.user);
        socket.emit('welcome', `Welcome, ${socket.user.username}!`);
        // socket.broadcast.emit('welcome', `Welcome, ${socket.id}!`);
        // io.emit('welcome', `Welcome, ${socket.id}!`);
        socket.on('message', (msg) => {
            io.emit('mess', `${socket.user.username}: ${msg}`);
        })

        socket.on('disconnect', () => {
            console.log(`❌ ${socket.user.username} disconnected`);
        });
    });
}

module.exports = initSocket;
