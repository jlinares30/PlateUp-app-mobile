import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import api from "../lib/api.js";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      email: null,
      token: null,
      image: null,
      loading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      login: async (email, password) => {
        try {
          set({ loading: true, error: null });
          const response = await api.post("/auth/login", { email, password });
          console.log("✅ Login successful");
          set({
            user: response.data.user,
            token: response.data.token,
            email: response.data.user.email,
            loading: false
          });
          return true;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Login failed",
            loading: false
          });
          console.error("❌ Login error:", error);
          return false;
        }
      },

      register: async (name, email, password) => {
        try {
          set({ loading: true, error: null });
          const response = await api.post("/auth/register", { name, email, password });
          set({ user: response.data, loading: false });
          return true;
        } catch (error) {
          const errorMessage = error.response?.data?.error || error.response?.data?.message || "Registration failed";
          set({ error: errorMessage, loading: false });
          return errorMessage;
        }
      },

      updateProfile: async (data) => {
        try {
          set({ loading: true, error: null });
          const response = await api.put("/auth/profile", data, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          set({
            user: response.data.user,
            image: response.data.user.image,
            loading: false
          });
          return true;
        } catch (error) {
          console.error("Profile update error:", error.response?.data || error.message);
          set({
            error: error.response?.data?.message || "Profile update failed",
            loading: false
          });
          return false;
        }
      },

      logout: () => {
        console.log("🚪 Logging out");
        set({
          user: null,
          token: null,
          email: null,
          image: null,
          error: null
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        email: state.email,
        token: state.token,
        image: state.image,
      }),
      onRehydrateStorage: () => (state) => {
        console.log("🔄 Hydration complete");
        state?.setHasHydrated(true);
      },
    }
  )
);