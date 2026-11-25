import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Optimistically restore session from localStorage so refresh never flickers
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [store, setStore] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_store');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('cp_token'));
  });

  const [isLoading, setIsLoading] = useState(() => {
    // If no token exists at all, not loading - definitely unauthenticated
    return Boolean(localStorage.getItem('cp_token'));
  });

  const [authError, setAuthError] = useState(null);

  // Validate or synchronize session with backend on application boot
  useEffect(() => {
    // Safety fallback: Never keep the UI stuck in loading state for > 3.5 seconds
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    const checkAuthStatus = async () => {
      const token = localStorage.getItem('cp_token');
      if (!token) {
        clearTimeout(safetyTimer);
        setIsLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        setStore(null);
        return;
      }

      try {
        const data = await authService.getMe();
        if (data?.user) {
          setUser(data.user);
          setStore(data.store);
          setIsAuthenticated(true);
          try {
            localStorage.setItem('cp_user', JSON.stringify(data.user));
            if (data.store) localStorage.setItem('cp_store', JSON.stringify(data.store));
          } catch (e) {
            console.warn('Failed to cache user session:', e);
          }
        }
      } catch (err) {
        console.warn('Session verification notice:', err.message);
        // Only clear credentials if server explicitly rejected auth with 401
        if (err.status === 401 || err.response?.status === 401) {
          localStorage.removeItem('cp_token');
          localStorage.removeItem('cp_user');
          localStorage.removeItem('cp_store');
          setUser(null);
          setStore(null);
          setIsAuthenticated(false);
        }
      } finally {
        clearTimeout(safetyTimer);
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    return () => {
      clearTimeout(safetyTimer);
    };
  }, []);

  // Register
  const register = async (userData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      setStore(data.store);
      setIsAuthenticated(true);
      if (data.user) localStorage.setItem('cp_user', JSON.stringify(data.user));
      if (data.store) localStorage.setItem('cp_store', JSON.stringify(data.store));
      return data;
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Login
  const login = async (credentials) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      setStore(data.store);
      setIsAuthenticated(true);
      if (data.user) localStorage.setItem('cp_user', JSON.stringify(data.user));
      if (data.store) localStorage.setItem('cp_store', JSON.stringify(data.store));
      return data;
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout error:', err.message);
    } finally {
      localStorage.removeItem('cp_token');
      localStorage.removeItem('cp_user');
      localStorage.removeItem('cp_store');
      setUser(null);
      setStore(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  // Refresh user and store state from server
  const refreshUser = async () => {
    try {
      const data = await authService.getMe();
      if (data?.user) {
        setUser(data.user);
        setStore(data.store);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.warn('Refresh user error:', err.message);
    }
  };

  // Update local store state
  const updateStore = (updatedStore) => {
    setStore((prev) => ({ ...prev, ...updatedStore }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
        isAuthenticated,
        isLoading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        refreshUser,
        updateStore
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
