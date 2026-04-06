import { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Always fetch fresh user data
  const fetchUserData = useCallback(async () => {
    const token = authService.getToken();

    if (token) {
      try {
        const response = await authService.getCurrentUser();
        if (response.user) {
          setUser(response.user);
          // Update localStorage too
          localStorage.setItem('user', JSON.stringify(response.user));
          return response.user;
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        if (err.response?.status === 401) {
          authService.logout();
          setUser(null);
        }
      }
    }
    return null;
  }, []);

  // On mount, fetch user
  useEffect(() => {
    const initializeAuth = async () => {
      await fetchUserData();
      setLoading(false);
    };
    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  // Update user in context AND localStorage
  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  // Refresh user from backend - ALWAYS fetch fresh
  const refreshUser = useCallback(async () => {
    console.log('🔄 Refreshing user data from database...');
    const freshUser = await fetchUserData();
    console.log('✅ Fresh user data:', freshUser?.points, 'pts');
    return freshUser;
  }, [fetchUserData]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      isAuthenticated: !!user,
    }),
    [user, loading, login, register, logout, updateUser, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};