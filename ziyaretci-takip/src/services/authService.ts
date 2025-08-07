import API from './api';
import { LoginFormData, AuthResponse } from '../types';

export const authService = {
  login: async (loginData: LoginFormData): Promise<AuthResponse> => {
    try {
      const response = await API.post('/auth/login', loginData);
      const { token, admin } = response.data.data;
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(admin));
      
      return response.data.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await API.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
    } catch (error) {
      console.error('Logout error:', error);
      // Hata olsa bile local storage'ı temizle
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      throw error;
    }
  }
};

export default authService;
