const express = require("express");
const app = express();

const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(httpServer, {
  debug: true
});

const cors = require("cors");
app.use(express.json());
app.use(cors());

let lives = [];

app.use("/peer", peerServer);

app.get("/live", (req, res) => {
  res.json({ lives });
});

app.post("/live/:id", (req, res) => {
  lives.push(req.params.id);
  setTimeout(() =>
    lives = lives.filter((live) => live !== req.params.id), 1000 * 60 * 30);
  io.emit("livesUpdated", lives);
  res.json({ lives });
});

app.delete("/live/:id", (req, res) => {
  lives = lives.filter((live) => live !== req.params.id);
  io.emit("livesUpdated", lives);
  res.json({ lives });
});

const port = process.env.PORT || 3000;

httpServer.listen(port, (err) => {
  if (err) throw err;
  console.log("Started listening at port 80...");
});
