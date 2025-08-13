// React hook'ları ve context API'sini içe aktarıyoruz
import React, { createContext, useContext, useReducer, useEffect } from 'react';
// Admin tipi tanımını içe aktarıyoruz
import { Admin } from '../types';

// Kimlik doğrulama durumunu tanımlayan interface
interface AuthState {
  isAuthenticated: boolean; // Kullanıcının giriş yapıp yapmadığını belirtir
  admin: Admin | null;      // Giriş yapmış admin bilgileri (null ise giriş yapılmamış)
  token: string | null;     // JWT token bilgisi (null ise token yok)
  loading: boolean;         // Yükleme durumu (sayfa ilk açıldığında true)
}

// Kimlik doğrulama action'larını tanımlayan interface
interface AuthAction {
  type: 'LOGIN_SUCCESS' | 'LOGOUT' | 'SET_LOADING' | 'UPDATE_PROFILE'; // Action türleri
  payload?: any; // Action ile gönderilen veri (opsiyonel)
}

// Auth state'inin başlangıç değerleri
const initialState: AuthState = {
  isAuthenticated: false, // Başlangıçta giriş yapılmamış
  admin: null,           // Admin bilgisi yok
  token: null,           // Token yok
  loading: true,         // Sayfa ilk açıldığında yükleniyor
};

// Auth state'ini yöneten reducer fonksiyonu
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    // Başarılı giriş durumu
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,                // Giriş durumunu true yap
        admin: action.payload.admin,          // Admin bilgilerini kaydet
        token: action.payload.token,          // Token'ı kaydet
        loading: false,                       // Yükleme tamamlandı
      };
    // Profil güncelleme durumu
    case 'UPDATE_PROFILE':
      // Mevcut admin bilgileri ile yeni bilgileri birleştir
      const updatedAdmin = { ...state.admin, ...action.payload };
      // Güncellenen admin bilgilerini localStorage'a kaydet
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));
      return {
        ...state,
        admin: updatedAdmin, // State'i güncelle
      };
    // Çıkış yapma durumu
    case 'LOGOUT':
      // localStorage'dan token ve admin bilgilerini sil
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      return {
        ...state,
        isAuthenticated: false, // Giriş durumunu false yap
        admin: null,           // Admin bilgilerini sıfırla
        token: null,           // Token'ı sıfırla
        loading: false,        // Yükleme durumunu false yap
      };
    // Yükleme durumunu ayarlama
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload, // Payload'dan gelen değeri yükleme durumuna ata
      };
    // Bilinmeyen action tipi durumunda mevcut state'i döndür
    default:
      return state;
  }
};

// AuthContext'in sahip olacağı fonksiyon ve değerleri tanımlayan interface
interface AuthContextType {
  state: AuthState;                                           // Auth state'i
  admin: Admin | null;                                        // Admin bilgileri
  isAuthenticated: boolean;                                   // Giriş durumu
  token: string | null;                                       // JWT token
  loading: boolean;                                           // Yükleme durumu
  login: (token: string, admin: Admin) => void;              // Giriş yapma fonksiyonu
  logout: () => void;                                         // Çıkış yapma fonksiyonu
  updateProfile: (profileData: Partial<Admin>) => void;      // Profil güncelleme fonksiyonu
}

// AuthContext'i oluştur - başlangıçta undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider bileşeni - context değerlerini çocuk bileşenlere sağlar
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // useReducer hook'u ile state ve dispatch'i al
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Bileşen mount olduğunda localStorage'dan kimlik bilgilerini kontrol et
  useEffect(() => {
    // localStorage'dan token ve admin bilgisini al
    const token = localStorage.getItem('token');
    const adminData = localStorage.getItem('admin');
    
    // Eğer token ve admin verisi varsa
    if (token && adminData) {
      try {
        // Admin verisini JSON'dan parse et
        const admin = JSON.parse(adminData);
        // Başarılı giriş action'ını dispatch et
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, admin }
        });
      } catch (error) {
        // JSON parse hatası durumunda console'a yazdır ve localStorage'ı temizle
        console.error('localStorage admin data parse error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        // Yükleme durumunu false yap
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      // Token veya admin verisi yoksa yükleme durumunu false yap
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []); // Dependency array boş - sadece mount olduğunda çalış

  // Giriş yapma fonksiyonu - token ve admin bilgilerini localStorage'a kaydet ve state'i güncelle
  const login = (token: string, admin: Admin) => {
    localStorage.setItem('token', token);                    // Token'ı localStorage'a kaydet
    localStorage.setItem('admin', JSON.stringify(admin));   // Admin bilgilerini localStorage'a kaydet
    // Başarılı giriş action'ını dispatch et
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { token, admin }
    });
  };

  // Çıkış yapma fonksiyonu - logout action'ını dispatch et
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Profil güncelleme fonksiyonu - partial admin bilgileri ile güncelleme yap
  const updateProfile = (profileData: Partial<Admin>) => {
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: profileData
    });
  };

  // Context provider ile değerleri çocuk bileşenlere sağla
  return (
    <AuthContext.Provider value={{ 
      state,                              // Auth state'i
      admin: state.admin,                 // Admin bilgileri
      isAuthenticated: state.isAuthenticated, // Giriş durumu
      token: state.token,                 // JWT token
      loading: state.loading,             // Yükleme durumu
      login,                              // Giriş fonksiyonu
      logout,                             // Çıkış fonksiyonu
      updateProfile                       // Profil güncelleme fonksiyonu
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook'u - AuthContext'i kullanmak için custom hook
export const useAuth = () => {
  // Context'i al
  const context = useContext(AuthContext);
  // Eğer context undefined ise hata fırlat (Provider dışında kullanıldığı anlamına gelir)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Context'i döndür
  return context;
};
