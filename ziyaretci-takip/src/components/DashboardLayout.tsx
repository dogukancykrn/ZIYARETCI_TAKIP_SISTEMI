import React, { useState } from 'react';
import { Switch } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  UserAddOutlined,
  TeamOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { state, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserAddOutlined />,
      label: 'Profil',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
    },
  ];

  const menuItems = [
    {
      key: '/dashboard/home',
      icon: <DashboardOutlined />,
      label: 'Ana Sayfa',
    },
    {
      key: '/dashboard/visitor-registration',
      icon: <UserAddOutlined />,
      label: 'Ziyaretçi Kaydı',
    },
    {
      key: '/dashboard/active-visitors',
      icon: <TeamOutlined />,
      label: 'Aktif Ziyaretçiler',
    },
    {
      key: '/dashboard/visitor-history',
      icon: <HistoryOutlined />,
      label: 'Ziyaret Geçmişi',
    },
  ];
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div 
          style={{ 
            height: 32, 
            margin: 16, 
            color: 'white', 
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onClick={() => navigate('/dashboard/home')}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          {collapsed ? 'ZTS' : 'Ziyaretçi Takip'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Switch
            checked={isDarkMode}
            onChange={toggleDarkMode}
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<BulbOutlined />}
          />
          <div style={{ color: 'white', fontSize: 12, marginTop: 4 }}>
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
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
