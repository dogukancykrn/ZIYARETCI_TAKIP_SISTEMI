// React hook'ları ve bileşenleri içe aktarıyoruz
import React, { useState } from 'react';
// Ant Design UI bileşenlerini içe aktarıyoruz
import { Switch } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
// Context hook'larını içe aktarıyoruz
import { useTheme } from '../context/ThemeContext';        // Tema yönetimi için
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
// Ant Design icon'larını içe aktarıyoruz
import {
  UserAddOutlined,    // Kullanıcı ekleme ikonu
  TeamOutlined,       // Takım/grup ikonu  
  HistoryOutlined,    // Geçmiş ikonu
  LogoutOutlined,     // Çıkış ikonu
  MenuFoldOutlined,   // Menü kapatma ikonu
  MenuUnfoldOutlined, // Menü açma ikonu
  DashboardOutlined,  // Dashboard ikonu
  UserOutlined,       // Kullanıcı ikonu
  UserSwitchOutlined, // Kullanıcı değiştirme ikonu
  BarChartOutlined    // Analytics ikonu
} from '@ant-design/icons';
// Context ve routing hook'larını içe aktarıyoruz
import { useAuth } from '../context/AuthContext';           // Kimlik doğrulama için
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; // React Router için

// Ant Design Layout bileşenlerini destructure ediyoruz
const { Header, Sider, Content } = Layout;
// Typography bileşenlerini destructure ediyoruz
const { Text } = Typography;

// Dashboard ana layout bileşeni - tüm dashboard sayfalarını sarmalayan yapı
const DashboardLayout: React.FC = () => {
  // Sidebar'ın kapalı/açık durumunu yöneten state
  const [collapsed, setCollapsed] = useState(false);
  // Auth context'ten state ve logout fonksiyonunu al
  const { state, logout } = useAuth();
  // Theme context'ten karanlık mod durumu ve toggle fonksiyonunu al
  const { isDarkMode, toggleDarkMode } = useTheme();
  // Sayfa yönlendirme hook'u
  const navigate = useNavigate();
  // Mevcut sayfa konumunu almak için hook
  const location = useLocation();

  // Çıkış yapma işlemi - logout çağır ve login sayfasına yönlendir
  const handleLogout = () => {
    logout();               // Context'teki logout fonksiyonunu çağır
    navigate('/login');     // Login sayfasına yönlendir
  };

  // Profil sayfasına yönlendirme fonksiyonu
  const handleProfileClick = () => {
    navigate('/dashboard/profile');
  };

  // Admin kayıt sayfasına yönlendirme fonksiyonu
  const handleAdminRegister = () => {
    navigate('/admin-register');
  };

  // Kullanıcı dropdown menü öğeleri
  const userMenuItems = [
    {
      key: 'profile',                    // Menü öğesi anahtarı
      icon: <UserOutlined />,           // Profil ikonu
      label: 'Profil',                  // Görüntülenecek metin
    },
    {
      key: 'admin-register',            // Menü öğesi anahtarı
      icon: <UserSwitchOutlined />,     // Kullanıcı değiştirme ikonu
      label: 'Yeni Yönetici Ekle',      // Görüntülenecek metin
    },
    {
      key: 'logout',                    // Menü öğesi anahtarı
      icon: <LogoutOutlined />,         // Çıkış ikonu
      label: 'Çıkış Yap',               // Görüntülenecek metin
    },
  ];

  // Ana sidebar menü öğeleri - dashboard sayfaları
  const menuItems = [
    {
      key: '/dashboard/home',                    // Route anahtarı
      icon: <DashboardOutlined />,              // Dashboard ikonu
      label: 'Ana Sayfa',                       // Görüntülenecek metin
    },
    {
      key: '/dashboard/visitor-registration',   // Route anahtarı
      icon: <UserAddOutlined />,                // Kullanıcı ekleme ikonu
      label: 'Ziyaretçi Kaydı',                 // Görüntülenecek metin
    },
    {
      key: '/dashboard/active-visitors',        // Route anahtarı
      icon: <TeamOutlined />,                   // Takım ikonu
      label: 'Aktif Ziyaretçiler',              // Görüntülenecek metin
    },
    {
      key: '/dashboard/visitor-history',        // Route anahtarı
      icon: <HistoryOutlined />,                // Geçmiş ikonu
      label: 'Ziyaret Geçmişi',                 // Görüntülenecek metin
    },
    {
      key: '/dashboard/analytics',              // Route anahtarı
      icon: <BarChartOutlined />,               // Analytics ikonu
      label: 'Yoğunluk Analizi',                // Görüntülenecek metin
    },
  ];

  // Ana layout render fonksiyonu
  return (
    // Tam ekran yüksekliğinde ana layout container
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sol sidebar - menü ve navigasyon */}
      <Sider trigger={null} collapsible collapsed={collapsed}>
        {/* Uygulama başlığı/logosu - tıklanabilir */}
        <div 
          style={{ 
            height: 32,                          // Yükseklik
            margin: 16,                          // Dış boşluk
            color: 'white',                      // Beyaz metin
            textAlign: 'center',                 // Ortala
            fontSize: '18px',                    // Font boyutu
            fontWeight: 'bold',                  // Kalın yazı
            cursor: 'pointer',                   // El işaretçisi
            transition: 'opacity 0.2s'          // Hover efekti için geçiş
          }}
          onClick={() => navigate('/dashboard/home')}  // Ana sayfaya yönlendir
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'} // Hover efekti
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}    // Hover çıkış
        >
          {/* Sidebar durumuna göre kısaltılmış veya tam başlık */}
          {collapsed ? 'ZTS' : 'Ziyaretçi Takip'}
        </div>
        {/* Ana navigasyon menüsü */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
        <div style={{ textAlign: 'center', marginTop: 'auto', paddingBottom: 16 }}>
          <Switch
            checked={isDarkMode}
            onChange={toggleDarkMode}
            style={{ marginBottom: 8 }}
          />
          <div style={{ color: 'white', fontSize: 11, opacity: 0.8 }}>
            {isDarkMode ? 'Dark' : 'Light'}
          </div>
        </div>
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 16px', 
          background: isDarkMode ? '#141414' : '#fff',
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Space>
            <Text style={{ color: isDarkMode ? '#fff' : undefined }}>Hoş geldiniz, {state.admin?.fullName}</Text>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: ({ key }) => {
                  if (key === 'profile') handleProfileClick();
                  if (key === 'admin-register') handleAdminRegister();
                  if (key === 'logout') handleLogout();
                },
              }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <span>
                <Avatar style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}>
                  {state.admin?.fullName?.charAt(0)?.toUpperCase()}
                </Avatar>
              </span>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: isDarkMode ? '#1f1f1f' : '#fff',
          minHeight: 280
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
