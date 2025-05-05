/**
 * Authentication Controller
 * 
 * Handles user authentication operations including login, registration,
 * password reset, and token refresh.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  const { 
    username, 
    email, 
    password, 
    firstName, 
    lastName, 
    jobTitle, 
    departmentId 
  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM core.users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        message: 'User already exists with this username or email' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create verification token
    const verificationToken = uuidv4();

    // Insert new user
    const result = await db.query(
      `INSERT INTO core.users (
        username, 
        email, 
        password, 
        first_name, 
        last_name, 
        job_title, 
        department_id,
        verification_token,
        is_active,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING id`,
      [
        username, 
        email, 
        hashedPassword, 
        firstName, 
        lastName, 
        jobTitle, 
        departmentId,
        verificationToken,
        false // User is inactive until email is verified
      ]
    );

    const userId = result.rows[0].id;

    // Assign default role (e.g., 'user')
    await db.query(
      `INSERT INTO core.user_roles (user_id, role_id) 
       SELECT $1, id FROM core.roles WHERE name = 'user'`,
      [userId]
    );

    // Send verification email
    await emailService.sendVerificationEmail(
      email,
      firstName,
      verificationToken
    );

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      userId
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Verify user email
 * @route GET /api/auth/verify/:token
 */
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    // Find user with verification token
    const result = await db.query(
      'SELECT id FROM core.users WHERE verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    // Activate user account
    await db.query(
      `UPDATE core.users 
       SET is_active = true, 
           verification_token = NULL, 
           email_verified_at = NOW() 
       WHERE id = $1`,
      [result.rows[0].id]
    );

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    logger.error('Email verification error', { error: error.message });
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user
    const result = await db.query(
      `SELECT id, username, email, password, first_name, last_name, 
              is_active, email_verified_at
       FROM core.users 
       WHERE (username = $1 OR email = $1)`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ 
        message: 'Account is not active. Please verify your email.' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Log failed login attempt
      await db.query(
        `INSERT INTO core.login_attempts (user_id, ip_address, success, created_at)
         VALUES ($1, $2, false, NOW())`,
        [user.id, req.ip]
      );
      
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      userId: user.id,
      username: user.username
    };

    // Sign token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '1d' }
    );

    // Create refresh token
    const refreshToken = uuidv4();
    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 30); // 30 days

    // Save refresh token
    await db.query(
      `INSERT INTO core.refresh_tokens (user_id, token, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [user.id, refreshToken, refreshExpires]
    );

    // Update last login
    await db.query(
      `UPDATE core.users 
       SET last_login = NOW(), 
           last_activity = NOW() 
       WHERE id = $1`,
      [user.id]
    );

    // Log successful login
    await db.query(
      `INSERT INTO core.login_attempts (user_id, ip_address, success, created_at)
       VALUES ($1, $2, true, NOW())`,
      [user.id, req.ip]
    );

    // Return user info and tokens
    res.status(200).json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Refresh access token
 * @route POST /api/auth/refresh-token
 */
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    // Find refresh token
    const result = await db.query(
      `SELECT rt.user_id, rt.expires_at, u.username
       FROM core.refresh_tokens rt
       JOIN core.users u ON rt.user_id = u.id
       WHERE rt.token = $1 AND rt.is_revoked = false`,
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokenData = result.rows[0];

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    // Create new JWT payload
    const payload = {
      userId: tokenData.user_id,
      username: tokenData.username
    };

    // Sign new token
    const newToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '1d' }
    );

    // Update last activity
    await db.query(
      `UPDATE core.users 
       SET last_activity = NOW() 
       WHERE id = $1`,
      [tokenData.user_id]
    );

    res.status(200).json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    logger.error('Token refresh error', { error: error.message });
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (refreshToken) {
      // Revoke refresh token
      await db.query(
        `UPDATE core.refresh_tokens 
         SET is_revoked = true, 
             revoked_at = NOW() 
         WHERE token = $1`,
        [refreshToken]
      );
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    res.status(500).json({ message: 'Server error during logout' });
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const result = await db.query(
      'SELECT id, first_name FROM core.users WHERE email = $1',
      [email]
    );

    // Always return success even if email doesn't exist (security)
    if (result.rows.length === 0) {
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset link' 
      });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

    // Save reset token
    await db.query(
      `UPDATE core.users 
       SET reset_token = $1, 
           reset_token_expires = $2 
       WHERE id = $3`,
      [resetToken, resetExpires, user.id]
    );

    // Send password reset email
    await emailService.sendPasswordResetEmail(
      email,
      user.first_name,
      resetToken
    );

    res.status(200).json({ 
      message: 'If your email is registered, you will receive a password reset link' 
    });
  } catch (error) {
    logger.error('Forgot password error', { error: error.message });
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

/**
 * Reset password
 * @route POST /api/auth/reset-password/:token
 */
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Find user with reset token
    const result = await db.query(
      `SELECT id 
       FROM core.users 
       WHERE reset_token = $1 
       AND reset_token_expires > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    const userId = result.rows[0].id;

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset token
    await db.query(
      `UPDATE core.users 
       SET password = $1, 
           reset_token = NULL, 
           reset_token_expires = NULL, 
           password_changed_at = NOW() 
       WHERE id = $2`,
      [hashedPassword, userId]
    );

    // Revoke all refresh tokens for this user
    await db.query(
      `UPDATE core.refresh_tokens 
       SET is_revoked = true, 
           revoked_at = NOW() 
       WHERE user_id = $1 
       AND is_revoked = false`,
      [userId]
    );

    res.status(200).json({ 
      message: 'Password reset successful. You can now log in with your new password.' 
    });
  } catch (error) {
    logger.error('Reset password error', { error: error.message });
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

/**
 * Change password (authenticated)
 * @route POST /api/auth/change-password
 */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // Get current password
    const result = await db.query(
      'SELECT password FROM core.users WHERE id = $1',
      [userId]
    );

    // Check current password
    const isMatch = await bcrypt.compare(
      currentPassword, 
      result.rows[0].password
    );

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query(
      `UPDATE core.users 
       SET password = $1, 
           password_changed_at = NOW() 
       WHERE id = $2`,
      [hashedPassword, userId]
    );

    // Revoke all refresh tokens except current one
    if (req.body.refreshToken) {
      await db.query(
        `UPDATE core.refresh_tokens 
         SET is_revoked = true, 
             revoked_at = NOW() 
         WHERE user_id = $1 
         AND token != $2 
         AND is_revoked = false`,
        [userId, req.body.refreshToken]
      );
    }

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error', { error: error.message });
    res.status(500).json({ message: 'Server error during password change' });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
exports.getProfile = async (req, res) => {
  try {
    // User info is already in req.user from auth middleware
    const userProfile = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      jobTitle: req.user.job_title,
      department: {
        id: req.user.department_id,
        name: req.user.department_name
      },
      roles: req.user.roles,
      lastLogin: req.user.last_login
    };

    res.status(200).json(userProfile);
  } catch (error) {
    logger.error('Get profile error', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  const { firstName, lastName, jobTitle } = req.body;
  const userId = req.user.id;

  try {
    // Update profile
    await db.query(
      `UPDATE core.users 
       SET first_name = $1, 
           last_name = $2, 
           job_title = $3, 
           updated_at = NOW() 
       WHERE id = $4`,
      [firstName, lastName, jobTitle, userId]
    );

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: {
        ...req.user,
        first_name: firstName,
        last_name: lastName,
        job_title: jobTitle
      }
    });
  } catch (error) {
    logger.error('Update profile error', { error: error.message });
    res.status(500).json({ message: 'Server error during profile update' });
  }
};
