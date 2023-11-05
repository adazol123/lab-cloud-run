import { Socket } from "dgram";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { Logging } from "@google-cloud/logging";

const logG = new Logging()

const PORT = process.env.PORT || 8080;
const app = express();
const httpServer = createServer(app);

const serverOptions = {
  cors: {
    origin: "*",
  },
  path: "/ws",
  transports: ['websocket']
};

const io = new Server(httpServer, serverOptions);
let connCount = 0;
/**
 *
 * @param {Socket} socket
 */
function onConnection(socket) {
  logG.entry(`new connection: ${socket.id}`);

  socket.on("heartbeat", (data) => {
    return socket.broadcast.emit("heartbeat", data);
  });

  socket.on("disconnect", () => {
    logG.entry(`disconnection client: ${socket.id}`);
  })

  setInterval(() => {
    socket.emit("stocks", {
      crypto: [
        {
          name: "USDT",
          price: Math.floor((Math.random() * 100000) + 1),
        },
        {
          name: "BTC",
          price: Math.floor((Math.random() * 100000) + 1),
        },
        {
          name: "ETH",
          price: Math.floor((Math.random() * 100000) + 1),
        },
        {
          name: "XRP",
          price: Math.floor((Math.random() * 100000) + 1),
        },
      ],
    });
  }, 300000); //5 minutes
}

function serverInit() {
  console.log("server running at port: " + PORT);
  return;
}

app.get("/", (req, res) => {
  res.status(200).send({
    environment: "api",
    port: PORT,
  });
});

io.on("connection", onConnection);

httpServer.listen(PORT, serverInit);
