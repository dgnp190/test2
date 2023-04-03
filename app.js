
// Importing dependencies
const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const path = require("path");
const { Server } = require("socket.io");

// Configuring dotenv
dotenv.config();

// Configuring the server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuring socket events
io.on("connection", socket => {
    console.log("New user joined");

    socket.on('join_request', username => {
        socket.join('global');
        io.sockets.in('global').emit('new_user_joined', username);
    });

    socket.on('send_msg', data => {
        io.sockets.in('global').emit('recieve_msg', data);
    });

    socket.on('get_usercount', who => {
        let usercount = io.sockets.adapter.rooms.get('global').size;
        io.sockets.in('global').emit('return_usercount', {usersize: usercount, requestedBy: who});
    });

    socket.on('disconnect', () => {
        io.sockets.in('global').emit('user_left', 'someone');
    });
});

// Configuring app instance
const static_path = path.join(__dirname, "public");
app.use(express.static(static_path));

// Creating routes
app.get('/', (req, res) => {
    res.sendFile("index.html");
});

// Starting the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is now listening on port ${port}`);
});

