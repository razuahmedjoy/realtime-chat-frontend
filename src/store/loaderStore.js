import { create } from "zustand";

export const useLoaderStore = create((set) => ({
  isLoading: false,
  setLoading: (state) => set({ isLoading: state }),
}));
