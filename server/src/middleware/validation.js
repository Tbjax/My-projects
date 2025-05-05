/**
 * Validation Middleware
 * 
 * Handles request validation using express-validator.
 * This middleware checks for validation errors and returns
 * appropriate error responses.
 */

const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Middleware to check for validation errors
 * If errors exist, returns a 400 response with error details
 */
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log validation errors
    logger.warn('Validation error', { 
      path: req.path, 
      method: req.method,
      errors: errors.array()
    });
    
    // Format errors for response
    const formattedErrors = errors.array().reduce((acc, error) => {
      const field = error.path;
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push(error.msg);
      return acc;
    }, {});
    
    return res.status(400).json({
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};
