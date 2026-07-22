function UserCard({
  user,
  online,
  selectedUser,
  setSelectedUser,
}) {
  const isSelected = selectedUser?._id === user._id;

  return (
    <div
      onClick={() => setSelectedUser(user)}
      className={`mx-3 my-2 rounded-2xl cursor-pointer transition-all duration-300
      ${
        isSelected
          ? "bg-blue-700 shadow-lg"
          : "bg-slate-800 hover:bg-slate-700"
      }`}
    >
      <div className="flex items-center gap-4 p-4">

        <div className="relative">

          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>

          {online && (
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-slate-800"></span>
          )}

        </div>

        <div className="flex-1 min-w-0">

          <div className="flex justify-between items-center">

            <h2 className="font-semibold text-white truncate">
              {user.name}
            </h2>

            <span className="text-[11px] text-gray-400">
              now
            </span>

          </div>

          <p className="text-sm text-gray-400 truncate mt-1">
            {online ? "🟢 Online" : "Last seen recently"}
          </p>

        </div>

      </div>
    </div>
  );
}

export default UserCard;
