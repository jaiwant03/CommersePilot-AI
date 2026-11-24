import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkHealth } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState({
    checked: false,
    healthy: false,
    data: null,
    error: null
  });

  const verifyBackend = async () => {
    try {
      const data = await checkHealth();
      setServerStatus({
        checked: true,
        healthy: data?.status === 'healthy',
        data,
        error: null
      });
    } catch (err) {
      setServerStatus({
        checked: true,
        healthy: false,
        data: null,
        error: err.message
      });
    }
  };

  useEffect(() => {
    verifyBackend();
  }, []);

  const toggleMobileMenu = (force) => {
    setMobileMenuOpen((prev) => (force !== undefined ? force : !prev));
  };

  return (
    <AppContext.Provider
      value={{
        mobileMenuOpen,
        toggleMobileMenu,
        serverStatus,
        verifyBackend
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
