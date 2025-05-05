/**
 * Database Initialization Script
 * 
 * This script initializes the database by running the schema creation
 * and seed data scripts. It's used for initial setup and can be run
 * with the command: npm run db:init
 */

require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Execute a SQL query
 * @param {string} sql - SQL query to execute
 * @returns {Promise<Object>} - Query result
 */
const executeQuery = async (sql) => {
  const client = await pool.connect();
  try {
    return await client.query(sql);
  } finally {
    client.release();
  }
};

/**
 * Run a SQL file
 * @param {string} filePath - Path to the SQL file
 * @returns {Promise<void>}
 */
const runSqlFile = async (filePath) => {
  try {
    console.log(`Running SQL file: ${filePath}`);
    const sql = await readFile(filePath, 'utf8');
    await executeQuery(sql);
    console.log(`Successfully executed: ${filePath}`);
  } catch (error) {
    console.error(`Error executing SQL file ${filePath}:`, error);
    throw error;
  }
};

/**
 * Initialize the database
 */
const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');

    // Check if database exists
    try {
      await executeQuery('SELECT 1 FROM core.users LIMIT 1');
      console.log('Database already initialized. Skipping initialization.');
      return;
    } catch (error) {
      console.log('Database not initialized. Proceeding with initialization...');
    }

    // Run schema creation script
    await runSqlFile(path.join(__dirname, 'init', '01-schema.sql'));

    // Run seed data script if it exists
    const seedFilePath = path.join(__dirname, 'init', '02-seed.sql');
    if (fs.existsSync(seedFilePath)) {
      await runSqlFile(seedFilePath);
    } else {
      console.log('No seed data file found. Skipping seed data.');
    }

    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run the initialization
initializeDatabase();
