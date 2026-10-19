import { createServer } from "node:http";
import  next  from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);
    const io = new Server(httpServer);

    io.on("connection", (socket) => {
        socket.on("join-group", (groupId) => { 
            socket.join(`group:${groupId}`);
        });

        socket.on("leave-group", (groupId) => { 
            socket.leave(`group:${groupId}`);
        });
    });

    globalThis.io = io;

    httpServer.once("error", (err) => {
        console.error(err);
        process.exit(1);
    })
    .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    })
});