import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface ProfileFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const { state, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const handleProfileUpdate = async (values: ProfileFormData) => {
    setLoading(true);
    try {
      // API'ye profil güncelleme isteği gönder
      const updatedAdmin = await authService.updateProfile(values);
      // Eğer e-posta değiştiyse logout ve login sayfasına yönlendir
      if (state.admin?.email && values.email && state.admin.email !== values.email) {
        // Son kullanılan e-posta bilgisini localStorage'a yaz
        localStorage.setItem('lastEmail', values.email);
        message.success('E-posta adresiniz değiştirildi. Lütfen yeni e-posta ile tekrar giriş yapın.');
        setTimeout(() => {
          // Çıkış yap ve login sayfasına yönlendir
          window.location.href = '/login';
        }, 2000);
        // Logout işlemi
        setLoading(false);
        return;
      }
      // Context'i güncelle
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
