/**
 * Authentication API Routes
 */

const express = require('express');
const { body, param } = require('express-validator');
const authController = require('../controllers/authController');
const { auth, checkPermission } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('jobTitle').notEmpty().withMessage('Job title is required'),
    body('departmentId').isInt().withMessage('Department ID must be an integer')
  ],
  validationMiddleware,
  authController.register
);

/**
 * @route GET /api/auth/verify/:token
 * @desc Verify user email
 */
router.get(
  '/verify/:token',
  [
    param('token').notEmpty().withMessage('Verification token is required')
  ],
  validationMiddleware,
  authController.verifyEmail
);

/**
 * @route POST /api/auth/login
 * @desc Login user
 */
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validationMiddleware,
  authController.login
);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token
 */
router.post(
  '/refresh-token',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
  ],
  validationMiddleware,
  authController.refreshToken
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 */
router.post(
  '/logout',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
  ],
  validationMiddleware,
  authController.logout
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Invalid email address')
  ],
  validationMiddleware,
  authController.forgotPassword
);

/**
 * @route POST /api/auth/reset-password/:token
 * @desc Reset password
 */
router.post(
  '/reset-password/:token',
  [
    param('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  validationMiddleware,
  authController.resetPassword
);

/**
 * @route POST /api/auth/change-password
 * @desc Change password (authenticated)
 */
router.post(
  '/change-password',
  auth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
  ],
  validationMiddleware,
  authController.changePassword
);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 */
router.get('/me', auth, authController.getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 */
router.put(
  '/profile',
  auth,
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('jobTitle').notEmpty().withMessage('Job title is required')
  ],
  validationMiddleware,
  authController.updateProfile
);

module.exports = router;
