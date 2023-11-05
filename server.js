import { Socket } from "dgram";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { Logging } from "@google-cloud/logging";
const projectId = process.env.PROJECT_ID;
const logName = "backend.logger";
const logG = new Logging({ projectId: 'adazolhub-cloud-dev' });
const log = logG.log(logName);
const PORT = process.env.PORT || 8080;
const app = express();
const httpServer = createServer(app);

const serverOptions = {
  cors: {
    origin: "*",
  },
  path: "/ws",
  transports: ["websocket"],
};

const io = new Server(httpServer, serverOptions);

const metadata = {
  resource: { type: "cloud_run_revision" },
  severity: "INFO",
};
/**
 *
 * @param {Socket} socket
 */
function onConnection(socket) {
  const jsonEntry = log.entry(metadata, {
    message: `new connection: ${socket.id}`,
  });

  log.write(jsonEntry);

  socket.on("heartbeat", (data) => {
    return socket.broadcast.emit("heartbeat", data);
  });

  socket.on("disconnect", () => {
    const jsonEntry = log.entry(metadata, {
      message: `disconnection client: ${socket.id}`,
    });
    log.write(jsonEntry);
  });

  setInterval(() => {
    socket.emit("stocks", {
      crypto: [
        {
          name: "USDT",
          price: Math.floor(Math.random() * 100000 + 1),
        },
        {
          name: "BTC",
          price: Math.floor(Math.random() * 100000 + 1),
        },
        {
          name: "ETH",
          price: Math.floor(Math.random() * 100000 + 1),
        },
        {
          name: "XRP",
          price: Math.floor(Math.random() * 100000 + 1),
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
