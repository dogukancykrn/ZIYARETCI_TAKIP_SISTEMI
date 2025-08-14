import axios from "axios";

// API URL ayarı - backend port 5160'ta çalışıyor
// Vercel ve local ortamlar için API adresini env üzerinden alıyoruz (REACT_APP_API_URL)
const API_URL = process.env.REACT_APP_API_URL || ' https://ziyaretci-takip-sistemi.onrender.com/auth/login';  // Direkt backend URL'si
console.log("API URL:", API_URL);

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