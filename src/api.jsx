import axios from "axios";

// Vite mein import.meta.env use karo, process.env nahi
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ===== REQUEST INTERCEPTOR =====
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// ===== RESPONSE INTERCEPTOR =====
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - redirecting to login");
      localStorage.clear();
      window.location.href = '/userlogin';
    }

    if (error.response?.status === 403) {
      console.error("Access forbidden");
    }

    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;
