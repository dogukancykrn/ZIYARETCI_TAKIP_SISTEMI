import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, Switch } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, SaveOutlined, ArrowLeftOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/apiService';

const { Title } = Typography;

interface AdminRegisterFormData {
  firstName: string;
  lastName: string;
  tcNumber: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const AdminRegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [form] = Form.useForm();

  const onFinish = async (values: AdminRegisterFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.registerAdmin(values);
      setSuccess(true);
      form.resetFields();
      
      // 3 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  // Dark mode için renkler
  const backgroundGradient = isDarkMode 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1f1f1f 50%, #262626 75%, #1a1a1a 100%)'
    : 'linear-gradient(135deg, #8B0000 0%, #DC143C 25%, #B22222 50%, #8B0000 75%, #A52A2A 100%)';
  
  const cardBackground = isDarkMode ? 'rgba(40, 40, 40, 0.97)' : 'rgba(255,255,255,0.97)';
  const cardBorder = isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)';

  return (
    <div className="gradient-background" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: backgroundGradient,
      position: 'relative',
      padding: '20px'
    }}>
      {/* Dark Mode Toggle */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '30px',
        zIndex: 1
      }}>
        <Space align="center">
          <SunOutlined style={{ color: 'white', fontSize: '16px' }} />
          <Switch
            checked={isDarkMode}
            onChange={toggleDarkMode}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            style={{ backgroundColor: isDarkMode ? '#722ed1' : '#1890ff' }}
          />
          <MoonOutlined style={{ color: 'white', fontSize: '16px' }} />
        </Space>
      </div>
      {/* Dekoratif elementler */}
      <div style={{
        position: 'absolute',
        top: '8%',
        right: '8%',
        width: '80px',
        height: '80px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '6%',
        width: '70px',
        height: '70px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '50%',
        animation: 'float 4s ease-in-out infinite reverse'
      }}></div>

      <Card className="login-card" style={{ 
        width: 520, 
        boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
        borderRadius: '20px',
        border: cardBorder,
        backgroundColor: cardBackground,
        backdropFilter: 'blur(15px)',
        zIndex: 2,
        position: 'relative'
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ color: isDarkMode ? '#fff' : 'inherit' }}>
              Yeni Yönetici Kaydı
            </Title>
            <Typography.Text type="secondary" style={{ color: isDarkMode ? '#bfbfbf' : 'inherit' }}>
              Banka Yönetici Hesabı Oluşturun
            </Typography.Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          {success && (
            <Alert
              message="Yönetici hesabı başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz..."
              type="success"
              showIcon
            />
          )}

          <Form
            form={form}
            name="adminRegister"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="Ad"
              name="firstName"
              rules={[
                { required: true, message: 'Ad gerekli!' },
                { min: 2, message: 'Ad en az 2 karakter olmalı!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Adınızı girin"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Soyad"
              name="lastName"
              rules={[
                { required: true, message: 'Soyad gerekli!' },
                { min: 2, message: 'Soyad en az 2 karakter olmalı!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Soyadınızı girin"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="TC Kimlik No"
              name="tcNumber"
              rules={[
                { required: true, message: 'TC Kimlik No gerekli!' },
                { len: 11, message: 'TC Kimlik No 11 haneli olmalı!' },
                { pattern: /^[0-9]+$/, message: 'TC Kimlik No sadece rakam içermelidir!' }
              ]}
            >
              <Input 
                prefix={<IdcardOutlined />} 
                placeholder="TC Kimlik Numaranızı girin"
                size="large"
                maxLength={11}
              />
            </Form.Item>

            <Form.Item
              label="Telefon"
              name="phoneNumber"
              rules={[
                { required: true, message: 'Telefon numarası gerekli!' },
                { pattern: /^[0-9]{10}$/, message: 'Geçerli bir telefon numarası girin! (10 haneli)' }
              ]}
            >
              <Input 
                prefix={<PhoneOutlined />} 
                placeholder="5551234567"
                size="large"
                maxLength={10}
              />
            </Form.Item>

            <Form.Item
              label="E-posta"
              name="email"
              rules={[
                { required: true, message: 'E-posta adresi gerekli!' },
                { type: 'email', message: 'Geçerli bir e-posta adresi girin!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="ornek@banka.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Şifre"
              name="password"
              rules={[
                { required: true, message: 'Şifre gerekli!' },
                { min: 6, message: 'Şifre en az 6 karakter olmalı!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Şifrenizi girin"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Şifre Tekrar"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Şifre tekrarı gerekli!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Şifreler eşleşmiyor!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Şifrenizi tekrar girin"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%' }}>
                <Button 
                  type="default" 
                  icon={<ArrowLeftOutlined />}
                  size="large"
                  onClick={() => navigate('/login')}
                  style={{ flex: 1 }}
                >
                  Geri
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                  style={{ flex: 2 }}
                >
                  Kaydet
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default AdminRegisterPage;
