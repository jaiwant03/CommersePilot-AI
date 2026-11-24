import api from './api';

export const authService = {
  // Register merchant and initial store
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data?.token) {
      localStorage.setItem('cp_token', response.data.token);
    }
    return response.data;
  },

  // Log in merchant
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.token) {
      localStorage.setItem('cp_token', response.data.token);
    }
    return response.data;
  },

  // Log out merchant and clear session
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('cp_token');
    }
  },

  // Get current authenticated user profile
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Request password reset email
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password using token
  resetPassword: async ({ token, password }) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  // Verify email address with token
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  // Fetch onboarding state
  getOnboardingState: async () => {
    const response = await api.get('/onboarding');
    return response.data;
  },

  // Update specific onboarding step
  updateOnboardingStep: async (stepData) => {
    const response = await api.post('/onboarding/step', stepData);
    return response.data;
  },

  // Finalize onboarding setup
  completeOnboarding: async () => {
    const response = await api.post('/onboarding/complete');
    return response.data;
  }
};

export default authService;
