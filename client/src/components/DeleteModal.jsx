function DeleteModal({
  selectedMessage,
  setSelectedMessage,
  deleteForEveryone,
  deleteForMe,
}) {
  if (!selectedMessage) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-80">

        <h2 className="text-xl font-bold mb-5 text-black">
          Delete Message
        </h2>

        <button
          onClick={deleteForEveryone}
          className="w-full bg-red-600 text-white py-3 rounded-lg mb-3"
        >
          Delete for Everyone
        </button>

        <button
          onClick={deleteForMe}
          className="w-full bg-yellow-500 text-white py-3 rounded-lg mb-3"
        >
          Delete for Me
        </button>

        <button
          onClick={() => setSelectedMessage(null)}
          className="w-full bg-gray-500 text-white py-3 rounded-lg"
        >
          Cancel
        </button>

      </div>

    </div>
  );
}

export default DeleteModal;
