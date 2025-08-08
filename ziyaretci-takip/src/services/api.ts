import axios from "axios";

// Konsolda kontrol et
console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // sadece path kullanabilmek için
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - Her istekte token ekler
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);