import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type FavoriteType = "message" | "media" | "link";

export interface Favorite {
  id: string;
  userId: string;
  type: FavoriteType;
  messageId?: string;
  chatId?: string;
  content?: string;
  metadata?: any;
  createdAt: Date;
}

interface FavoritesState {
  favorites: Favorite[];
  addFavorite: (favorite: Omit<Favorite, "id" | "createdAt">) => void;
  removeFavorite: (id: string) => void;
  getFavoritesByType: (type: FavoriteType) => Favorite[];
  isFavorite: (messageId: string) => boolean;
  setFavorites: (favorites: Favorite[]) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (favorite) =>
        set((state) => ({
          favorites: [
            ...state.favorites,
            {
              ...favorite,
              id: `fav-${Date.now()}-${Math.random()}`,
              createdAt: new Date(),
            },
          ],
        })),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.id !== id),
        })),
      getFavoritesByType: (type) => {
        return get().favorites.filter((fav) => fav.type === type);
      },
      isFavorite: (messageId) => {
        return get().favorites.some((fav) => fav.messageId === messageId);
      },
      setFavorites: (favorites) => set({ favorites }),
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

