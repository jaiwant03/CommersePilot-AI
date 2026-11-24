import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check existing session on application boot via HTTP-only cookie
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const data = await authService.getMe();
        if (data?.user) {
          setUser(data.user);
          setStore(data.store);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // Not authenticated or session expired
        setUser(null);
        setStore(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
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
