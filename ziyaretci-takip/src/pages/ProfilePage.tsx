// React hook'ları ve bileşenleri içe aktarıyoruz
import React, { useState } from 'react';
// Ant Design UI bileşenlerini içe aktarıyoruz
import { Card, Form, Input, Button, Typography, message, Alert } from 'antd';
// Ant Design icon'larını içe aktarıyoruz
import { UserOutlined, LockOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
// Context hook'unu içe aktarıyoruz
import { useAuth } from '../context/AuthContext';           // Kimlik doğrulama context'i
// API servislerini içe aktarıyoruz
import { authService } from '../services/apiService';       // Kimlik doğrulama API servisleri
// React Router navigation hook'unu içe aktarıyoruz
import { useNavigate } from 'react-router-dom';

// Typography bileşenlerini destructure ediyoruz
const { Title, Text } = Typography;

// Profil güncelleme formu için veri tipi
interface ProfileFormData {
  fullName: string;     // Tam ad
  phoneNumber: string;  // Telefon numarası
  email: string;        // E-posta adresi
}

// Şifre değiştirme formu için veri tipi
interface PasswordFormData {
  currentPassword: string;  // Mevcut şifre
  newPassword: string;      // Yeni şifre
  confirmPassword: string;  // Yeni şifre tekrarı
}

// Kullanıcı profil yönetimi bileşeni
const ProfilePage: React.FC = () => {
  // Profil güncelleme yükleme durumu state'i
  const [loading, setLoading] = useState(false);
  // Şifre değiştirme yükleme durumu state'i
  const [passwordLoading, setPasswordLoading] = useState(false);
  // Profil güncelleme başarı durumu state'i
  const [success, setSuccess] = useState(false);
  // Şifre değiştirme başarı durumu state'i
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  // Auth context'ten state ve updateProfile fonksiyonunu al
  const { state, updateProfile } = useAuth();
  // Sayfa yönlendirme hook'u
  const navigate = useNavigate();
  // Form hook'ları
  const [profileForm] = Form.useForm();    // Profil formu
  const [passwordForm] = Form.useForm();   // Şifre formu

  // Profil güncelleme işlemi
  const handleProfileUpdate = async (values: ProfileFormData) => {
    setLoading(true); // Yükleme durumunu aktif et
    try {
      // API'ye profil güncelleme isteği gönder
      const updatedAdmin = await authService.updateProfile(values);
      
      // Eğer e-posta değiştiyse kullanıcıyı logout edip tekrar giriş yaptır
      if (state.admin?.email && values.email && state.admin.email !== values.email) {
        // Son kullanılan e-posta bilgisini localStorage'a kaydet
        localStorage.setItem('lastEmail', values.email);
        message.success('E-posta adresiniz değiştirildi. Lütfen yeni e-posta ile tekrar giriş yapın.');
        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          window.location.href = '/login'; // Tam sayfa yenileme ile logout
        }, 2000);
        setLoading(false);
        return;
      }
      
      // E-posta değişmemişse sadece context'i güncelle
      updateProfile(updatedAdmin);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error);
      message.error(error.response?.data?.message || 'Profil güncellenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: PasswordFormData) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Yeni şifreler eşleşmiyor!');
      return;
    }
    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      setPasswordSuccess(true);
      message.success('Şifreniz başarıyla güncellendi!');
      passwordForm.resetFields();
      setTimeout(() => setPasswordSuccess(false), 2500);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Şifre değiştirilirken hata oluştu!');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/dashboard/home')}
          style={{ marginBottom: '16px' }}
        >
          Ana Sayfaya Dön
        </Button>
        <Title level={2}>Profil Ayarları</Title>
        <Text type="secondary">Kişisel bilgilerinizi ve şifrenizi güncelleyebilirsiniz</Text>
      </div>

      {/* Profil Bilgileri */}
      <Card style={{ marginBottom: '24px' }}>
        {success && (
          <Alert message="Profil bilgileri başarıyla güncellendi!" type="success" showIcon style={{ marginBottom: 16, zIndex: 1000 }} />
        )}
        <Title level={4}>Kişisel Bilgiler</Title>
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileUpdate}
          initialValues={{
            fullName: state.admin?.fullName || '',
            phoneNumber: state.admin?.phoneNumber || '',
            email: state.admin?.email || ''
          }}
        >
          <Form.Item
            name="fullName"
            label="Ad Soyad"
            rules={[
              { required: true, message: 'Lütfen adınızı ve soyadınızı girin!' },
              { min: 2, message: 'Ad soyad en az 2 karakter olmalıdır!' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ad Soyad" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Telefon Numarası"
            rules={[
              { required: true, message: 'Lütfen telefon numaranızı girin!' },
              { pattern: /^[0-9]{10,11}$/, message: 'Geçerli bir telefon numarası girin!' }
            ]}
          >
            <Input placeholder="Telefon Numarası" />
          </Form.Item>

          <Form.Item
            name="email"
            label="E-posta"
            rules={[
              { required: true, message: 'Lütfen e-posta adresinizi girin!' },
              { type: 'email', message: 'Geçerli bir e-posta adresi girin!' }
            ]}
          >
            <Input placeholder="E-posta" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              Profil Bilgilerini Güncelle
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Şifre Değiştirme */}
      <Card>
        <Title level={4}>Şifre Değiştir</Title>
        {passwordSuccess && (
          <Alert message="Şifreniz başarıyla güncellendi!" type="success" showIcon style={{ marginBottom: 16, zIndex: 1000 }} />
        )}
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="currentPassword"
            label="Mevcut Şifre"
            rules={[{ required: true, message: 'Lütfen mevcut şifrenizi girin!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mevcut Şifre" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Yeni Şifre"
            rules={[
              { required: true, message: 'Lütfen yeni şifrenizi girin!' },
              { min: 6, message: 'Şifre en az 6 karakter olmalıdır!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Yeni Şifre" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Yeni Şifre Tekrar"
            rules={[
              { required: true, message: 'Lütfen yeni şifrenizi tekrar girin!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Şifreler eşleşmiyor!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Yeni Şifre Tekrar" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={passwordLoading} icon={<SaveOutlined />}>
              Şifreyi Değiştir
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;