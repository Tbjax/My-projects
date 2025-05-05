/**
 * Notification Service
 * 
 * Handles the creation, delivery, and management of notifications
 * across the platform. Supports in-app notifications, email notifications,
 * and real-time updates via Socket.IO.
 */

const db = require('../config/database');
const logger = require('../utils/logger');
const emailService = require('./emailService');

/**
 * Create a new notification
 * @param {Object} notification - Notification data
 * @param {string} notification.userId - ID of the user to notify
 * @param {string} notification.type - Type of notification (e.g., 'info', 'warning', 'success', 'error')
 * @param {string} notification.title - Notification title
 * @param {string} notification.message - Notification message
 * @param {string} notification.module - Module that generated the notification (e.g., 'core', 'real-estate')
 * @param {string} notification.entityType - Type of entity related to the notification (e.g., 'property', 'listing')
 * @param {string} notification.entityId - ID of the entity related to the notification
 * @param {string} notification.actionUrl - URL to navigate to when notification is clicked
 * @param {boolean} notification.isEmail - Whether to send an email notification
 * @returns {Promise<Object>} - The created notification
 */
exports.createNotification = async (notification) => {
  try {
    // Insert notification into database
    const result = await db.query(
      `INSERT INTO core.notifications (
        user_id,
        type,
        title,
        message,
        module,
        entity_type,
        entity_id,
        action_url,
        is_read,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, NOW())
      RETURNING *`,
      [
        notification.userId,
        notification.type,
        notification.title,
        notification.message,
        notification.module,
        notification.entityType,
        notification.entityId,
        notification.actionUrl
      ]
    );

    const createdNotification = result.rows[0];

    // Send real-time notification via Socket.IO if available
    const io = global.io || (global.app && global.app.get('io'));
    if (io) {
      io.to(`user:${notification.userId}`).emit('notification', {
        id: createdNotification.id,
        type: createdNotification.type,
        title: createdNotification.title,
        message: createdNotification.message,
        createdAt: createdNotification.created_at,
        actionUrl: createdNotification.action_url
      });
    }

    // Send email notification if requested
    if (notification.isEmail) {
      try {
        // Get user email and name
        const userResult = await db.query(
          'SELECT email, first_name FROM core.users WHERE id = $1',
          [notification.userId]
        );

        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          
          await emailService.sendNotificationEmail(
            user.email,
            user.first_name,
            notification.title,
            notification.message,
            notification.actionUrl,
            'View Details'
          );
        }
      } catch (emailError) {
        logger.error('Failed to send notification email', { 
          error: emailError.message,
          userId: notification.userId,
          notificationId: createdNotification.id
        });
        // Continue even if email fails
      }
    }

    return createdNotification;
  } catch (error) {
    logger.error('Error creating notification', { error: error.message });
    throw error;
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of notifications to return
 * @param {number} options.offset - Number of notifications to skip
 * @param {boolean} options.unreadOnly - Whether to return only unread notifications
 * @returns {Promise<Array<Object>>} - List of notifications
 */
exports.getUserNotifications = async (userId, options = {}) => {
  try {
    const { limit = 20, offset = 0, unreadOnly = false } = options;
    
    let query = `
      SELECT *
      FROM core.notifications
      WHERE user_id = $1
    `;
    
    const queryParams = [userId];
    
    if (unreadOnly) {
      query += ' AND is_read = false';
    }
    
    query += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    queryParams.push(limit, offset);
    
    const result = await db.query(query, queryParams);
    
    return result.rows;
  } catch (error) {
    logger.error('Error getting user notifications', { error: error.message });
    throw error;
  }
};

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Count of unread notifications
 */
exports.getUnreadCount = async (userId) => {
  try {
    const result = await db.query(
      'SELECT COUNT(*) FROM core.notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    logger.error('Error getting unread notification count', { error: error.message });
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for security check)
 * @returns {Promise<Object>} - The updated notification
 */
exports.markAsRead = async (notificationId, userId) => {
  try {
    const result = await db.query(
      `UPDATE core.notifications
       SET is_read = true, read_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Notification not found or not owned by user');
    }
    
    return result.rows[0];
  } catch (error) {
    logger.error('Error marking notification as read', { error: error.message });
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of notifications marked as read
 */
exports.markAllAsRead = async (userId) => {
  try {
    const result = await db.query(
      `UPDATE core.notifications
       SET is_read = true, read_at = NOW()
       WHERE user_id = $1 AND is_read = false
       RETURNING id`,
      [userId]
    );
    
    return result.rows.length;
  } catch (error) {
    logger.error('Error marking all notifications as read', { error: error.message });
    throw error;
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for security check)
 * @returns {Promise<boolean>} - Whether the notification was deleted
 */
exports.deleteNotification = async (notificationId, userId) => {
  try {
    const result = await db.query(
      'DELETE FROM core.notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [notificationId, userId]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    logger.error('Error deleting notification', { error: error.message });
    throw error;
  }
};

/**
 * Create a notification for multiple users
 * @param {Array<string>} userIds - Array of user IDs to notify
 * @param {Object} notificationData - Notification data (without userId)
 * @returns {Promise<Array<Object>>} - The created notifications
 */
exports.notifyMultipleUsers = async (userIds, notificationData) => {
  try {
    const notifications = [];
    
    // Create notifications for each user
    for (const userId of userIds) {
      const notification = await exports.createNotification({
        ...notificationData,
        userId
      });
      
      notifications.push(notification);
    }
    
    return notifications;
  } catch (error) {
    logger.error('Error notifying multiple users', { error: error.message });
    throw error;
  }
};

/**
 * Create a notification for all users with a specific role
 * @param {string} roleName - Role name
 * @param {Object} notificationData - Notification data (without userId)
 * @returns {Promise<Array<Object>>} - The created notifications
 */
exports.notifyRole = async (roleName, notificationData) => {
  try {
    // Get all users with the specified role
    const usersResult = await db.query(
      `SELECT u.id
       FROM core.users u
       JOIN core.user_roles ur ON u.id = ur.user_id
       JOIN core.roles r ON ur.role_id = r.id
       WHERE r.name = $1 AND u.is_active = true`,
      [roleName]
    );
    
    const userIds = usersResult.rows.map(user => user.id);
    
    return exports.notifyMultipleUsers(userIds, notificationData);
  } catch (error) {
    logger.error('Error notifying role', { error: error.message });
    throw error;
  }
};

/**
 * Create a notification for all users in a specific department
 * @param {string} departmentId - Department ID
 * @param {Object} notificationData - Notification data (without userId)
 * @returns {Promise<Array<Object>>} - The created notifications
 */
exports.notifyDepartment = async (departmentId, notificationData) => {
  try {
    // Get all users in the specified department
    const usersResult = await db.query(
      'SELECT id FROM core.users WHERE department_id = $1 AND is_active = true',
      [departmentId]
    );
    
    const userIds = usersResult.rows.map(user => user.id);
    
    return exports.notifyMultipleUsers(userIds, notificationData);
  } catch (error) {
    logger.error('Error notifying department', { error: error.message });
    throw error;
  }
};
