const { Server } = require("socket.io");
const app = require("express")();
const http = require("http");

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

server.listen("https://webrtc-demo-bamn.onrender.com", () => {
    console.log(`Server running on port`);
});
