import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      userData: null,
      setAuth: (data) =>
        set({ isAuthenticated: !!data.access, accessToken: data.access, userData: data.user }),
      logout: () => set({ isAuthenticated: false, accessToken: null, userData: null }),
    }),
    { name: "auth-store" }
  )
);
