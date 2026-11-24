import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Higher-order component to guard protected routes
 */
export const ProtectedRoute = ({ children, requireOnboarded = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div 
        style={{ 
          minHeight: '70vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '16px'
        }}
      >
        <div 
          style={{ 
            width: '36px', 
            height: '36px', 
            border: '3px solid rgba(99, 102, 241, 0.2)', 
            borderTopColor: '#6366F1', 
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} 
        />
        <span style={{ fontSize: '13px', color: '#94A3B8' }}>Verifying session telemetry...</span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If page requires completed onboarding and user hasn't finished it -> redirect to onboarding
  if (requireOnboarded && !user?.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

/**
 * Route guard that redirects already authenticated users away from /login & /register
 */
export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    // Redirect authenticated users directly to the operational workspace
    return <Navigate to="/app/overview" replace />;
  }

  return children;
};

export default ProtectedRoute;
