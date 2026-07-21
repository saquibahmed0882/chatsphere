function UserCard({
  user,
  online,
  selectedUser,
  setSelectedUser,
}) {
  return (
    <div
      onClick={() => setSelectedUser(user)}
      className={`flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 border-b border-slate-800 hover:bg-slate-800 ${
        selectedUser?._id === user._id
          ? "bg-slate-800"
          : ""
      }`}
    >
      <div className="relative">

        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>

        {online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f172a]"></div>
        )}

      </div>

      <div className="flex-1 overflow-hidden">

        <h2 className="text-white font-semibold truncate">
          {user.name}
        </h2>

        <p className="text-gray-400 text-sm truncate">
          Tap to chat...
        </p>

      </div>

    </div>
  );
}

export default UserCard;
