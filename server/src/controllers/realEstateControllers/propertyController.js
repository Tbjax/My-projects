/**
 * Property Controller
 * 
 * Handles operations related to properties in the Real Estate module.
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Get all properties
 * @route GET /api/real-estate/properties
 */
exports.getAllProperties = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { 
      type, 
      minPrice, 
      maxPrice, 
      minBedrooms, 
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      status,
      city,
      state,
      limit = 20,
      offset = 0
    } = req.query;

    // Build query
    let query = `
      SELECT * FROM real_estate.properties
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;

    // Add filters if provided
    if (type) {
      query += ` AND type = $${paramIndex++}`;
      queryParams.push(type);
    }

    if (minPrice) {
      query += ` AND listing_price >= $${paramIndex++}`;
      queryParams.push(minPrice);
    }

    if (maxPrice) {
      query += ` AND listing_price <= $${paramIndex++}`;
      queryParams.push(maxPrice);
    }

    if (minBedrooms) {
      query += ` AND bedrooms >= $${paramIndex++}`;
      queryParams.push(minBedrooms);
    }

    if (maxBedrooms) {
      query += ` AND bedrooms <= $${paramIndex++}`;
      queryParams.push(maxBedrooms);
    }

    if (minBathrooms) {
      query += ` AND bathrooms >= $${paramIndex++}`;
      queryParams.push(minBathrooms);
    }

    if (maxBathrooms) {
      query += ` AND bathrooms <= $${paramIndex++}`;
      queryParams.push(maxBathrooms);
    }

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      queryParams.push(status);
    }

    if (city) {
      query += ` AND city = $${paramIndex++}`;
      queryParams.push(city);
    }

    if (state) {
      query += ` AND state = $${paramIndex++}`;
      queryParams.push(state);
    }

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(limit, offset);

    // Execute query
    const result = await db.query(query, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) FROM real_estate.properties
      WHERE 1=1
    `;
    
    // Add the same filters to count query
    let countQueryParams = [];
    let countParamIndex = 1;
    
    if (type) {
      countQuery += ` AND type = $${countParamIndex++}`;
      countQueryParams.push(type);
    }

    if (minPrice) {
      countQuery += ` AND listing_price >= $${countParamIndex++}`;
      countQueryParams.push(minPrice);
    }

    if (maxPrice) {
      countQuery += ` AND listing_price <= $${countParamIndex++}`;
      countQueryParams.push(maxPrice);
    }

    if (minBedrooms) {
      countQuery += ` AND bedrooms >= $${countParamIndex++}`;
      countQueryParams.push(minBedrooms);
    }

    if (maxBedrooms) {
      countQuery += ` AND bedrooms <= $${countParamIndex++}`;
      countQueryParams.push(maxBedrooms);
    }

    if (minBathrooms) {
      countQuery += ` AND bathrooms >= $${countParamIndex++}`;
      countQueryParams.push(minBathrooms);
    }

    if (maxBathrooms) {
      countQuery += ` AND bathrooms <= $${countParamIndex++}`;
      countQueryParams.push(maxBathrooms);
    }

    if (status) {
      countQuery += ` AND status = $${countParamIndex++}`;
      countQueryParams.push(status);
    }

    if (city) {
      countQuery += ` AND city = $${countParamIndex++}`;
      countQueryParams.push(city);
    }

    if (state) {
      countQuery += ` AND state = $${countParamIndex++}`;
      countQueryParams.push(state);
    }

    const countResult = await db.query(countQuery, countQueryParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    res.status(200).json({
      properties: result.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        hasMore: totalCount > parseInt(offset, 10) + parseInt(limit, 10)
      }
    });
  } catch (error) {
    logger.error('Error getting properties', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching properties' });
  }
};

/**
 * Get a property by ID
 * @route GET /api/real-estate/properties/:id
 */
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get property
    const propertyResult = await db.query(
      'SELECT * FROM real_estate.properties WHERE id = $1',
      [id]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Get active listing for this property if exists
    const listingResult = await db.query(
      `SELECT l.*, u.first_name as agent_first_name, u.last_name as agent_last_name
       FROM real_estate.listings l
       JOIN core.users u ON l.agent_id = u.id
       WHERE l.property_id = $1 AND l.status = 'Active'
       ORDER BY l.created_at DESC
       LIMIT 1`,
      [id]
    );

    const property = propertyResult.rows[0];
    
    if (listingResult.rows.length > 0) {
      property.listing = listingResult.rows[0];
    }

    res.status(200).json(property);
  } catch (error) {
    logger.error('Error getting property by ID', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching property' });
  }
};

/**
 * Create a new property
 * @route POST /api/real-estate/properties
 */
exports.createProperty = async (req, res) => {
  try {
    const {
      address,
      city,
      state,
      zip,
      country,
      type,
      bedrooms,
      bathrooms,
      squareFeet,
      lotSize,
      yearBuilt,
      listingPrice,
      salePrice,
      status,
      description,
      images
    } = req.body;

    // Insert property
    const result = await db.query(
      `INSERT INTO real_estate.properties (
        address,
        city,
        state,
        zip,
        country,
        type,
        bedrooms,
        bathrooms,
        square_feet,
        lot_size,
        year_built,
        listing_price,
        sale_price,
        status,
        description,
        images,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
      RETURNING *`,
      [
        address,
        city,
        state,
        zip,
        country,
        type,
        bedrooms,
        bathrooms,
        squareFeet,
        lotSize,
        yearBuilt,
        listingPrice,
        salePrice,
        status,
        description,
        images || []
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error creating property', { error: error.message });
    res.status(500).json({ message: 'Server error while creating property' });
  }
};

/**
 * Update a property
 * @route PUT /api/real-estate/properties/:id
 */
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      address,
      city,
      state,
      zip,
      country,
      type,
      bedrooms,
      bathrooms,
      squareFeet,
      lotSize,
      yearBuilt,
      listingPrice,
      salePrice,
      status,
      description,
      images
    } = req.body;

    // Check if property exists
    const checkResult = await db.query(
      'SELECT id FROM real_estate.properties WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Update property
    const result = await db.query(
      `UPDATE real_estate.properties
       SET address = $1,
           city = $2,
           state = $3,
           zip = $4,
           country = $5,
           type = $6,
           bedrooms = $7,
           bathrooms = $8,
           square_feet = $9,
           lot_size = $10,
           year_built = $11,
           listing_price = $12,
           sale_price = $13,
           status = $14,
           description = $15,
           images = $16,
           updated_at = NOW()
       WHERE id = $17
       RETURNING *`,
      [
        address,
        city,
        state,
        zip,
        country,
        type,
        bedrooms,
        bathrooms,
        squareFeet,
        lotSize,
        yearBuilt,
        listingPrice,
        salePrice,
        status,
        description,
        images || [],
        id
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating property', { error: error.message });
    res.status(500).json({ message: 'Server error while updating property' });
  }
};

/**
 * Delete a property
 * @route DELETE /api/real-estate/properties/:id
 */
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists
    const checkResult = await db.query(
      'SELECT id FROM real_estate.properties WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if property has active listings
    const listingResult = await db.query(
      "SELECT id FROM real_estate.listings WHERE property_id = $1 AND status = 'Active'",
      [id]
    );

    if (listingResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete property with active listings' 
      });
    }

    // Delete property
    await db.query(
      'DELETE FROM real_estate.properties WHERE id = $1',
      [id]
    );

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    logger.error('Error deleting property', { error: error.message });
    res.status(500).json({ message: 'Server error while deleting property' });
  }
};
