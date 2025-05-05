/**
 * Authentication Middleware
 * 
 * This middleware handles authentication and authorization for API routes.
 * It verifies JWT tokens and checks user permissions based on roles.
 */

const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Verifies the JWT token in the request header
 */
exports.auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists and is active
      const userResult = await db.query(`
        SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.job_title, 
               u.department_id, u.is_active, u.last_login,
               d.name as department_name
        FROM core.users u
        LEFT JOIN core.departments d ON u.department_id = d.id
        WHERE u.id = $1 AND u.is_active = true
      `, [decoded.userId]);

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'User not found or inactive' });
      }

      // Add user info to request object
      req.user = userResult.rows[0];
      req.user.roles = [];
      req.user.permissions = [];

      // Get user roles
      const rolesResult = await db.query(`
        SELECT r.id, r.name, r.description
        FROM core.roles r
        JOIN core.user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = $1
      `, [req.user.id]);

      req.user.roles = rolesResult.rows;

      // Get user permissions (from roles)
      if (rolesResult.rows.length > 0) {
        const roleIds = rolesResult.rows.map(role => role.id);
        
        const permissionsResult = await db.query(`
          SELECT DISTINCT p.id, p.name, p.description, p.module
          FROM core.permissions p
          JOIN core.role_permissions rp ON p.id = rp.permission_id
          WHERE rp.role_id = ANY($1)
        `, [roleIds]);

        req.user.permissions = permissionsResult.rows;
      }

      // Update last activity
      await db.query(`
        UPDATE core.users
        SET last_activity = NOW()
        WHERE id = $1
      `, [req.user.id]);

      next();
    } catch (error) {
      logger.error('Token verification failed', { error: error.message });
      return res.status(401).json({ message: 'Token is invalid or expired' });
    }
  } catch (error) {
    logger.error('Authentication middleware error', { error: error.message });
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Check if user has a specific permission
 * @param {string} permissionName - Name of the permission to check
 */
exports.checkPermission = (permissionName) => {
  return (req, res, next) => {
    try {
      // Skip permission check for admin role
      const isAdmin = req.user.roles.some(role => role.name === 'admin');
      if (isAdmin) {
        return next();
      }

      // Check if user has the required permission
      const hasPermission = req.user.permissions.some(
        permission => permission.name === permissionName
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Access denied. You don't have permission: ${permissionName}` 
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check error', { 
        error: error.message, 
        userId: req.user?.id,
        permissionName 
      });
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

/**
 * Check if user has a specific role
 * @param {string} roleName - Name of the role to check
 */
exports.checkRole = (roleName) => {
  return (req, res, next) => {
    try {
      // Check if user has the required role
      const hasRole = req.user.roles.some(role => role.name === roleName);

      if (!hasRole) {
        return res.status(403).json({ 
          message: `Access denied. You don't have the required role: ${roleName}` 
        });
      }

      next();
    } catch (error) {
      logger.error('Role check error', { 
        error: error.message, 
        userId: req.user?.id,
        roleName 
      });
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

/**
 * Check if user belongs to a specific department
 * @param {string} departmentName - Name of the department to check
 */
exports.checkDepartment = (departmentName) => {
  return (req, res, next) => {
    try {
      // Skip department check for admin role
      const isAdmin = req.user.roles.some(role => role.name === 'admin');
      if (isAdmin) {
        return next();
      }

      // Check if user belongs to the required department
      if (req.user.department_name !== departmentName) {
        return res.status(403).json({ 
          message: `Access denied. You don't belong to the required department: ${departmentName}` 
        });
      }

      next();
    } catch (error) {
      logger.error('Department check error', { 
        error: error.message, 
        userId: req.user?.id,
        departmentName 
      });
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

/**
 * Check if user is the owner of a resource
 * @param {Function} getResourceOwnerId - Function that returns the owner ID of the resource
 */
exports.checkOwnership = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      // Skip ownership check for admin role
      const isAdmin = req.user.roles.some(role => role.name === 'admin');
      if (isAdmin) {
        return next();
      }

      // Get the owner ID of the resource
      const ownerId = await getResourceOwnerId(req);

      // Check if user is the owner
      if (req.user.id !== ownerId) {
        return res.status(403).json({ 
          message: 'Access denied. You are not the owner of this resource' 
        });
      }

      next();
    } catch (error) {
      logger.error('Ownership check error', { 
        error: error.message, 
        userId: req.user?.id
      });
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

/**
 * Combine multiple authorization checks
 * @param {Array} checks - Array of middleware checks to combine
 */
exports.combineChecks = (checks) => {
  return (req, res, next) => {
    // Create a chain of middleware checks
    const runChecks = (index) => {
      if (index >= checks.length) {
        return next();
      }

      checks[index](req, res, (err) => {
        if (err) {
          return next(err);
        }
        runChecks(index + 1);
      });
    };

    runChecks(0);
  };
};
