import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api.js";

export const useAuthStore = create(persist((set) => ({
  user: null,
  email: null,
  token: null,
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
      const response = await api.post("/auth/register", { name, email, password });
      set({ user: response.data });
    } catch (error) {
      set({ error: error.response?.data?.message || "Registration failed", loading: false });
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
      set({ user: response.data.user, loading: false });
      return true;
    } catch (error) {
      console.error("[DEBUG] Profile update error:", error.response?.data || error.message);
      set({ error: error.response?.data?.message || "Profile update failed", loading: false });
      return false;
    }
  },
  logout: () => set({ user: null }),
})));
