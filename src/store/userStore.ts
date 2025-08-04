import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () =>
        set((state) => {
          // Jika ada properti lain di store di masa depan, pastikan hanya user yang direset
          return { ...state, user: null };
        }),
    }),
    {
      name: "user-storage",
    }
  )
);

export default useUserStore;
