import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AnnaMessage {
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

interface AnnaState {
  conversations: Record<string, AnnaMessage[]>;
  activeConversationId: string | null;
  mode: "normal" | "tech";
  isGenerating: boolean;
  setMode: (mode: "normal" | "tech") => void;
  addMessage: (conversationId: string, message: AnnaMessage) => void;
  setMessages: (conversationId: string, messages: AnnaMessage[]) => void;
  setActiveConversation: (id: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  clearConversation: (conversationId: string) => void;
}

export const useAnnaStore = create<AnnaState>()(
  persist(
    (set) => ({
      conversations: {},
      activeConversationId: null,
      mode: "normal",
      isGenerating: false,
      setMode: (mode) => set({ mode }),
      addMessage: (conversationId, message) =>
        set((state) => ({
          conversations: {
            ...state.conversations,
            [conversationId]: [...(state.conversations[conversationId] || []), message],
          },
        })),
      setMessages: (conversationId, messages) =>
        set((state) => ({
          conversations: {
            ...state.conversations,
            [conversationId]: messages,
          },
        })),
      setActiveConversation: (id) => set({ activeConversationId: id }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      clearConversation: (conversationId) =>
        set((state) => {
          const newConversations = { ...state.conversations };
          delete newConversations[conversationId];
          return { conversations: newConversations };
        }),
    }),
    {
      name: "anna-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

