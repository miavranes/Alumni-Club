// frontend/src/services/api.ts
import axios from "axios";

// IMPORTANT:
// VITE_API_URL must be something like: http://localhost:4000
// NOT http://localhost:4000/api
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
