import axios from "axios";

// API URL ayarı - backend port 5160'ta çalışıyor
const API_URL = '';  // Proxy kullanıldığı için baseURL boş kalabilir
console.log("Proxy ile API kullanılıyor (Port 5160)");

export const API = axios.create({
  baseURL: API_URL, 
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - Her istekte token ekler
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);