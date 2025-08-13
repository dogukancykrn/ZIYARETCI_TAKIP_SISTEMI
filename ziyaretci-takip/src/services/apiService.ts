// Axios HTTP client tipini içe aktarıyoruz
import { AxiosResponse } from "axios";
// Tip tanımlarını içe aktarıyoruz
import { Admin, Visitor, LoginFormData, VisitorFormData, AuthResponse } from "../types";
// API istemci konfigürasyonunu içe aktarıyoruz
import { API } from './api';

// Ziyaretçi filtreleme için interface tanımı (types'tan alınmamışsa burada tanımla)
export interface VisitorFilter {
  startDate?: string;   // Başlangıç tarihi (opsiyonel)
  endDate?: string;     // Bitiş tarihi (opsiyonel)
  tcNumber?: string;    // TC kimlik numarası (opsiyonel)
  [key: string]: any;   // Diğer filtreleme seçenekleri
}

// Kimlik doğrulama servislerinin interface'i
interface IAuthService {
  // Giriş yapma fonksiyonu
  login(loginData: LoginFormData): Promise<AuthResponse>;
  // Çıkış yapma fonksiyonu
  logout(): Promise<void>;
  // Profil güncelleme fonksiyonu
  updateProfile(profileData: { fullName: string; email: string; phoneNumber: string }): Promise<Admin>;
  // Şifre değiştirme fonksiyonu
  changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }>;
  // Yeni admin kaydetme fonksiyonu
  registerAdmin(adminData: any): Promise<{ success: boolean; message: string; data: any }>;
}

// Ziyaretçi servislerinin interface'i
interface IVisitorService {
  // Yeni ziyaretçi oluşturma fonksiyonu
  createVisitor(visitorData: VisitorFormData): Promise<Visitor>;
  // Aktif ziyaretçileri getirme fonksiyonu
  getActiveVisitors(): Promise<Visitor[]>;
  // Ziyaretçi geçmişini getirme fonksiyonu (filtrelenebilir)
  getVisitorHistory(filters?: VisitorFilter): Promise<Visitor[]>;
  // Ziyaretçi çıkışı yapma fonksiyonu (ID ile)
  exitVisitor(visitorId: number): Promise<Visitor>;
  // Ziyaretçi çıkışı yapma fonksiyonu (TC ile)
  exitVisitorByTC(tcNumber: string): Promise<Visitor>;
  // İstatistikleri getirme fonksiyonu
  getStatistics(): Promise<any>;
  // Analytics fonksiyonları
  getDateRangeAnalytics(startDate: string, endDate: string): Promise<any>;
  getPeakHoursAnalysis(): Promise<any>;
  getTrendAnalysis(): Promise<any>;
  getDurationAnalysis(): Promise<any>;
  getHeatmapData(): Promise<any>;
  getReasonDistribution(): Promise<any>;
}

// API URL'sini konsola yazdır (debug amaçlı)
console.log("📢 API URL:", process.env.NEXT_PUBLIC_API_URL);

