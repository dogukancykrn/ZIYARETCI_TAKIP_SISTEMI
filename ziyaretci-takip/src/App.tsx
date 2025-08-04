import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import trTR from 'antd/locale/tr_TR';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import VisitorForm from './pages/VisitorForm';
import ActiveVisitors from './pages/ActiveVisitors';
import VisitorHistory from './pages/VisitorHistory';
import ProfilePage from './pages/ProfilePage';
import DashboardLayout from './components/DashboardLayout';
import './styles/App.css';

const AppContent: React.FC = () => {
  const { state } = useAuth();

  if (state.loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Giriş yapmamış kullanıcı için sadece login sayfası */}
        <Route path="/login" element={<LoginPage />} />
        {/* Root (/) her zaman yönlendirilsin */}
        <Route path="/" element={<Navigate to={state.isAuthenticated ? "/dashboard/home" : "/login"} replace />} />
        {!state.isAuthenticated ? (
          <Route path="*" element={<Navigate to="/login" replace />} />
        ) : (
          <Route path="/dashboard/*" element={<DashboardLayout />}>
            <Route path="home" element={<Dashboard />} />
            <Route path="visitor-registration" element={<VisitorForm />} />
            <Route path="active-visitors" element={<ActiveVisitors />} />
            <Route path="visitor-history" element={<VisitorHistory />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route index element={<Navigate to="/dashboard/home" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ThemeConsumerApp />
    </ThemeProvider>
  );
};

const ThemeConsumerApp: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <ConfigProvider
      locale={trTR}
      theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
