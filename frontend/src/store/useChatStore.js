import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // ✅ NEW: Store unread message counts
  unreadMessages: {},
  selectedMessages: [],

  // ✅ NEW: Add unread message
  addUnreadMessage: (userId) =>
    set((state) => {
      const currentCount = state.unreadMessages[userId] || 0;

      // Reorder users - bring sender to top
      const userIndex = state.users.findIndex((u) => u._id === userId);
      let newUsers = [...state.users];
      if (userIndex !== -1) {
        const [user] = newUsers.splice(userIndex, 1);
        newUsers.unshift(user);
      }

      return {
        unreadMessages: {
          ...state.unreadMessages,
          [userId]: currentCount + 1,
        },
        users: newUsers,
      };
    }),

  // ✅ NEW: Clear unread messages on chat open
  clearUnreadMessages: (userId) =>
    set((state) => {
      const { [userId]: removed, ...rest } = state.unreadMessages;
      return { unreadMessages: rest };
    }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const state = get();
      const isCurrentChatOpen = state.selectedUser && newMessage.senderId === state.selectedUser._id;

      if (isCurrentChatOpen) {
        set({ messages: [...state.messages, newMessage] });
      } else {
        // ✅ Trigger unread count increase
        get().addUnreadMessage(newMessage.senderId);
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      get().clearUnreadMessages(selectedUser._id); // ✅ Reset unread count
    }
  },

 

  setSelectedMessages: (messages) => set({ selectedMessages: messages }),
toggleSelectMessage: (messageId) =>
  set((state) => {
    const selected = state.selectedMessages.includes(messageId);
    return {
      selectedMessages: selected
        ? state.selectedMessages.filter((id) => id !== messageId)
        : [...state.selectedMessages, messageId],
    };
  }),

clearSelectedMessages: () => set({ selectedMessages: [] }),

  deleteSelectedMessages: async () => {
  const { selectedMessages, messages } = get();
  try {
    await Promise.all(
      selectedMessages.map((id) => axiosInstance.delete(`/messages/${id}`))
    );
    set({
      messages: messages.filter((msg) => !selectedMessages.includes(msg._id)),
      selectedMessages: [],
    });
    toast.success("Selected messages deleted");
  } catch (error) {
    toast.error("Failed to delete some messages");
  }
},

}));


