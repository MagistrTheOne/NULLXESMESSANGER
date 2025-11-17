import { deleteAuthToken, setAuthToken } from "@/lib/utils/secureStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
  id: string;
  phone: string;
  name?: string;
  avatar?: string;
  status?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null, token?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: async (user, token) => {
        if (user && token) {
          await setAuthToken(token);
        }
        set({ user, isAuthenticated: !!user });
      },
      logout: async () => {
        await deleteAuthToken();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

