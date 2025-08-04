import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Admin } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  token: string | null;
  loading: boolean;
}

interface AuthAction {
  type: 'LOGIN_SUCCESS' | 'LOGOUT' | 'SET_LOADING' | 'UPDATE_PROFILE';
  payload?: any;
}

const initialState: AuthState = {
  isAuthenticated: false,
  admin: null,
  token: null,
  loading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        admin: action.payload.admin,
        token: action.payload.token,
        loading: false,
      };
    case 'UPDATE_PROFILE':
      const updatedAdmin = { ...state.admin, ...action.payload };
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));
      return {
        ...state,
        admin: updatedAdmin,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      return {
        ...state,
        isAuthenticated: false,
        admin: null,
        token: null,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  admin: Admin | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
  updateProfile: (profileData: Partial<Admin>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Sayfa yenilendiğinde localStorage'dan token ve admin bilgisini kontrol et
    const token = localStorage.getItem('token');
    const adminData = localStorage.getItem('admin');
    
    if (token && adminData) {
      try {
        const admin = JSON.parse(adminData);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, admin }
        });
      } catch (error) {
        console.error('localStorage admin data parse error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = (token: string, admin: Admin) => {
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(admin));
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { token, admin }
    });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = (profileData: Partial<Admin>) => {
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: profileData
    });
  };

  return (
    <AuthContext.Provider value={{ 
      state, 
      admin: state.admin,
      isAuthenticated: state.isAuthenticated,
      token: state.token,
      loading: state.loading,
      login, 
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
