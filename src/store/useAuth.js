import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import api from "../lib/api.js";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      _hasHydrated: false,
      email: null,
      token: null,
      image: null,
      loading: false,
      error: null,
      
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
      
      login: async (email, password) => {
        try {
          set({ loading: true, error: null });
          const response = await api.post("/auth/login", { email, password });
          console.log("Login successful:", response.data.user);
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
          console.error("Login error:", error);
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
          console.log("[DEBUG] Updating profile with data:", data);
          const response = await api.put("/auth/profile", data, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log("[DEBUG] Update profile response:", response.data);
          set({ 
            user: response.data.user, 
            image: response.data.user.image, 
            loading: false 
          });
          return true;
        } catch (error) {
          console.error("[DEBUG] Profile update error:", error.response?.data || error.message);
          set({ 
            error: error.response?.data?.message || "Profile update failed", 
            loading: false 
          });
          return false;
        }
      },
      
      logout: () => {
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
      onRehydrateStorage: () => (state) => {
        console.log("Starting hydration...");
        return (hydratedState, error) => {
          if (error) {
            console.error("Hydration error:", error);
          }
          if (hydratedState) {
            console.log("Hydration complete:", {
              hasUser: !!hydratedState.user,
              hasToken: !!hydratedState.token
            });
            hydratedState.setHasHydrated(true);
          }
        };
      },
    }
  )
);