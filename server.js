import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 8080;

function onConnection(socket) {
  socket.on("heartbeat", (data) => {
    return socket.broadcast.emit("heartbeat", { ping: "pong" });
  });
}

function serverInit() {
  console.log("server running at port: " + PORT);
  return;
}

io.on("connection", onConnection);

httpServer.listen(PORT, serverInit);
