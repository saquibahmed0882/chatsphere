const express = require("express");
const cors = require("cors");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/Message");

const app = express();

const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


const onlineUsers = new Set();

io.on("connection", (socket) => {

  console.log("🟢 User Connected:", socket.id);


  socket.on("join", (userId) => {

    socket.join(userId);

    onlineUsers.add(userId);

    socket.userId = userId;

    io.emit("onlineUsers", [...onlineUsers]);

    console.log("👤 User Joined Room:", userId);

   });
   

   socket.on("typing", (data) => {

     console.log("⌨️ Typing received:", data);

     io.to(data.receiver).emit("typing", data);

   });


  socket.on("sendMessage", async (message) => {

    console.log("📨 Message Received:", message);

    try {

      const savedMessage = await Message.create({
        sender: message.sender,
        text: message.text,
        receiver: message.receiver,
        replyTo: message.replyTo || null,
        status: "sent"
      });

      const populatedMessage = await Message.findById(savedMessage._id)
        .populate("replyTo");


    console.log("✅ Saved:", populatedMessage);

    io.to(message.receiver).emit(
      "receiveMessage",
      populatedMessage
    );

    io.to(message.sender).emit(
      "receiveMessage",
      populatedMessage
    );

    io.to(message.sender).emit(
      "messageDelivered",
      {
        messageId: populatedMessage._id
       }
    );

  } catch(error) {

    console.log("❌ Message Save Error:", error);

  }

});


  socket.on("disconnect", () => {

    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("onlineUsers", [...onlineUsers]);
    }

    console.log("🔴 User Disconnected:", socket.id);

  });

});


connectDB();


app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "🚀 ChatSphere Backend is Running!"
  });

});


const PORT = process.env.PORT || 8000;


server.listen(PORT, () => {

  console.log(`Server running on http://localhost:${PORT}`);

});
