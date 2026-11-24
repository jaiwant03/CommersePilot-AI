/**
 * Input validation helpers for Authentication and Onboarding
 */

const validateRegistration = (req, res, next) => {
  const { fullName, email, password, businessName, businessType, country } = req.body;

  const errors = [];

  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    errors.push('Full name is required.');
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email)) {
    errors.push('A valid business email address is required.');
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }

  if (!businessName || typeof businessName !== 'string' || !businessName.trim()) {
    errors.push('Business or store name is required.');
  }

  if (!businessType || typeof businessType !== 'string' || !businessType.trim()) {
    errors.push('Business type is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(' '),
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  next();
};

const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  next();
};

const validateResetPassword = (req, res, next) => {
  const { token, password } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Password reset token is missing.'
    });
  }

  if (!password || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters long.'
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
};
