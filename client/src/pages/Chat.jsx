import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

let typingTimer;

const socket = io("https://chatsphere-backend-518s.onrender.com");

function Chat() {

  const navigate = useNavigate();

  const [message, setMessage] = useState("");

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

      setMessages(data);

    })
    .catch((err) => console.log(err));

}, [selectedUser]);

useEffect(() => {

  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth"
  });
}, [messages]);


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
     
      text: message

    };

    console.log("Sending:", newMessage);


    socket.emit(
      "sendMessage",
      newMessage
    );

    console.log("Socket Connected:", socket.connected);

    setMessage("");

  };



  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login");

  };

  return (

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
   
           return (     
            <div key={index}>

              <div className="border border-red-500 p-3 bg-white text-black">

              <b>
              {users.find((u) => u._id === msg.sender)?.name || msg.sender}:
              </b>{" "}

              {msg.text}
              
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

  );

}


export default Chat;
