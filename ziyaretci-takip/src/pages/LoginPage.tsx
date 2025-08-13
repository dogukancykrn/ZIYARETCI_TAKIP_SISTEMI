// React hook'ları ve bileşenleri içe aktarıyoruz
import React, { useState } from 'react';
// Ant Design icon'larını içe aktarıyoruz
import { UserOutlined, LockOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
// Ant Design UI bileşenlerini içe aktarıyoruz
import { Card, Typography, Form, Input, Button, Alert, Space, Switch } from 'antd';
// Context hook'larını içe aktarıyoruz
import { useAuth } from '../context/AuthContext';           // Kimlik doğrulama için
import { useTheme } from '../context/ThemeContext';         // Tema yönetimi için
// API servislerini içe aktarıyoruz
import { authService } from '../services/apiService';       // Kimlik doğrulama servisleri
// Tip tanımlarını içe aktarıyoruz
import { LoginFormData } from '../types';                   // Giriş formu veri tipi
// React Router navigation hook'unu içe aktarıyoruz
import { useNavigate } from 'react-router-dom';

// Typography'den Title bileşenini destructure ediyoruz
const { Title } = Typography;

// LoginPage bileşeni için props interface'i (şu anda boş)
interface LoginPageProps {}

// Giriş sayfası ana bileşeni
const LoginPage: React.FC<LoginPageProps> = () => {
  // Form yükleme durumu state'i
  const [loading, setLoading] = useState(false);
  // Hata mesajı state'i 
  const [error, setError] = useState<string | null>(null);
  // Auth context'ten login fonksiyonunu al
  const { login } = useAuth();
  // Theme context'ten tema durumu ve toggle fonksiyonunu al
  const { isDarkMode, toggleDarkMode } = useTheme();
  // Sayfa yönlendirme hook'u
  const navigate = useNavigate();

  // Form submit edildiğinde çalışan fonksiyon
  const onFinish = async (values: LoginFormData) => {
    setLoading(true);   // Yükleme durumunu aktif et
    setError(null);     // Önceki hataları temizle
    try {
      // API'ye giriş isteği gönder
      const response = await authService.login(values);
      // Başarılı giriş durumunda login fonksiyonunu çağır
      login(response.token, response.admin);
      // Dashboard ana sayfasına yönlendir
      navigate('/dashboard/home');
    } catch (err: any) {
      // Hata durumunda hata mesajını ayarla
      setError(err.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false); // Her durumda yükleme durumunu kapat
    }
  };

  // Karanlık mod durumuna göre arkaplan gradient'ı
  const backgroundGradient = isDarkMode 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1f1f1f 50%, #262626 75%, #1a1a1a 100%)'
    : 'linear-gradient(135deg, #8B0000 0%, #DC143C 25%, #B22222 50%, #8B0000 75%, #A52A2A 100%)';

  // Karanlık mod durumuna göre kart arkaplan ve kenarlık renkleri
  const cardBackground = isDarkMode ? 'rgba(40, 40, 40, 0.97)' : 'rgba(255,255,255,0.97)';
  const cardBorder = isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)';

  return (
    // Ana container div'i - tam ekran gradient arkaplan
    <div className="gradient-background" style={{ 
      minHeight: '100vh',                // Minimum tam ekran yüksekliği
      display: 'flex',                   // Flexbox layout
      justifyContent: 'center',          // Yatay ortalama
      alignItems: 'center',              // Dikey ortalama
      background: backgroundGradient,    // Dinamik gradient arkaplan
      position: 'relative',              // Absolute positioned elementler için
      padding: '20px'                    // İç boşluk
    }}>
      {/* Karanlık Mod Toggle Butonu - Sağ üst köşe */}
      <div style={{
        position: 'absolute',  // Sabit konumlandırma
        top: '30px',          // Üstten 30px
        right: '30px',        // Sağdan 30px
        zIndex: 1             // Diğer elementlerin üstünde
      }}>
        <Space align="center">
          {/* Güneş ikonu */}
          <SunOutlined style={{ color: 'white', fontSize: '18px' }} />
          {/* Tema değiştirme switch'i */}
          <Switch
            checked={isDarkMode}                                    // Karanlık mod durumu
            onChange={toggleDarkMode}                               // Tema değiştirme fonksiyonu
            checkedChildren={<MoonOutlined />}                      // Açık durumda ay ikonu
            unCheckedChildren={<SunOutlined />}                     // Kapalı durumda güneş ikonu
            style={{ backgroundColor: isDarkMode ? '#52268fff' : '#1890ff' }} // Dinamik renk
          />
          {/* Ay ikonu */}
          <MoonOutlined style={{ color: 'white', fontSize: '18px' }} />
        </Space>
      </div>
      {/* Ziraat Bankası Logo - Sol üst köşe */}
      <div style={{
        position: 'absolute',  // Sabit konumlandırma
        top: '30px',          // Üstten 30px
        left: '30px',         // Soldan 30px
        zIndex: 1             // Diğer elementlerin üstünde
      }}>
        <div style={{
          display: 'flex',        // Flexbox layout
          alignItems: 'center',   // Dikey ortalama
          fontSize: '24px',       // Font boyutu
          fontWeight: 'bold',     // Kalın yazı
          color: isDarkMode ? '#fff' : '#d32f2f' // Dinamik renk
        }}>
          🌾 Ziraat Bankası {/* Emoji ve banka adı */}
        </div>
      </div>

      {/* Dekoratif yüzen daire elementi */}
      <div style={{
        position: 'absolute',               // Sabit konumlandırma
        top: '10%',                        // Üstten %10
        right: '10%',                      // Sağdan %10
        width: '120px',                    // Genişlik
        height: '120px',                   // Yükseklik
        background: 'rgba(255,255,255,0.08)', // Şeffaf beyaz arkaplan
        borderRadius: '50%',               // Daire şekli
        animation: 'float 6s ease-in-out infinite' // Yüzme animasyonu
      }}></div>

      {/* Diğer dekoratif yüzen daire elementleri */}
      <div style={{
        position: 'absolute',               // Sabit konumlandırma
        bottom: '15%',                     // Alttan %15
        left: '8%',                        // Soldan %8
        width: '100px',                    // Genişlik
        height: '100px',                   // Yükseklik
        background: 'rgba(255,255,255,0.08)', // Şeffaf beyaz arkaplan
        borderRadius: '50%',               // Daire şekli
        animation: 'float 4s ease-in-out infinite reverse' // Ters yönde yüzme animasyonu
      }}></div>

      <div style={{
        position: 'absolute',               // Sabit konumlandırma
        top: '60%',                        // Üstten %60
        right: '5%',                       // Sağdan %5
        width: '60px',                     // Genişlik
        height: '60px',                    // Yükseklik
        background: 'rgba(255,255,255,0.06)', // Daha şeffaf beyaz arkaplan
        borderRadius: '50%',               // Daire şekli
        animation: 'float 5s ease-in-out infinite' // Yüzme animasyonu
      }}></div>

      {/* Ana giriş kartı */}
      <Card className="login-card" style={{ 
        width: 420,                                    // Kart genişliği
        boxShadow: '0 12px 48px rgba(0,0,0,0.4)',     // Kart gölgesi
        borderRadius: '20px',                          // Köşe yuvarlama
        border: cardBorder,                            // Dinamik kenarlık
        backgroundColor: cardBackground,               // Dinamik arkaplan rengi
        backdropFilter: 'blur(15px)',                  // Bulanıklık efekti
        zIndex: 2,                                     // Diğer elementlerin üstünde
        position: 'relative'                           // Pozisyon referansı
      }}>
        {/* Kart içeriği için dikey düzen */}
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Başlık bölümü */}
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              Banka Ziyaretçi Takip Sistemi
            </Title>
            <Typography.Text type="secondary" style={{ color: isDarkMode ? '#bfbfbf' : 'inherit' }}>
              Banka Personeli Girişi
            </Typography.Text>
          </div>

          {/* Hata mesajı gösterimi */}
          {error && (
            <Alert
              message={error}                          // Hata mesajı
              type="error"                             // Hata tipi (kırmızı)
              showIcon                                 // İkon göster
              closable                                 // Kapatılabilir
              onClose={() => setError(null)}           // Kapatma fonksiyonu
            />
          )}

          {/* Giriş formu */}
          <Form
            name="login"                               // Form adı
            onFinish={onFinish}                        // Submit işlevi
            autoComplete="off"                         // Tarayıcı otomatik tamamlamayı kapat
            layout="vertical"                          // Dikey form düzeni
            initialValues={{                           // Başlangıç değerleri
              email: localStorage.getItem('lastEmail') || "", // Son kullanılan e-posta
               password: ""                             // Şifre boş
            }}
            style={{ color: isDarkMode ? '#fff' : 'inherit' }} // Dinamik metin rengi
          >
            {/* E-posta input alanı */}
            <Form.Item
              label={<span style={{ color: isDarkMode ? '#fff' : 'inherit' }}>E-posta</span>} // Dinamik label rengi
              name="email"                             // Form field adı
              rules={[                                 // Validasyon kuralları
                { required: true, message: 'E-posta adresi gerekli!' },      // Zorunlu alan
                { type: 'email', message: 'Geçerli bir e-posta adresi girin!' } // E-posta formatı
              ]}
            >
              <Input 
                prefix={<UserOutlined />}              // Kullanıcı ikonu
                placeholder="E-posta adresinizi girin" // Placeholder metni
                size="large"                           // Büyük boyut
                style={{                               // Input stil özellikleri
                  backgroundColor: isDarkMode ? '#303030' : 'white', // Dinamik arkaplan
                  borderColor: isDarkMode ? '#595959' : '#d9d9d9',   // Dinamik kenarlık rengi
                  color: isDarkMode ? '#fff' : 'inherit'             // Dinamik metin rengi
                }}
              />
            </Form.Item>

            {/* Şifre input alanı */}
            <Form.Item
              label={<span style={{ color: isDarkMode ? '#fff' : 'inherit' }}>Şifre</span>} // Dinamik label rengi
              name="password"                          // Form field adı
              rules={[{ required: true, message: 'Şifre gerekli!' }]} // Zorunlu alan validasyonu
            >
              <Input.Password
                prefix={<LockOutlined />}              // Kilit ikonu
                placeholder="Şifrenizi girin"          // Placeholder metni
                size="large"                           // Büyük boyut
                style={{                               // Input stil özellikleri
                  backgroundColor: isDarkMode ? '#303030' : 'white', // Dinamik arkaplan
                  borderColor: isDarkMode ? '#595959' : '#d9d9d9',   // Dinamik kenarlık rengi
                  color: isDarkMode ? '#fff' : 'inherit'             // Dinamik metin rengi
                }}
              />
            </Form.Item>

            {/* Giriş butonu */}
            <Form.Item>
              <Button 
                type="primary"                         // Ana buton tipi
                htmlType="submit"                      // Submit fonksiyonu
                loading={loading}                      // Yükleniyor durumu
                size="large"                           // Büyük boyut
                style={{                               // Buton stil özellikleri
                  width: '100%',                       // Tam genişlik
                  backgroundColor: isDarkMode ? '#722ed1' : '#1890ff', // Dinamik arkaplan rengi
                  borderColor: isDarkMode ? '#722ed1' : '#1890ff'      // Dinamik kenarlık rengi
                }}
              >
                Giriş Yap                              {/* Buton metni */}
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;