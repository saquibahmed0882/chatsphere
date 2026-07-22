import { FaSmile, FaPaperclip, FaPaperPlane } from "react-icons/fa";

function MessageInput({
  message,
  setMessage,
  sendMessage,
  setShowEmojiPicker,
  showEmojiPicker,
  children,
  handleFileUpload,
}) {

  const handleFile = async (e) => {

    const file = e.target.files[0];

    if(file){

      console.log("📎 File Selected:", file);      

      handleFileUpload(file);
    }

  };
  
  return (
    <div className="bg-[#0f172a] border-t border-slate-700 p-4">

      <div className="flex items-center gap-3">

        {/* Emoji Button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-2xl text-gray-300 hover:text-blue-500"
        >
          <FaSmile />
        </button>


        {/* Emoji Picker / Reply Preview */}
        {children}


        {/* File Upload */}
        <input
          type="file"
          id="fileInput"
          hidden
          onChange={handleFile}
        />

        <button
          onClick={() => document.getElementById("fileInput").click()}
          className="text-2xl text-gray-300 hover:text-blue-500"
        >
          <FaPaperclip />
        </button>


        {/* Message Input */}
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-800 rounded-full px-5 py-3 outline-none text-white"
        />


        {/* Send Button */}
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 p-4 rounded-full transition"
        >
          <FaPaperPlane className="text-white" />
        </button>

      </div>

    </div>
  );
}

export default MessageInput;
