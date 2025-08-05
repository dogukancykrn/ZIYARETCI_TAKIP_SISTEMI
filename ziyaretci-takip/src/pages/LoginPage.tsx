import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, Switch } from 'antd';
import { UserOutlined, LockOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/apiService';
import { LoginFormData } from '../types';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(values);
      login(response.token, response.admin);
      navigate('/dashboard/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
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
        top: '30px',
        right: '30px',
        zIndex: 1
      }}>
        <Space align="center">
          <SunOutlined style={{ color: 'white', fontSize: '18px' }} />
          <Switch
            checked={isDarkMode}
            onChange={toggleDarkMode}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            style={{ backgroundColor: isDarkMode ? '#722ed1' : '#1890ff' }}
          />
          <MoonOutlined style={{ color: 'white', fontSize: '18px' }} />
        </Space>
      </div>
      {/* Ziraat Bankası Logo */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '30px',
        zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          color: isDarkMode ? '#fff' : '#d32f2f'
        }}>
          🌾 Ziraat Bankası
        </div>
      </div>

      {/* Dekoratif elementler */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '120px',
        height: '120px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '8%',
        width: '100px',
        height: '100px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '50%',
        animation: 'float 4s ease-in-out infinite reverse'
      }}></div>

      <div style={{
        position: 'absolute',
        top: '60%',
        right: '5%',
        width: '60px',
        height: '60px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '50%',
        animation: 'float 5s ease-in-out infinite'
      }}></div>

      <Card className="login-card" style={{ 
        width: 420, 
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
              Banka Ziyaretçi Takip Sistemi
            </Title>
            <Typography.Text type="secondary" style={{ color: isDarkMode ? '#bfbfbf' : 'inherit' }}>
              Banka Personeli Girişi
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

          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            initialValues={{
              email: localStorage.getItem('lastEmail') || "admin@banka.com",
              password: ""
            }}
            style={{ color: isDarkMode ? '#fff' : 'inherit' }}
          >
            <Form.Item
              label={<span style={{ color: isDarkMode ? '#fff' : 'inherit' }}>E-posta</span>}
              name="email"
              rules={[
                { required: true, message: 'E-posta adresi gerekli!' },
                { type: 'email', message: 'Geçerli bir e-posta adresi girin!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="E-posta adresinizi girin"
                size="large"
                style={{ 
                  backgroundColor: isDarkMode ? '#303030' : 'white',
                  borderColor: isDarkMode ? '#595959' : '#d9d9d9',
                  color: isDarkMode ? '#fff' : 'inherit'
                }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: isDarkMode ? '#fff' : 'inherit' }}>Şifre</span>}
              name="password"
              rules={[{ required: true, message: 'Şifre gerekli!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Şifrenizi girin"
                size="large"
                style={{ 
                  backgroundColor: isDarkMode ? '#303030' : 'white',
                  borderColor: isDarkMode ? '#595959' : '#d9d9d9',
                  color: isDarkMode ? '#fff' : 'inherit'
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
                style={{ 
                  width: '100%',
                  backgroundColor: isDarkMode ? '#722ed1' : '#1890ff',
                  borderColor: isDarkMode ? '#722ed1' : '#1890ff'
                }}
              >
                Giriş Yap
              </Button>
            </Form.Item>

            <Form.Item>
              <Button 
                type="default" 
                size="large"
                style={{ 
                  width: '100%',
                  backgroundColor: isDarkMode ? '#404040' : 'white',
                  borderColor: isDarkMode ? '#595959' : '#d9d9d9',
                  color: isDarkMode ? '#fff' : 'inherit'
                }}
                onClick={() => navigate('/admin-register')}
              >
                Yeni Yönetici Ekle
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
