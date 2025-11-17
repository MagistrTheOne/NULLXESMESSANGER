import { create } from "zustand";

interface Chat {
  id: string;
  type: "private" | "group" | "channel";
  name?: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount?: number;
  isPinned?: boolean;
  onlineStatus?: "online" | "offline" | "recently";
}

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  removeChat: (id: string) => void;
  setActiveChat: (id: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChatId: null,
  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  updateChat: (id, updates) =>
    set((state) => ({
      chats: state.chats.map((chat) => (chat.id === id ? { ...chat, ...updates } : chat)),
    })),
  removeChat: (id) => set((state) => ({ chats: state.chats.filter((chat) => chat.id !== id) })),
  setActiveChat: (id) => set({ activeChatId: id }),
}));

