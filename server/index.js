const { Server } = require("socket.io");
const app = require("express")();
const http = require("http");
require("dotenv").config();

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" },
});

io.on("connection", (socket) => {
    console.log("user connected");

    socket.on("offer", ({ offer }) => {
        console.log("receiver offer");
        socket.broadcast.emit("offer", { offer });
    });

    socket.on("answer", ({ answer }) => {
        console.log("receiver answer");

        socket.broadcast.emit("answer", { answer });
    });

    socket.on("candidate", ({ candidate }) => {
        console.log("receiver candidate");

        socket.broadcast.emit("candidate", { candidate });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port, ${PORT}`);
});
