import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import ReplyPreview from "./ReplyPreview";
import DeleteModal from "./DeleteModal";

function ChatLayout({
  users,
  onlineUsers,
  selectedUser,
  startCall,
  setSelectedUser,
  messages,
  currentUser,
  replyMessage,
  setReplyMessage,
  selectedMessage,
  setSelectedMessage,
  message,
  setMessage,
  sendMessage,
  handleFileUpload,
  showEmojiPicker,
  setShowEmojiPicker,
  deleteForEveryone,
  deleteForMe,
  children,
}) {
  return (
    <div className="flex h-screen bg-slate-900">

      <Sidebar
        users={users}
        onlineUsers={onlineUsers}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />

      <div className="flex-1 flex flex-col">

        <ChatHeader
          selectedUser={selectedUser}
          onlineUsers={onlineUsers}
          startCall={startCall}
        />

        <div className="flex-1 overflow-y-auto p-5">

          {messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              currentUser={currentUser}
              users={users}
              setReplyMessage={setReplyMessage}
              setSelectedMessage={setSelectedMessage}
            />
          ))}

        </div>

        <ReplyPreview
          replyMessage={replyMessage}
          setReplyMessage={setReplyMessage}
        />

        <MessageInput
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          handleFileUpload={handleFileUpload}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
        >
          {children}
        </MessageInput>

      </div>

      <DeleteModal
        selectedMessage={selectedMessage}
        setSelectedMessage={setSelectedMessage}
        deleteForEveryone={deleteForEveryone}
        deleteForMe={deleteForMe}
      />

    </div>
  );
}

export default ChatLayout;
