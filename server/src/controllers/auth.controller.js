const crypto = require('crypto');
const User = require('../models/User.model');
const Store = require('../models/Store.model');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');
const config = require('../config/env');

/**
 * Cookie security options for HTTP-only JWT storage
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: config.env === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

/**
 * Register new merchant, create user & initial store
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, businessName, businessType, country, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // Generate email verification token (valid for 24h)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create User (password hashed automatically in User model pre-save hook)
    const user = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      country: country ? country.trim() : 'India',
      phoneNumber: phoneNumber ? phoneNumber.trim() : '',
      role: 'owner',
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isOnboarded: true
    });

    await user.save();

    // Create Store owned by this authenticated user
    const store = new Store({
      owner: user._id,
      name: businessName.trim(),
      businessType: businessType.trim(),
      country: country ? country.trim() : 'India',
      onboardingStep: 7,
      onboardingCompleted: true
    });

    await store.save();

    // Link store back to user
    user.store = store._id;
    await user.save();

    // Generate JWT auth token
    const token = user.generateAuthToken();

    // Set secure HTTP-only cookie
    res.cookie('token', token, getCookieOptions());
    res.cookie('cp_jwt', token, getCookieOptions());

    // Dispatch verification email in background
    try {
      await sendVerificationEmail({
        to: user.email,
        token: verificationToken,
        name: user.fullName
      });
    } catch (emailErr) {
      console.warn(`[Auth Controller] Email sending warning: ${emailErr.message}`);
    }

    // Omit sensitive fields
    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.emailVerificationToken;
    delete safeUser.emailVerificationExpires;

    return res.status(201).json({
      success: true,
      message: 'Account and store registered successfully.',
      user: safeUser,
      store,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in merchant with email and password
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('store');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    // Set secure HTTP-only cookie
    res.cookie('token', token, getCookieOptions());
    res.cookie('cp_jwt', token, getCookieOptions());

    // Format safe user response
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: safeUser,
      store: user.store,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log out merchant and clear session cookie
 */
const logout = async (req, res) => {
  const clearOptions = {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax'
  };

  res.clearCookie('token', clearOptions);
  res.clearCookie('cp_jwt', clearOptions);

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

/**
 * Get current authenticated user and store profile
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
    store: req.store
  });
};

/**
 * Verify email address with token
 */
const verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token || req.body.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.'
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired email verification link.'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email address verified successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset link
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success even if user not found to prevent user enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been dispatched.'
      });
    }

    // Generate reset token (valid for 1h)
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Send email
    try {
      await sendPasswordResetEmail({
        to: user.email,
        token: resetToken,
        name: user.fullName
      });
    } catch (emailErr) {
      console.warn(`[Forgot Password] Email send warning: ${emailErr.message}`);
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.'
      });
    }

    // Update password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You may now log in with your new credentials.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword
};
