/**
 * Email Service
 * 
 * Handles sending emails for various purposes like user verification,
 * password reset, notifications, etc.
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined
  });
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<Object>} - Nodemailer info object
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Intranet Platform'}" <${process.env.SMTP_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    logger.info('Email sent successfully', { 
      messageId: info.messageId,
      to: options.to,
      subject: options.subject
    });
    
    return info;
  } catch (error) {
    logger.error('Error sending email', { 
      error: error.message,
      to: options.to,
      subject: options.subject
    });
    throw error;
  }
};

/**
 * Send verification email to new user
 * @param {string} email - User's email address
 * @param {string} firstName - User's first name
 * @param {string} token - Verification token
 * @returns {Promise<Object>} - Nodemailer info object
 */
exports.sendVerificationEmail = async (email, firstName, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  
  const subject = 'Verify Your Email Address';
  
  const text = `
    Hello ${firstName},
    
    Thank you for registering with the Intranet Platform. Please verify your email address by clicking the link below:
    
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you did not create an account, please ignore this email.
    
    Best regards,
    The Intranet Platform Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email Address</h2>
      <p>Hello ${firstName},</p>
      <p>Thank you for registering with the Intranet Platform. Please verify your email address by clicking the button below:</p>
      <p style="text-align: center;">
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
      <p>Best regards,<br>The Intranet Platform Team</p>
    </div>
  `;
  
  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} firstName - User's first name
 * @param {string} token - Reset token
 * @returns {Promise<Object>} - Nodemailer info object
 */
exports.sendPasswordResetEmail = async (email, firstName, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  
  const subject = 'Reset Your Password';
  
  const text = `
    Hello ${firstName},
    
    You requested a password reset for your Intranet Platform account. Please click the link below to reset your password:
    
    ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you did not request a password reset, please ignore this email.
    
    Best regards,
    The Intranet Platform Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Hello ${firstName},</p>
      <p>You requested a password reset for your Intranet Platform account. Please click the button below to reset your password:</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Best regards,<br>The Intranet Platform Team</p>
    </div>
  `;
  
  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send notification email
 * @param {string} email - User's email address
 * @param {string} firstName - User's first name
 * @param {string} subject - Email subject
 * @param {string} message - Notification message
 * @param {string} actionUrl - URL for call-to-action button (optional)
 * @param {string} actionText - Text for call-to-action button (optional)
 * @returns {Promise<Object>} - Nodemailer info object
 */
exports.sendNotificationEmail = async (email, firstName, subject, message, actionUrl, actionText) => {
  const text = `
    Hello ${firstName},
    
    ${message}
    
    ${actionUrl ? `Click here to view: ${actionUrl}` : ''}
    
    Best regards,
    The Intranet Platform Team
  `;
  
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${subject}</h2>
      <p>Hello ${firstName},</p>
      <p>${message}</p>
  `;
  
  if (actionUrl && actionText) {
    html += `
      <p style="text-align: center;">
        <a href="${actionUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px;">${actionText}</a>
      </p>
    `;
  }
  
  html += `
      <p>Best regards,<br>The Intranet Platform Team</p>
    </div>
  `;
  
  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send welcome email after verification
 * @param {string} email - User's email address
 * @param {string} firstName - User's first name
 * @returns {Promise<Object>} - Nodemailer info object
 */
exports.sendWelcomeEmail = async (email, firstName) => {
  const loginUrl = `${process.env.CLIENT_URL}/login`;
  
  const subject = 'Welcome to the Intranet Platform';
  
  const text = `
    Hello ${firstName},
    
    Your email has been verified successfully. Welcome to the Intranet Platform!
    
    You can now log in to your account and start using the platform:
    ${loginUrl}
    
    If you have any questions or need assistance, please contact our support team.
    
    Best regards,
    The Intranet Platform Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to the Intranet Platform</h2>
      <p>Hello ${firstName},</p>
      <p>Your email has been verified successfully. Welcome to the Intranet Platform!</p>
      <p>You can now log in to your account and start using the platform:</p>
      <p style="text-align: center;">
        <a href="${loginUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Log In</a>
      </p>
      <p>If you have any questions or need assistance, please contact our support team.</p>
      <p>Best regards,<br>The Intranet Platform Team</p>
    </div>
  `;
  
  return sendEmail({ to: email, subject, text, html });
};
