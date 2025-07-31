import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import ProfileContainer from "./ProfileContainer";


const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    selectedMessages,
    toggleSelectMessage,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Scroll and socket logic
  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUser?._id) {
      useChatStore.getState().setSelectedMessages([]);
    }
  }, [selectedUser?._id]);

  return (
    <div className="flex flex-1">
      {/* Left: Chat section */}
      <div className="flex flex-col flex-1">
        <ChatHeader />

        {selectedUser ? (
          isMessagesLoading ? (
            <>
              <MessageSkeleton />
              <MessageInput />
            </>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                    ref={messageEndRef}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(message._id)}
                      onChange={() => toggleSelectMessage(message._id)}
                      className="mr-2"
                    />
                    <div className="chat-image avatar">
                      <div className="size-10 rounded-full border">
                        <img
                          src={
                            message.senderId === authUser._id
                              ? authUser.profilePic || "/avatar.png"
                              : selectedUser.profilePic || "/avatar.png"
                          }
                          alt="profile pic"
                        />
                      </div>
                    </div>
                    <div className="chat-header mb-1">
                      <time className="text-xs opacity-50 ml-1">
                        {formatMessageTime(message.createdAt)}
                      </time>
                    </div>
                    <div className="chat-bubble flex flex-col">
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="sm:max-w-[200px] rounded-md mb-2"
                        />
                      )}
                      {message.text && <p>{message.text}</p>}
                    </div>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
              <MessageInput />
            </>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-400">
            Select a user to start chatting 💬
          </div>
        )}
      </div>

      {/* Right: Profile Section */}
       <div className="w-[250px] border-l border-zinc-300 hidden md:block">
        <ProfileContainer />
      </div> 
    </div>
  );
};

export default ChatContainer;
