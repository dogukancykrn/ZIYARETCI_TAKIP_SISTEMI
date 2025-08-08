import { AxiosResponse } from "axios";
import { Admin, Visitor, LoginFormData, VisitorFormData, AuthResponse, VisitorFilter } from '../types';
import { api } from './api';

interface IAuthService {
  login(loginData: LoginFormData): Promise<AuthResponse>;
  logout(): Promise<void>;
  updateProfile(profileData: { fullName: string; email: string; phoneNumber: string }): Promise<Admin>;
  changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }>;
  registerAdmin(adminData: any): Promise<{ success: boolean; message: string; data: any }>;
}

interface IVisitorService {
  createVisitor(visitorData: VisitorFormData): Promise<Visitor>;
  getActiveVisitors(): Promise<Visitor[]>;
  getVisitorHistory(filters?: VisitorFilter): Promise<Visitor[]>;
  exitVisitor(visitorId: number): Promise<Visitor>;
  exitVisitorByTC(tcNumber: string): Promise<Visitor>;
  getStatistics(): Promise<any>;
}

// API URL'i konsola yazdır
console.log("📢 API URL:", process.env.NEXT_PUBLIC_API_URL);

// Auth Services
export const authService: IAuthService = {
  // Admin login
  login: async (loginData: LoginFormData): Promise<AuthResponse> => {
    console.log('authService.login çağrıldı:', loginData);
    
    try {
      const response: AxiosResponse<any> = await api.post('/auth/login', loginData);
      console.log('API yanıt:', response.data);
      
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response format from server');
      }

      // Backend'den gelen datayı AuthResponse'a dönüştür
      const authResponse: AuthResponse = {
        token: response.data.token,
        admin: {
          id: response.data.admin.id,
          fullName: response.data.admin.fullName,
          phoneNumber: response.data.admin.phoneNumber,
          email: response.data.admin.email,
          role: response.data.admin.role || 'user'
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
export const visitorService: IVisitorService = {
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