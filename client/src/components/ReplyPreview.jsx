function ReplyPreview({ replyMessage, setReplyMessage }) {
  if (!replyMessage) return null;

  return (
    <div className="bg-slate-800 border-l-4 border-blue-500 p-3 flex justify-between items-center">

      <div>
        <p className="text-xs text-blue-400">
          Replying to
        </p>

        <p className="text-white text-sm truncate">
          {replyMessage.text}
        </p>
      </div>

      <button
        onClick={() => setReplyMessage(null)}
        className="text-red-400 text-xl"
      >
        ✕
      </button>

    </div>
  );
}

export default ReplyPreview;
