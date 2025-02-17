import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";

export const useChatStore = create((set) => ({
  currentChat: null,
  chats: [],
  messages: [],
  fetchChats: async () => {
    try {
      const response = await axiosInstance.get(`/chat/chats/`);
      // console.log(response?.data)
      set({ chats: response.data });
    } catch (err) {
      console.error(err);
    }
  },
  setCurrentChat: (chat) => set({ currentChat: chat }),
  setChats: (chats) => set({ chats }),
  deleteMessage:  (messageId) => set((state) => ({ messages: state.messages.filter((message) => message.id !== messageId) })),

  addVoiceMessage:(message)=> set((state)=>({messages:[...state.messages,message]})),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
}));
