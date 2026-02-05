import axios from "axios";
import { API_URL } from "../../config.js";


const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

api.interceptors.request.use(async (config) => {
  try {
    const { useAuthStore } = await import("../store/useAuth");
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 Request with token:', config.url);
    } else {
      console.log('📤 Request WITHOUT token:', config.url);
    }
  } catch (e) {
    console.error("Error setting auth header", e);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });

    // Si es 401, hacer logout
    if (error.response && error.response.status === 401) {
      console.log("🚪 Session expired, logging out...");
      const { useAuthStore } = await import("../store/useAuth");
      const { logout } = useAuthStore.getState();
      logout();
    }

    return Promise.reject(error);
  }
);

export default api;