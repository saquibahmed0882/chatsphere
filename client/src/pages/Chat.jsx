import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
    `https://chatsphere-backend-518s.onrender.com/api/messages/${currentUser.id}/${selectedUser._id}`
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
      "http://localhost:8000/api/messages/delete-for-me",
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
    <>
      <div className="min-h-screen bg-gray-950 text-white flex">

      <div className="w-72 bg-gray-900 p-6 border-r border-gray-800">

        <h1 className="text-3xl font-bold text-blue-500">
          ChatSphere
        </h1>


        <h2 className="text-gray-400 mt-8">
          Online Users
        </h2>


        <div className="mt-4 space-y-3">

        {
           users.map((user)=>(
             <div
               key={user._id}
               onClick={() => setSelectedUser(user)}
               className="bg-gray-800 p-3 rounded-lg cursor-pointer hover:bg-gray-700"
             >
               <span className="mr-2">
                 {onlineUsers.includes(user._id) ? "🟢" : "⚪"}
               </span>
               {user.name} ({user._id.slice(-4)})
             </div>
           ))
         }

         </div>

        <button
          onClick={logout}
          className="mt-10 w-full bg-red-600 py-3 rounded-lg"
        >
          Logout
        </button>


      </div>



      <div className="flex-1 flex flex-col">


      <div className="bg-gray-900 p-5 text-xl font-semibold">

      {
        selectedUser
        ? `Chat with ${selectedUser.name}`
        : "Select User"
       }

       </div>


        <div className="flex-1 p-6 overflow-y-auto space-y-4">


         {messages.map((msg,index)=> {
   
           console.log("RENDER MESSAGE:", msg._id, msg.text);

           return (     
            <div key={msg._id}>

              <div className="border border-red-500 p-3 bg-white text-black">

              <b>
              {users.find((u) => u._id === msg.sender)?.name || msg.sender}:
              </b>{" "}

              {msg.text}
              
              <div className="mt-2">
                <button
                  onClick={() => setReplyMessage(msg)}
                  className="bg-blue-600 text-white px-3 py-1 rounded mt-2"
                >
                   Reply
                </button>
     
                <button
                  onClick={() => setSelectedMessage(msg)}
                  className="bg-red-600 text-white px-3 py-1 rounded mt-2 ml-2"
                >
                  Delete
                </button>
              </div>

              {msg.createdAt && (
                <div className="text-xs text-gray-200 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
               )}


              </div>


            </div>
           );   

         })}

          {
            typingUser && (
              <p className="text-gray-400 text-sm">
                {typingUser} is typing...
              </p>
            )
           }

          <div ref={messagesEndRef}></div>

        </div>



        <div className="bg-gray-900 p-5 flex gap-3">

            {replyMessage && (
              <div className="bg-gray-800 p-3 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-blue-400">Replying to</p>
                    <p className="text-sm text-white">{replyMessage.text}</p>
                  </div>

                  <button
                    onClick={() => setReplyMessage(null)}
                    className="text-red-500 font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

           <div className="flex gap-3">

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition text-2xl"
                title="Choose Emoji"
              >
                😊
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-14 left-0 z-50">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}
           </div>
    
           <input
    
            value={message}

            onChange={(e)=>{

              setMessage(e.target.value);

              const user = JSON.parse(localStorage.getItem("user"));

              if(selectedUser){

                socket.emit("typing", {

                  receiver: selectedUser._id,
                  name: user.name

                });

                console.log("⌨️ Typing sent");

              }

            }}


            placeholder="Type message..."

            className="flex-1 bg-gray-800 p-3 rounded-lg outline-none"

          />


          <button
            onClick={() => {
              console.log("SEND BUTTON CLICKED");
              sendMessage();
            }}
            className="bg-blue-600 px-6 rounded-lg"
          >          
            Send
          </button>
        </div>
      </div>
    </div>
  </div>

    {selectedMessage && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-80 text-black">

        <h2 className="text-xl font-bold mb-4">
          Delete Message
        </h2>

        <button
          onClick={deleteForEveryone}
          className="w-full bg-red-600 text-white py-2 rounded mb-2"
        >
          Delete for Everyone
        </button>

        <button
          onClick={deleteForMe}
          className="w-full bg-yellow-500 text-white py-2 rounded mb-2"
        >
          Delete for Me
        </button>

        <button
          onClick={() => setSelectedMessage(null)}
          className="w-full bg-gray-500 text-white py-2 rounded"
        >
          Cancel
        </button>

      </div>
    </div>
  )}

  </>
 );
 }


 export default Chat;
