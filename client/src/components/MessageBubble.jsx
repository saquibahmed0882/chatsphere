function MessageBubble({
  msg,
  currentUser,
  users,
  setReplyMessage,
  setSelectedMessage,
}) {
  const isMe = msg.sender === currentUser.id;

  return (
    <div
      className={`flex ${
        isMe ? "justify-end" : "justify-start"
      } mb-3`}
    >
      <div
        className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-lg ${
          isMe
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-slate-700 text-white rounded-bl-md"
        }`}
      >
        {!isMe && (
          <p className="text-xs text-blue-300 font-semibold mb-1">
            {users.find((u) => u._id === msg.sender)?.name}
          </p>
        )}

        {msg.replyTo && (
          <div className="bg-black/20 rounded-lg p-2 mb-2 text-sm">
            Reply
          </div>
        )}

        <p className="break-words">{msg.text}</p>

        <div className="flex justify-between items-center mt-2">

          <span className="text-[11px] opacity-70">
            {msg.createdAt &&
              new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
          </span>

          <div className="flex gap-2">

            <button
              onClick={() => setReplyMessage(msg)}
              className="text-xs hover:text-yellow-300"
            >
              Reply
            </button>

            <button
              onClick={() => setSelectedMessage(msg)}
              className="text-xs hover:text-red-300"
            >
              Delete
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default MessageBubble;
