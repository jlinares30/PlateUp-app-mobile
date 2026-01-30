import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api.js";

export const useAuthStore = create(persist((set) => ({
  user: null,
  _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
  email: null,
  token: null,
  image: null,
  loading: false,
  error: null,
  login: async (email, password) => {
    try {
      set({ loading: true });
      const response = await api.post("/auth/login", { email, password });
      set({ user: response.data.user });
      console.log("User data:", response.data.user);
      set({ token: response.data.token, loading: false });
      console.log("response.data.token:", response.data.token);
      set({ email: response.data.user.email });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || "Login failed", loading: false });
      console.error("Login error:", error);
      return false;
    }
  },
  register: async (name, email, password) => {
    try {
      set({ loading: true });
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
      set({ loading: true });
      console.log("[DEBUG] Updating profile with data:", data);
      const response = await api.put("/auth/profile", data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("[DEBUG] Update profile response:", response.data);
      set({ user: response.data.user, image: response.data.user.image, loading: false });
      return true;
    } catch (error) {
      console.error("[DEBUG] Profile update error:", error.response?.data || error.message);
      set({ error: error.response?.data?.message || "Profile update failed", loading: false });
      return false;
    }
  },
  logout: () => set({ user: null }),
})));
