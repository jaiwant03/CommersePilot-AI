import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import WorkspaceLayout from './layouts/WorkspaceLayout';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';

// Public & Marketing Pages
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import FeaturesPage from './pages/FeaturesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PricingPage from './pages/PricingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import NotFoundPage from './pages/NotFoundPage';

// Public Customer & Merchant Action Pages (Email Verification Links)
import VerifyOrderPage from './pages/public/VerifyOrderPage';
import RescheduleDeliveryPage from './pages/public/RescheduleDeliveryPage';
import ApprovePoPage from './pages/public/ApprovePoPage';

// Authenticated Seller Workspace Pages
import OverviewPage from './pages/workspace/OverviewPage';
import OrdersPage from './pages/workspace/OrdersPage';
import InventoryPage from './pages/workspace/InventoryPage';
import DeliveriesPage from './pages/workspace/DeliveriesPage';
import AnalyticsPage from './pages/workspace/AnalyticsPage';
import AssistantPage from './pages/workspace/AssistantPage';
import AutomationsPage from './pages/workspace/AutomationsPage';
import SettingsPage from './pages/workspace/SettingsPage';

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Authenticated Seller Workspace Layout */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <WorkspaceLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/overview" replace />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="deliveries" element={<DeliveriesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="assistant" element={<AssistantPage />} />
              <Route path="automations" element={<AutomationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Public Marketing & Auth Pages Shell */}
            <Route path="/" element={<MainLayout />}>
              {/* Public Marketing Pages */}
              <Route index element={<HomePage />} />
              <Route path="product" element={<ProductPage />} />
              <Route path="features" element={<FeaturesPage />} />
              <Route path="how-it-works" element={<HowItWorksPage />} />
              <Route path="pricing" element={<PricingPage />} />

              {/* Public Authentication Pages (Redirect if already authenticated) */}
              <Route
                path="register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="signup"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="verify-email" element={<VerifyEmailPage />} />

              {/* Secure Expiring Action Token Endpoints */}
              <Route path="verify-order" element={<VerifyOrderPage />} />
              <Route path="reschedule-delivery" element={<RescheduleDeliveryPage />} />
              <Route path="approve-po" element={<ApprovePoPage />} />

              {/* Protected Seller Onboarding */}
              <Route
                path="onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
