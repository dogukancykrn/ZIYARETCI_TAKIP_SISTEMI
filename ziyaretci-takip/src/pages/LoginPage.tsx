import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/apiService';
import { LoginFormData } from '../types';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#f0f2f5' 
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={3}>Banka Ziyaretçi Takip Sistemi</Title>
            <Typography.Text type="secondary">Banka Personeli Girişi</Typography.Text>
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
          >
            <Form.Item
              label="E-posta"
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
              />
            </Form.Item>

            <Form.Item
              label="Şifre"
              name="password"
              rules={[{ required: true, message: 'Şifre gerekli!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Şifrenizi girin"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
                style={{ width: '100%' }}
              >
                Giriş Yap
              </Button>
            </Form.Item>

            <Form.Item>
              <Button 
                type="default" 
                size="large"
                style={{ width: '100%' }}
                onClick={() => window.location.href = '/visitors/new'}
              >
                Ziyaretçi Kaydı Yap
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
