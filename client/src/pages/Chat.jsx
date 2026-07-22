import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChatLayout from "../components/ChatLayout";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

let typingTimer;

const socket = io("http://localhost:8000");

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
     
        const exists = prev.some(
          (m) => String(m._id) === String(msg._id)
        );

        if (exists) {
          return prev;
        }
        
        const updated = [...prev, msg];

        console.log("Messages After Update:", updated);

        return updated;

      });

    });

    socket.on("messageDeleted", (updatedMessage) => {

      console.log("🔥 DELETE RECEIVED:", updatedMessage);
  
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          String(msg._id) ===  String(updatedMessage._id)
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

    
    return () => {

      socket.off("connect");
      socket.off("receiveMessage");
      socket.off("messageDeleted");
      socket.off("typing");
      socket.off("onlineUsers");
        
    };


  }, []);

useEffect(() => {

  if (!selectedUser) return;

  const currentUser = JSON.parse(localStorage.getItem("user"));

  fetch(
    `https://localhost:8000/api/messages/${currentUser.id}/${selectedUser._id}`
  )
    .then((res) => res.json())
    .then((data) => {

      console.log("📜 Chat History:", data);

      console.log("First Message:", data[0]);

      console.log("FIRST MESSAGE ID:", data[0]?._id);

      setMessages(data);

    })
    .catch((err) => console.log(err));

}, [selectedUser]);

useEffect(() => {

  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth"
  });
}, [messages]);

  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const sendMessage = () => {

    if (!selectedUser) {
      alert("Please select a user first");
      return;
    }

    if (message.trim() === "") return;

    const user = JSON.parse(localStorage.getItem("user"));
    
    const newMessage = { 
      sender: user.id,     
      receiver: selectedUser._id,
      text: message,
      replyTo: replyMessage ? replyMessage._id : null
    };

    console.log("Sending:", newMessage);

    socket.emit(
      "sendMessage",
      newMessage
    );

    console.log("Socket Connected:", socket.connected);

    setMessage("");
    setReplyMessage(null);  
 
  };

const handleFileUpload = async (file) => {

  if (!selectedUser) {
    alert("Please select a user first");
    return;
  }

  const formData = new FormData();

  formData.append("file", file);

  const res = await fetch(
    "http://localhost:8000/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  console.log("Uploaded File:", data);
  console.log("FILE DATA:", data.file);

  console.log("CREATING MESSAGE");

  const user = JSON.parse(localStorage.getItem("user"));

  const newMessage = {
    sender: user.id,
    receiver: selectedUser._id,
    text: "",
    fileUrl: `http://localhost:8000/${data.file.path}`,
    fileType: file.type,
    replyTo: replyMessage ? replyMessage._id : null
  };

  console.log("📸 Sending File Message:", newMessage);

  socket.emit(
    "sendMessage",
    newMessage
  );

};


  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login");

  };

  const deleteForEveryone = async () => {
    if (!selectedMessage) return;

    console.log("SELECTED MESSAGE ID:", selectedMessage?._id);

    const res = await fetch(
      "http://localhost:8000/api/messages/delete-for-everyone",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: selectedMessage._id,
        }),
      }
    );
    
    const data = await res.json();

    console.log("DELETE RESPONSE:", data);

    setSelectedMessage(null);
  };

  const deleteForMe = async () => {
    if (!selectedMessage) return;

    const user = JSON.parse(localStorage.getItem("user"));

    await fetch(
      "https://chatsphere-backend-518s.onrender.com/api/messages/delete-for-me",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: selectedMessage._id,
          userId: user.id,
        }),
      }
    );

    setMessages((prev) =>
      prev.filter(
        (msg) => msg._id !== selectedMessage._id
      )
    );

    setSelectedMessage(null);
  };  

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
    handleFileUpload={handleFileUpload}

    showEmojiPicker={showEmojiPicker}
    setShowEmojiPicker={setShowEmojiPicker}

    deleteForEveryone={deleteForEveryone}
    deleteForMe={deleteForMe}
  >
    {showEmojiPicker && (
      <EmojiPicker onEmojiClick={onEmojiClick} />
    )}
  </ChatLayout>
);

}

export default Chat;
