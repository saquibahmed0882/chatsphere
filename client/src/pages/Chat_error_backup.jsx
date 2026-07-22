import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChatLayout from "../components/ChatLayout";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

let typingTimer;

const socket = io("https://chatsphere-backend-518s.onrender.com");

function Chat() {

  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [typingUser, setTypingUser] = useState("");

  const [users, setUsers] = useState([]);
 
  const [onlineUsers, setOnlineUsers] = useState([]);
 
  const [selectedUser, setSelectedUser] = useState(null);

  const [messages, setMessages] = useState([
    {
      sender: "ChatSphere",
      text: "Welcome to ChatSphere 🚀"
    }
  ]);

const [replyMessage, setReplyMessage] = useState(null);
const [selectedMessage, setSelectedMessage] = useState(null);

const messagesEndRef = useRef(null);

useEffect(() => {


    fetch("https://chatsphere-backend-518s.onrender.com/api/users")
    .then(res => res.json())
    .then(data => {
      console.log("Users:", data.users);
      setUsers(data.users);
    })
    .catch(err => console.log(err));



    socket.on("connect", () => {

      console.log("Connected:", socket.id);

      const user = JSON.parse(localStorage.getItem("user"));
     
      console.log("Current User:", user);

      if (user) {

        console.log("Current User ID:", user.id);
       
        console.log("Joining Room:", user.id);
       
        socket.emit("join", user.id);    
       
        console.log("JOIN SENT:", user.id);
 
      }

    });
    
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (currentUser && socket.connected) {

      console.log("MANUAL JOIN:", currentUser.id);

      socket.emit("join", currentUser.id);

    }

    socket.on("receiveMessage", (msg) => {

      console.log("Received Messages:", msg);

      console.log("Created At:", msg.createdAt);
      
      setMessages((prev) => {
     
        const updated = [...prev, msg];

        console.log("Messages After Update:", updated);

        return updated;

      });

    });

    socket.on("messageDeleted", (updatedMessage) => {

      console.log("🔥 DELETE RECEIVED:", updatedMessage);

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === updatedMessage._id
            ? updatedMessage
            : msg
        )
      );

    });

    socket.on("typing", (data) => {


      setTypingUser(data.name);

      setTimeout(() => {
        setTypingUser("");
      }, 2000);

    });


    socket.on("onlineUsers", (users) => {

      setOnlineUsers(users);

    });

    return (
  <ChatLayout
    users={users}
    onlineUsers={onlineUsers}
    selectedUser={selectedUser}
    setSelectedUser={setSelectedUser}

    messages={messages}

    currentUser={JSON.parse(localStorage.getItem("user"))}

    replyMessage={replyMessage}
    setReplyMessage={setReplyMessage}

    selectedMessage={selectedMessage}
    setSelectedMessage={setSelectedMessage}

    message={message}
    setMessage={setMessage}

    sendMessage={sendMessage}

    showEmojiPicker={showEmojiPicker}
    setShowEmojiPicker={setShowEmojiPicker}

    deleteForEveryone={deleteForEveryone}
    deleteForMe={deleteForMe}
  />
);

 }


 export default Chat;
