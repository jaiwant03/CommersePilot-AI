import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

/**
 * Higher-order component to guard protected routes
 */
export const ProtectedRoute = ({ children, requireOnboarded = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Accessing autonomous operations console..." />;
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
    return <LoadingScreen message="Checking session credentials..." />;
  }

  if (isAuthenticated) {
    // Redirect authenticated users directly to the operational workspace
    return <Navigate to="/app/overview" replace />;
  }

  return children;
};

export default ProtectedRoute;
