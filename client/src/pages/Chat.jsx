import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChatLayout from "../components/ChatLayout";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

let typingTimer;

const API = import.meta.env.VITE_API_URL;
const socket = io(API);

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
const [incomingCall, setIncomingCall] = useState(null);
const [callActive, setCallActive] = useState(false);

const localStream = useRef(null);
const peerConnection = useRef(null);
const remoteAudio = useRef(null);


const messagesEndRef = useRef(null);

useEffect(() => {


    fetch(`${API}/api/users`)
    .then(res => res.json())
    .then(data => {
      console.log("Users:", data.users);
      setUsers(data.users);
    })
    .catch(err => console.log(err));





    // 📞 Incoming Call Listener
    socket.on("incoming-call", (data) => {

      console.log("📞 INCOMING CALL:", data);

      setIncomingCall(data);

    });


    socket.on("call-accepted", () => {

      console.log("✅ CALL ACCEPTED");

    });

    socket.on("answer", async (data) => {

      console.log("📡 ANSWER RECEIVED:", data);


      await peerConnection.current.setRemoteDescription(
        data.answer
      );


      console.log("✅ REMOTE DESCRIPTION SET");

    });

    socket.on("ice-candidate", async (data)=>{

      try {

        await peerConnection.current.addIceCandidate(
          data.candidate
        );

        console.log("🧊 ICE ADDED");

      } catch(error){

        console.log("ICE ERROR:", error);

      }

    });






    socket.on("call-rejected", () => {

      console.log("❌ CALL REJECTED");

    });


    socket.on("call-ended", () => {

      console.log("📴 CALL ENDED");

    });

    // 📡 Receive WebRTC Offer

    socket.on("offer", async (data) => {

      console.log("📡 OFFER RECEIVED:", data);


      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });


      localStream.current = stream;


      peerConnection.current = new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302"
          }
        ]
      });


      peerConnection.current.onicecandidate = (event) => {

        if(event.candidate){

          socket.emit("ice-candidate", {
            receiverId: data.callerId,
            candidate: event.candidate
          });

          console.log("🧊 ICE SENT");

        }

      };


      peerConnection.current.ontrack = (event) => {

        console.log("🎧 REMOTE AUDIO RECEIVED");


        if(remoteAudio.current){

          remoteAudio.current.srcObject =
            event.streams[0];

          remoteAudio.current.play();

        }

      };


      stream.getTracks().forEach((track)=>{

        peerConnection.current.addTrack(
          track,
          stream
        );

      });


      await peerConnection.current.setRemoteDescription(
        data.offer
      );


      const answer =
        await peerConnection.current.createAnswer();


      await peerConnection.current.setLocalDescription(
        answer
      );


      const user =
        JSON.parse(localStorage.getItem("user"));


      socket.emit("answer", {

        receiverId: data.callerId,

        answer

      });


      console.log("📡 ANSWER SENT");

    });



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

    console.log("LOCAL STORAGE USER:", currentUser);

    if (currentUser && socket.connected) {

      console.log("JOINING WITH ID:", currentUser.id);

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

      console.log("🔥 ONLINE USERS FROM SERVER:", users);

      setOnlineUsers(users);

    });

    
    

const startVoiceCall = async () => {

  try {

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    localStream.current = stream;


    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        }
      ]
    });


    stream.getTracks().forEach((track) => {

      peerConnection.current.addTrack(
        track,
        stream
      );

    });


    console.log("🔗 Peer Connection Created");


    console.log("🎤 Microphone access granted");

    setCallActive(true);

  } catch(error) {

    console.log("❌ Microphone permission error:", error);

  }

};


const acceptCall = async () => {

  socket.emit("accept-call", {
    callerId: incomingCall.callerId
  });

  console.log("✅ ACCEPT CALL");

  await startVoiceCall();

  setIncomingCall(null);

};


const rejectCall = () => {

  socket.emit("reject-call", {
    callerId: incomingCall.callerId
  });

  console.log("❌ REJECT CALL");

  setIncomingCall(null);

};


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
    `${API}/api/messages/${currentUser.id}/${selectedUser._id}`
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

  
const startCall = async (type) => {

  const user = JSON.parse(localStorage.getItem("user"));

  if (!selectedUser) {
    alert("Please select a user first");
    return;
  }


  socket.emit("call-user", {
    receiverId: selectedUser._id,
    callerId: user.id,
    callerName: user.name,
    callType: type
  });


  console.log("📞 CALL SENT:", type);


  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });


  localStream.current = stream;


  peerConnection.current = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302"
      }
    ]
  });


  peerConnection.current.ontrack = (event) => {

    console.log("🎧 REMOTE AUDIO RECEIVED");


    if(remoteAudio.current){

      remoteAudio.current.srcObject =
        event.streams[0];

      remoteAudio.current.play();

    }

  };


  peerConnection.current.onicecandidate = (event) => {

    if(event.candidate){

      socket.emit("ice-candidate", {
        receiverId: selectedUser._id,
        candidate: event.candidate
      });

      console.log("🧊 ICE SENT");

    }

  };


  stream.getTracks().forEach(track => {
    peerConnection.current.addTrack(
      track,
      stream
    );
  });


  const offer = await peerConnection.current.createOffer();

  await peerConnection.current.setLocalDescription(
    offer
  );


  socket.emit("offer", {

    receiverId: selectedUser._id,

    callerId: user._id,

    offer

  });


  console.log("📡 OFFER SENT");

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
    `${API}/upload`,
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
    sender: user._id,
    receiver: selectedUser._id,
    text: "",
    fileUrl: `${API}/${data.file.path}`,
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
      `${API}/api/messages/delete-for-everyone`,
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
      `${API}/api/messages/delete-for-me`,
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

  <audio
    ref={remoteAudio}
    autoPlay
  />

  {incomingCall && (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">

      <div className="bg-slate-800 p-6 rounded-2xl text-center">

        <h2 className="text-white text-xl font-bold">
          Incoming {incomingCall.callType} Call
        </h2>

        <p className="text-gray-300 mt-2">
          {incomingCall.callerName}
        </p>

        <div className="flex gap-4 mt-5">

          <button
            onClick={acceptCall}
            className="bg-green-600 text-white px-5 py-2 rounded-xl"
          >
            Accept
          </button>

          <button
            onClick={rejectCall}
            className="bg-red-600 text-white px-5 py-2 rounded-xl"
          >
            Reject
          </button>

        </div>

      </div>

    </div>
  )}

  <ChatLayout
    startCall={startCall}
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
  </>
);

}

export default Chat;
