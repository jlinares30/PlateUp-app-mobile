import axios from "axios";

const api = axios.create({
  //for real device
  //baseURL: "http://192.168.105.204:5001/api",

  //for android emulator
  baseURL: "http://10.0.2.2:5001/api",
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  try {
    const { useAuthStore } = require("../store/useAuth");
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error("Error setting auth header", e);
  }
  return config;
});

export default api;