import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  PlusOutlined,
  HistoryOutlined 
} from '@ant-design/icons';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import VisitorForm from '../pages/VisitorForm';
import '../styles/App.css';

const { Header, Sider, Content } = Layout;

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Main Layout Component
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Ana Panel',
      onClick: () => navigate('/dashboard')
    },
    {
      key: 'visitors',
      icon: <UserOutlined />,
      label: 'Ziyaretçiler',
      children: [
        {
          key: 'new-visitor',
          icon: <PlusOutlined />,
          label: 'Yeni Ziyaretçi',
          onClick: () => navigate('/visitors/new')
        },
        {
          key: 'active-visitors',
          icon: <UserOutlined />,
          label: 'Aktif Ziyaretçiler',
          onClick: () => navigate('/visitors/active')
        },
        {
          key: 'visitor-history',
          icon: <HistoryOutlined />,
          label: 'Ziyaretçi Geçmişi',
          onClick: () => navigate('/visitors/history')
        }
      ]
    }
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      onClick: logout
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="dark">
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Ziyaretçi Takip
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
            Ziyaretçi Takip Sistemi
          </div>
          <Space>
            <span>Hoş geldiniz, {admin?.fullName}</span>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar icon={<UserOutlined />} />
              </Button>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px', overflow: 'auto' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

// App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/visitors/new" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <VisitorForm />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
