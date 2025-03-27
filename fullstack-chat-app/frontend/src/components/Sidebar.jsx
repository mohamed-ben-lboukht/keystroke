import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { MessageCircle, Users } from "lucide-react";

const Sidebar = () => {
  const { 
    getUsers, 
    users, 
    selectedUser, 
    setSelectedUser, 
    isUsersLoading,
    unreadMessages 
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  console.log("SIDEBAR UNREAD MESSAGES:", unreadMessages);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => {
          console.log(`USER ${user._id} UNREAD COUNT:`, unreadMessages[user._id]);
          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-3 flex items-center gap-3
                hover:bg-base-300 transition-colors
                ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="size-12 object-cover rounded-full"
                />
                {/* Indicateur de statut en ligne (vert) */}
                {onlineUsers.includes(user._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500 
                    rounded-full ring-2 ring-zinc-900"
                  />
                )}
                
                {/* Indicateur de nouveau message (bleu) - version améliorée */}
                {unreadMessages[user._id] && (
                  <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center z-10">
                    <span className="absolute size-5 bg-blue-500 rounded-full animate-ping opacity-75"></span>
                    <span className="relative size-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-zinc-900">
                      {unreadMessages[user._id] > 0 && (
                        <span className="text-[10px] font-bold text-white">
                          {unreadMessages[user._id] > 9 ? "9+" : unreadMessages[user._id]}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* User info - only visible on larger screens */}
              <div className="hidden lg:block text-left min-w-0 relative">
                <div className="font-medium truncate flex items-center gap-2">
                  {user.fullName}
                  {unreadMessages[user._id] && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  )}
                </div>
                <div className="text-sm text-zinc-400 flex items-center gap-1">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  {unreadMessages[user._id] && (
                    <span className="inline-flex text-xs font-semibold text-blue-500 ml-1 bg-blue-100 px-1.5 py-0.5 rounded-full">
                      <MessageCircle className="size-3 mr-1" />
                      {unreadMessages[user._id]} {unreadMessages[user._id] === 1 ? "message" : "messages"}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
