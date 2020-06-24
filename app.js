const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");

// const mongoose = require("mongoose");

const dotenv = require("dotenv");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = socketio(server);

process.env.NODE_ENV = app.get("env");

require("./startup/prod")(app);

// Imports Utils
const formatMessage = require("./utils/messages");

// Import Routes
const authRoute = require("./routes/auth");
const chatRoutes = require("./routes/chat");

// const { MasterDB } = require("./startup/db");

// MasterDB();

const { MasterDB } = require("./startup/db");

const MasterConn = MasterDB();

// const { PersonalDB } = require("./startup/db");

// const PersonalConn = PersonalDB();

// Set Static Folder
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

app.post("/", (req, res) => {
  console.log(req.body.Name);

  res.status(200).send("Perfect!");
});

// Socket
require("./SocketHandler/mainSocket")(io);

// io.on("connection", (socket) => {
//   socket.on("openChat", (gotId) => {
//     // io.emit("message", formatMessage("User", gotId));
//     socket.join(gotId);

//     // Welcome current user
//     socket.emit("message", formatMessage(appName, "Welcome to my ChatApp"));

//     //  BroadCast when user connects
//     socket.broadcast
//       .to(gotId)
//       .emit("message", "A user has joined the ChatApp!");
//   });

//   // Listen for chatMessage
//   socket.on("chatMessage", (uOrg) => {

//     console.log(uOrg);

//     io.emit("message", formatMessage("User", uOrg.Message));
//   });

//   // Runs when client disconnects
//   socket.on("disconnect", () => {
//     io.emit("message", formatMessage(appName, "A user has left the ChatApp!"));
//   });
// });

// Route Middleware
app.use("/api", authRoute);

app.use("/chat", chatRoutes);

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Listening on Port ${port}...!`));
