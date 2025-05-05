/**
 * File Service
 * 
 * Handles file uploads, downloads, and management for the platform.
 * Supports local file storage and can be extended to support cloud storage.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const logger = require('../utils/logger');

// Base storage path
const storagePath = process.env.STORAGE_PATH || path.join(__dirname, '../../../storage');

// Ensure storage directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.info(`Created directory: ${dirPath}`);
  }
};

// Initialize storage directories
const initializeStorage = () => {
  const directories = [
    path.join(storagePath, 'uploads'),
    path.join(storagePath, 'uploads/documents'),
    path.join(storagePath, 'uploads/images'),
    path.join(storagePath, 'uploads/temp'),
    path.join(storagePath, 'exports')
  ];

  directories.forEach(ensureDirectoryExists);
};

// Initialize storage on service load
initializeStorage();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(storagePath, 'uploads/temp');
    
    // Determine destination based on file type
    if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(storagePath, 'uploads/images');
    } else if (file.mimetype === 'application/pdf' || 
               file.mimetype === 'application/msword' ||
               file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
               file.mimetype === 'application/vnd.ms-excel' ||
               file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      uploadPath = path.join(storagePath, 'uploads/documents');
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueFilename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * Save file metadata to database
 * @param {Object} fileData - File metadata
 * @param {string} fileData.originalName - Original file name
 * @param {string} fileData.fileName - Stored file name
 * @param {string} fileData.filePath - Path to the file
 * @param {string} fileData.mimeType - File MIME type
 * @param {number} fileData.size - File size in bytes
 * @param {string} fileData.module - Module that owns the file
 * @param {string} fileData.entityType - Type of entity the file is associated with
 * @param {string} fileData.entityId - ID of the entity the file is associated with
 * @param {string} fileData.uploadedBy - ID of the user who uploaded the file
 * @returns {Promise<Object>} - The saved file metadata
 */
exports.saveFileMetadata = async (fileData) => {
  try {
    const db = require('../config/database');
    
    const result = await db.query(
      `INSERT INTO core.files (
        original_name,
        file_name,
        file_path,
        mime_type,
        size,
        module,
        entity_type,
        entity_id,
        uploaded_by,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *`,
      [
        fileData.originalName,
        fileData.fileName,
        fileData.filePath,
        fileData.mimeType,
        fileData.size,
        fileData.module,
        fileData.entityType,
        fileData.entityId,
        fileData.uploadedBy
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    logger.error('Error saving file metadata', { error: error.message });
    throw error;
  }
};

/**
 * Get file metadata by ID
 * @param {string} fileId - File ID
 * @returns {Promise<Object>} - File metadata
 */
exports.getFileById = async (fileId) => {
  try {
    const db = require('../config/database');
    
    const result = await db.query(
      'SELECT * FROM core.files WHERE id = $1',
      [fileId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('File not found');
    }
    
    return result.rows[0];
  } catch (error) {
    logger.error('Error getting file by ID', { error: error.message });
    throw error;
  }
};

/**
 * Get files by entity
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @returns {Promise<Array<Object>>} - List of file metadata
 */
exports.getFilesByEntity = async (entityType, entityId) => {
  try {
    const db = require('../config/database');
    
    const result = await db.query(
      'SELECT * FROM core.files WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC',
      [entityType, entityId]
    );
    
    return result.rows;
  } catch (error) {
    logger.error('Error getting files by entity', { error: error.message });
    throw error;
  }
};

/**
 * Delete a file
 * @param {string} fileId - File ID
 * @returns {Promise<boolean>} - Whether the file was deleted
 */
exports.deleteFile = async (fileId) => {
  try {
    const db = require('../config/database');
    
    // Get file metadata
    const fileResult = await db.query(
      'SELECT * FROM core.files WHERE id = $1',
      [fileId]
    );
    
    if (fileResult.rows.length === 0) {
      throw new Error('File not found');
    }
    
    const file = fileResult.rows[0];
    
    // Delete file from filesystem
    const filePath = file.file_path;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete file metadata from database
    await db.query(
      'DELETE FROM core.files WHERE id = $1',
      [fileId]
    );
    
    return true;
  } catch (error) {
    logger.error('Error deleting file', { error: error.message });
    throw error;
  }
};

/**
 * Get file stream for download
 * @param {string} filePath - Path to the file
 * @returns {fs.ReadStream} - File read stream
 */
exports.getFileStream = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    
    return fs.createReadStream(filePath);
  } catch (error) {
    logger.error('Error getting file stream', { error: error.message });
    throw error;
  }
};

/**
 * Move a file from temp directory to its final location
 * @param {string} tempPath - Path to the temporary file
 * @param {string} destinationDir - Destination directory
 * @param {string} filename - New filename
 * @returns {Promise<string>} - Path to the moved file
 */
exports.moveFile = async (tempPath, destinationDir, filename) => {
  try {
    ensureDirectoryExists(destinationDir);
    
    const destinationPath = path.join(destinationDir, filename);
    
    // Create read and write streams
    const readStream = fs.createReadStream(tempPath);
    const writeStream = fs.createWriteStream(destinationPath);
    
    // Move the file
    await new Promise((resolve, reject) => {
      readStream.pipe(writeStream);
      readStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.on('finish', resolve);
    });
    
    // Delete the temporary file
    fs.unlinkSync(tempPath);
    
    return destinationPath;
  } catch (error) {
    logger.error('Error moving file', { error: error.message });
    throw error;
  }
};

// Export multer middleware for use in routes
exports.upload = upload;

// Export storage path
exports.storagePath = storagePath;
