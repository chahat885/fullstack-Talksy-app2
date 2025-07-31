import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser,selectedMessages,deleteSelectedMessages } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
  <div className="flex items-center justify-between">
    
    {/* Left side: Avatar + User info */}
    <div className="flex items-center gap-3">
      <div className="avatar">
        <div className="size-10 rounded-full relative">
          <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
        </div>
      </div>

      <div>
        <h3 className="font-medium">{selectedUser.fullName}</h3>
        <p className="text-sm text-base-content/70">
          {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
        </p>
      </div>
    </div>

    {/* Right side: Delete and Close buttons */}
    <div className="flex items-center gap-3">
      {/* Delete button (conditionally rendered) */}
      <button
        onClick={deleteSelectedMessages}
        className="btn "
        disabled={selectedMessages.length === 0}
      >
        Delete Message ({selectedMessages.length})
      </button>

      {/* Close button */}
      <button onClick={() => setSelectedUser(null)} className="btn btn-ghost">
        <X />
      </button>
    </div>
  </div>
</div>

  );
};
export default ChatHeader;
