/**
 * Database Configuration
 * 
 * Configures the PostgreSQL database connection using the pg module.
 */

const { Pool } = require('pg');
const logger = require('../utils/logger');

// Create a new Pool instance with connection details from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Log connection events
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('PostgreSQL error', { error: err.message, stack: err.stack });
});

/**
 * Execute a database query
 * @param {string} text - The SQL query text
 * @param {Array} params - The query parameters
 * @returns {Promise<Object>} - The query result
 */
module.exports = {
  query: async (text, params) => {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      
      // Log query details for debugging in development
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Executed query', { 
          text, 
          params, 
          duration, 
          rows: result.rowCount 
        });
      }
      
      return result;
    } catch (error) {
      logger.error('Database query error', { 
        error: error.message, 
        query: text,
        params
      });
      throw error;
    }
  },
  
  /**
   * Get a client from the pool for transactions
   * @returns {Promise<Object>} - The database client
   */
  getClient: async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    
    // Override client.query to log queries
    client.query = (...args) => {
      client.lastQuery = args;
      return query.apply(client, args);
    };
    
    // Override client.release to track release time
    client.release = () => {
      client.query = query;
      client.release = release;
      return release.apply(client);
    };
    
    return client;
  },
  
  /**
   * Execute a transaction with multiple queries
   * @param {Function} callback - Function that receives a client and executes queries
   * @returns {Promise<any>} - The result of the callback function
   */
  transaction: async (callback) => {
    const client = await module.exports.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction error', { error: error.message });
      throw error;
    } finally {
      client.release();
    }
  },
  
  /**
   * Close the database pool
   * @returns {Promise<void>}
   */
  close: async () => {
    await pool.end();
    logger.info('Database pool closed');
  }
};
