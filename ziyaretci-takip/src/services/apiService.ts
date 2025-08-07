import axios, { AxiosResponse } from 'axios';
import { Admin, Visitor, LoginFormData, VisitorFormData, AuthResponse, ApiResponse, VisitorFilter } from '../types';

// Axios instance oluşturun
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor - Her istekte token ekler
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Token süresinin dolması durumunda logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  // Admin login
  login: async (loginData: LoginFormData): Promise<AuthResponse> => {
    console.log('authService.login çağrıldı:', loginData);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
    
    try {
      const response: AxiosResponse<any> = await api.post('/auth/login', loginData);
      console.log('API yanıt başarılı:', response.data);
      
      // Backend'den gelen data formatını AuthResponse'a dönüştür
      const backendData = response.data.data; // Backend'de data.data formatında geliyor
      const authResponse: AuthResponse = {
        token: backendData.token,
        admin: {
          id: backendData.admin.id,
          fullName: backendData.admin.fullName,
          phoneNumber: backendData.admin.phoneNumber,
          email: backendData.admin.email,
          role: backendData.admin.role
        }
      };
      
      return authResponse;
    } catch (error) {
      console.error('API hatası:', error);
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Update Profile
  updateProfile: async (profileData: { fullName: string; email: string; phoneNumber: string }): Promise<Admin> => {
    try {
      const response: AxiosResponse<any> = await api.put('/auth/profile', profileData);
      return response.data.admin;
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      throw error;
    }
  },

  // Change Password
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const response: AxiosResponse<any> = await api.post('/auth/change-password', data);
      return response.data;
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      throw error;
    }
  },

  // Register Admin
  registerAdmin: async (adminData: {
    firstName: string;
    lastName: string;
    tcNumber: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string; data: any }> => {
    try {
      const response: AxiosResponse<any> = await api.post('/auth/register-admin', adminData);
      return response.data;
    } catch (error) {
      console.error('Admin kayıt hatası:', error);
      throw error;
    }
  },
};

// Visitor Services
export const visitorService = {
  // Yeni ziyaretçi ekle
  createVisitor: async (visitorData: VisitorFormData): Promise<Visitor> => {
    const response: AxiosResponse<any> = await api.post('/visitor', visitorData);
    return response.data.data; // Backend { success, message, data } formatında döndürüyor
  },

  // Aktif ziyaretçileri getir (çıkış yapmamış olanlar)
  getActiveVisitors: async (): Promise<Visitor[]> => {
    const response: AxiosResponse<any> = await api.get('/visitor/active');
    return response.data.data; // Backend { success, message, data } formatında döndürüyor
  },

  // Tüm ziyaretçi geçmişini getir
  getVisitorHistory: async (filters?: VisitorFilter): Promise<Visitor[]> => {
    if (filters) {
      const response: AxiosResponse<any> = await api.post('/visitor/filter', filters);
      return response.data.data;
    } else {
      const response: AxiosResponse<any> = await api.get('/visitor/history');
      return response.data.data;
    }
  },

  // Ziyaretçi çıkışı
  exitVisitor: async (visitorId: number): Promise<Visitor> => {
    const response: AxiosResponse<any> = await api.post(`/visitor/${visitorId}/exit`);
    return response.data.data;
  },

  // TC ile ziyaretçi çıkışı
  exitVisitorByTC: async (tcNumber: string): Promise<Visitor> => {
    const response: AxiosResponse<any> = await api.patch(`/visitor/${tcNumber}/exit`);
    return response.data.data;
  },

  // İstatistikleri getir
  getStatistics: async (): Promise<any> => {
    const response: AxiosResponse<any> = await api.get('/visitor/statistics');
    return response.data.data;
  },
};

export default api;
