const express = require("express");
const cors = require("cors");
require("dotenv").config();

const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");

const multer = require("multer");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/Message");
const User = require("./models/User");

const app = express();

const uploadDir = "./uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({
  storage: multer.diskStorage({

    destination: function(req, file, cb){
      cb(null, uploadDir);
    },

    filename: function(req, file, cb){
      cb(
        null,
        Date.now() + path.extname(file.originalname)
      );
    }

  })
});

const server = http.createServer(app);

const socket = require("./socket");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

socket.init(io);

const onlineUsers = new Set();

io.on("connection", (socket) => {

  console.log("🟢 User Connected:", socket.id);


  socket.on("join", async (userId) => {

    socket.join(userId);

    onlineUsers.add(userId);

    socket.userId = userId;
 
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isOnline: true },
      { new: true }
    );

    console.log("ONLINE UPDATE RESULT:", updatedUser);

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
        fileUrl: message.fileUrl || "",
        fileType: message.fileType || "",
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

socket.on("deleteMessage", async (messageId) => {

  console.log("DELETE REQUEST ID:", messageId);

  try {

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        text: "This message was deleted",
        deletedForEveryone: true
      },
      { new: true }
    );


    console.log("UPDATED MESSAGE:", updatedMessage);

    console.log("TYPE CHECK:", typeof updatedMessage);

    if(updatedMessage){
      console.log("🔥 INSIDE IF BLOCK");

      console.log(
        "EMITTING DELETE TO:",
        updatedMessage.receiver,
        updatedMessage.sender
      );

      io.to(updatedMessage.receiver).emit(
        "messageDeleted",
        updatedMessage
      );


      io.to(updatedMessage.sender).emit(
        "messageDeleted",
        updatedMessage
      );

    }
    else{
     
      console.log("❌ UPDATED MESSAGE IS NULL");
     
    }


  } catch(error){

    console.log("DELETE ERROR:", error);

  }

});

socket.on("disconnect", async () => {

  if (socket.userId) {
    onlineUsers.delete(socket.userId);
    
    await User.findByIdAndUpdate(
      socket.userId,
      { isOnline: false }
    );

    io.emit("onlineUsers", [...onlineUsers]);
  }

  console.log("🔴 User Disconnected:", socket.id);

});


socket.on("call-user", (data) => {

  console.log("📞 CALL REQUEST:", data);

  io.to(data.receiverId).emit("incoming-call", {
    callerId: data.callerId,
    callerName: data.callerName,
    callType: data.callType
  });

});

socket.on("accept-call", (data) => {

  console.log("✅ CALL ACCEPTED:", data);

  io.to(data.callerId).emit("call-accepted");

});

socket.on("reject-call", (data) => {

  console.log("❌ CALL REJECTED:", data);

  io.to(data.callerId).emit("call-rejected");

});

socket.on("end-call", (data) => {

  console.log("📴 CALL ENDED:", data);

  io.to(data.receiverId).emit("call-ended");

});

socket.on("offer", (data) => {

  console.log("📡 OFFER RECEIVED:", data);

  io.to(data.receiverId).emit("offer", {
    offer: data.offer,
    callerId: data.callerId
  });

});

socket.on("answer", (data) => {

  console.log("📡 ANSWER RECEIVED:", data);

  io.to(data.receiverId).emit("answer", {
    answer: data.answer
  });

});

socket.on("ice-candidate", (data) => {

  console.log("🧊 ICE CANDIDATE");

  io.to(data.receiverId).emit("ice-candidate", {
    candidate: data.candidate
  });

});

});

connectDB();


app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.post("/upload", upload.single("file"), (req, res) => {

  console.log("Uploaded File:", req.file);

  res.json({
    message: "File uploaded successfully",
    file: req.file
  });

});

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


module.exports = io;
