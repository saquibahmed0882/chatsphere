import { FaPhoneAlt, FaVideo, FaEllipsisV } from "react-icons/fa";

function ChatHeader({ selectedUser, onlineUsers, startCall}) {
  const isOnline =
    selectedUser && onlineUsers.includes(String(selectedUser._id));

  return (
    <div className="h-20 bg-[#0f172a] border-b border-slate-700 flex items-center justify-between px-6">

      <div className="flex items-center gap-4">

        <div className="relative">

          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            {selectedUser
              ? selectedUser.name.charAt(0).toUpperCase()
              : "C"}
          </div>

          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0f172a]"></div>
          )}

        </div>

        <div>

          <h2 className="text-white font-semibold text-lg">
            {selectedUser
              ? selectedUser.name
              : "Select User"}
          </h2>

          <p className="text-sm text-gray-400">
            {isOnline ? "Online" : "Offline"}
          </p>

        </div>

      </div>

      <div className="flex gap-5 text-gray-300 text-lg">

        <FaPhoneAlt
          onClick={() => startCall("voice")}
          className="cursor-pointer hover:text-blue-500 transition"
/>

        <FaVideo
          onClick={() => startCall("video")}
          className="cursor-pointer hover:text-blue-500 transition"
/>

        <FaEllipsisV className="cursor-pointer hover:text-blue-500 transition" />

      </div>

    </div>
  );
}

export default ChatHeader;