// KİMLİK DOĞRULAMA SERVİSLERİ
export const authService: IAuthService = {
  // Admin giriş fonksiyonu
  login: async (loginData: LoginFormData): Promise<AuthResponse> => {
    console.log('authService.login çağrıldı:', loginData);
    
    try {
      // API'ye giriş isteği gönder
      const response: AxiosResponse<any> = await API.post('/auth/login', loginData);
      console.log('API yanıt:', response.data);
      
      // API'den gelen yanıtın formatını kontrol et
      if (!response.data?.success || !response.data?.data?.token) {
        throw new Error('Invalid response format from server');
      }

      // Backend'den gelen datayı AuthResponse formatına dönüştür
      const authResponse: AuthResponse = {
        token: response.data.data.token,
        admin: {
          id: response.data.data.admin.id,
          fullName: response.data.data.admin.fullName,
          phoneNumber: response.data.data.admin.phoneNumber,
          email: response.data.data.admin.email,
          role: response.data.data.admin.role || 'user'
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
    await API.post('/auth/logout');
  },

  // Update Profile
  updateProfile: async (profileData: { fullName: string; email: string; phoneNumber: string }): Promise<Admin> => {
    try {
      const response: AxiosResponse<any> = await API.put('/auth/profile', profileData);
      return response.data.admin;
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      throw error;
    }
  },

  // Change Password
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const response: AxiosResponse<any> = await API.post('/auth/change-password', data);
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
    managerEmail: string;
  }): Promise<{ success: boolean; message: string; data: any }> => {
    try {
      const response: AxiosResponse<any> = await API.post('/auth/register-admin', adminData);
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
    const response: AxiosResponse<any> = await API.post('/visitor', visitorData);
    return response.data.data; // Backend { success, message, data } formatında döndürüyor
  },

  // Aktif ziyaretçileri getir (çıkış yapmamış olanlar)
  getActiveVisitors: async (): Promise<Visitor[]> => {
    const response: AxiosResponse<any> = await API.get('/visitor/active');
    return response.data.data; // Backend { success, message, data } formatında döndürüyor
  },

  // Tüm ziyaretçi geçmişini getir
  getVisitorHistory: async (filters?: VisitorFilter): Promise<Visitor[]> => {
    try {
      let response: AxiosResponse<any>;
      
      if (filters) {
        response = await API.post('/visitor/filter', filters);
      } else {
        response = await API.get('/visitor/history');
      }
      
      // Sonuçları tersine çevir (en yeni en üstte olacak)
      const visitors = response.data.data || [];
      return visitors.sort((a: Visitor, b: Visitor) => {
        // Önce aktif ziyaretçileri göster (çıkış yapmamış olanlar)
        if (!a.exitedAt && b.exitedAt) return -1;
        if (a.exitedAt && !b.exitedAt) return 1;
        
        // Aynı durumdakileri tarihe göre sırala (yeni → eski)
        return new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime();
      });
    } catch (error) {
      console.error('Ziyaretçi geçmişi alınamadı:', error);
      return [];
    }
  },

  // Ziyaretçi çıkışı
  exitVisitor: async (visitorId: number): Promise<Visitor> => {
    const response: AxiosResponse<any> = await API.patch(`/visitor/${visitorId}/exit`);
    return response.data.data;
  },

  // TC ile ziyaretçi çıkışı
  exitVisitorByTC: async (tcNumber: string): Promise<Visitor> => {
    const response: AxiosResponse<any> = await API.patch(`/visitor/${tcNumber}/exit`);
    return response.data.data;
  },

  // İstatistikleri getir
  getStatistics: async (): Promise<any> => {
    const response: AxiosResponse<any> = await API.get('/visitor/statistics');
    return response.data.data;
  },

  // ==================== ANALİTİK SERVİSLERİ ====================
  
  // Tarih aralığına göre analiz (GET query param)
  getDateRangeAnalytics: async (startDate: string, endDate: string): Promise<any> => {
    const response: AxiosResponse<any> = await API.get('/visitor/analytics/date-range', {
      params: { startDate, endDate }
    });
    return response.data.data;
  },

  // Saatlik tepe saatler analizi
  getPeakHoursAnalysis: async (): Promise<any> => {
    const response: AxiosResponse<any> = await API.get('/visitor/analytics/peak-hours');
    return response.data.data;
  },

  // Trend analizi
  getTrendAnalysis: async (): Promise<any> => {
    const response: AxiosResponse<any> = await API.get('/visitor/analytics/trends');
    return response.data.data;
  },

  // Süre analizi
  getDurationAnalysis: async (): Promise<any> => {
    const response: AxiosResponse<any> = await API.get('/visitor/analytics/duration-analysis');
    return response.data.data;
  },

  // Yoğunluk haritası
  getHeatmapData: async (): Promise<any> => {
    const response: AxiosResponse<any> = await API.get('/visitor/analytics/heatmap');
    return response.data.data;
  },

  // Ziyaret nedeni dağılımı
  getReasonDistribution: async (): Promise<any> => {
    const response: AxiosResponse<any> = await API.get('/visitor/analytics/reason-distribution');
    return response.data.data;
  },
};