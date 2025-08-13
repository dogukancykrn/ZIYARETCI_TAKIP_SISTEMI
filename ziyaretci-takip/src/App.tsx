// React kütüphanesinden React bileşenini içe aktarıyoruz
import React from "react";
// React Router DOM kütüphanesinden routing bileşenlerini içe aktarıyoruz
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Ant Design UI kütüphanesinden konfigürasyon ve tema bileşenlerini içe aktarıyoruz
import { ConfigProvider, theme, App as AntApp } from 'antd';
// Türkçe dil desteği için Ant Design Türkçe locale'ı içe aktarıyoruz
import trTR from 'antd/locale/tr_TR';
// Kimlik doğrulama context'ı ve hook'ları içe aktarıyoruz
import { AuthProvider, useAuth } from './context/AuthContext';
// Tema yönetimi için context ve hook'ları içe aktarıyoruz
import { ThemeProvider, useTheme } from './context/ThemeContext';
// Uygulama sayfalarını içe aktarıyoruz
import LoginPage from './pages/LoginPage';               // Giriş sayfası
import AdminRegisterPage from './pages/AdminRegisterPage'; // Admin kayıt sayfası
import Dashboard from './pages/Dashboard';               // Ana dashboard sayfası
import VisitorForm from './pages/VisitorForm';           // Ziyaretçi kayıt formu sayfası
import ActiveVisitors from './pages/ActiveVisitors';     // Aktif ziyaretçiler sayfası
import VisitorHistory from './pages/VisitorHistory';     // Ziyaretçi geçmişi sayfası
import VisitorAnalytics from './pages/VisitorAnalytics'; // Ziyaretçi analizi sayfası
import ProfilePage from './pages/ProfilePage';           // Profil sayfası
// Dashboard layout bileşenini içe aktarıyoruz
import DashboardLayout from './components/DashboardLayout';
// Ana CSS stil dosyasını içe aktarıyoruz
import './styles/App.css';

// Ana uygulama içeriği bileşeni - routing ve kimlik doğrulama mantığını yönetir
const AppContent: React.FC = () => {
  // Kimlik doğrulama state'ini context'ten alıyoruz
  const { state } = useAuth();
  // Tema durumunu (karanlık/aydınlık) context'ten alıyoruz
  const { isDarkMode } = useTheme();

  // Eğer uygulama yükleniyorsa loading göster
  if (state.loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    // Ant Design konfigürasyon sağlayıcısı - tema ve dil ayarları
    <ConfigProvider
      theme={{
        // Tema algoritmasını karanlık mod durumuna göre ayarla
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
      locale={trTR} // Türkçe dil desteği
    >
      <AntApp>
        {/* React Router ile sayfa yönlendirme yapısı */}
        <Router>
          <Routes>
            {/* Giriş yapmamış kullanıcı için sadece login ve admin kayıt sayfası */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-register" element={<AdminRegisterPage />} />
          {/* Root (/) her zaman yönlendirilsin - kullanıcı girişi varsa dashboard'a, yoksa login'e */}
          <Route path="/" element={<Navigate to={state.isAuthenticated ? "/dashboard/home" : "/login"} replace />} />
          {/* Kullanıcı giriş yapmamışsa tüm rotaları login'e yönlendir */}
          {!state.isAuthenticated ? (
            <Route path="*" element={<Navigate to="/login" replace />} />
          ) : (
            // Kullanıcı giriş yapmışsa dashboard rotalarını göster
            <Route path="/dashboard/*" element={<DashboardLayout />}>
              <Route path="home" element={<Dashboard />} />
              <Route path="visitor-registration" element={<VisitorForm />} />
              <Route path="active-visitors" element={<ActiveVisitors />} />
              <Route path="visitor-history" element={<VisitorHistory />} />
              <Route path="analytics" element={<VisitorAnalytics />} />
              <Route path="profile" element={<ProfilePage />} />
              {/* Dashboard alt rotalarında varsayılan rota home'a yönlendir */}
              <Route index element={<Navigate to="/dashboard/home" replace />} />
            </Route>
          )}
        </Routes>
      </Router>
      </AntApp>
    </ConfigProvider>
  );
}

// Ana App bileşeni - Provider'ları sarmalayan üst düzey bileşen
const App: React.FC = () => {
  return (
    // Tema yönetimi sağlayıcısını en üst seviyede sarmalıyoruz
    <ThemeProvider>
      {/* Tema durumunu kullanan alt bileşen */}
      <ThemeConsumerApp />
    </ThemeProvider>
  );
};

// Tema durumunu kullanan ve kimlik doğrulama sağlayıcısını sarmalayan bileşen
const ThemeConsumerApp: React.FC = () => {
  // Tema context'inden karanlık mod durumunu alıyoruz
  const { isDarkMode } = useTheme();
  return (
    // Ant Design konfigürasyonu ve tema ayarları
    <ConfigProvider
      locale={trTR} // Türkçe dil desteği
      theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }} // Tema algoritması
    >
      {/* Kimlik doğrulama state'ini yöneten provider */}
      <AuthProvider>
        {/* Ana uygulama içeriği */}
        <AppContent />
      </AuthProvider>
    </ConfigProvider>
  );
};

// App bileşenini varsayılan export olarak dışa aktarıyoruz
export default App;
