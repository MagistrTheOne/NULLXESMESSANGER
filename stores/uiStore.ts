import { create } from "zustand";

interface UIState {
  drawerOpen: boolean;
  theme: "dark" | "light";
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  setTheme: (theme: "dark" | "light") => void;
}

export const useUIStore = create<UIState>((set) => ({
  drawerOpen: false,
  theme: "dark",
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),
  setTheme: (theme) => set({ theme }),
}));

