import UserCard from "./UserCard";

function Sidebar({
  users,
  onlineUsers,
  selectedUser,
  setSelectedUser,
}) {
  return (
    <div className="w-80 bg-[#0f172a] border-r border-slate-700 flex flex-col">

      <div className="p-5 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-white">
          ChatSphere
        </h1>

        <input
          type="text"
          placeholder="Search..."
          className="mt-4 w-full bg-slate-800 rounded-full px-4 py-2 outline-none text-white"
        />
      </div>

      <div className="flex-1 overflow-y-auto">

        {users.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            online={onlineUsers.includes(user._id)}
          />
        ))}

      </div>
    </div>
  );
}

export default Sidebar;
