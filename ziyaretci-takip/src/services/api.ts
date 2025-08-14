import axios from "axios";

// API URL ayarı - backend port 5160'ta çalışıyor
// Vercel ve local ortamlar için API adresini env üzerinden alıyoruz (REACT_APP_API_URL)
const API_URL = process.env.REACT_APP_API_URL || 'https://ziyaretci-takip-sistemi.onrender.com';  
console.log("API URL:", API_URL);

export const API = axios.create({
  baseURL: `${API_URL}/api`,  // /api prefix'ini baseURL'e ekliyoruz
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - Her istekte token ekler
API.interceptors.request.use(
  (config) => {
    console.log("API isteği gönderiliyor:", config.baseURL + config.url);
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);