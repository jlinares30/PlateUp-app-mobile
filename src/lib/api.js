import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 60000,
});

api.interceptors.request.use(async (config) => {
  try {
    const { useAuthStore } = await import("../store/useAuth");
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error("Error setting auth header", e);
  }
  return config;
});

// Añade interceptores para ver qué se está enviando
api.interceptors.request.use(
  (config) => {
    console.log('📤 Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData' : config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;