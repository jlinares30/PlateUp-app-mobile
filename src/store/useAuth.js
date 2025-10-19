import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api.js";

export const useAuthStore = create(persist((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  login: async (email, password) => {
    try {
      set({ loading: true });
      const response = await api.post("/auth/login", { email, password });
      console.log("User data:", response.data);
      set({ user: response.data.user });
      set({ token: response.data.token, loading: false });
        console.log("response.data.token:", response.data.token);
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || "Login failed", loading: false });
      console.error("Login error:", error);
      return false;
    }
  },
  register: async (email, password) => {
    try {
      const response = await api.post("/auth/register", { email, password });
      set({ user: response.data });
    } catch (error) {
      set({ error: error.response?.data?.message || "Registration failed", loading: false });
    }
  },
  logout: () => set({ user: null }),
})));
  