/**
 * Listing Controller
 * 
 * Handles operations related to property listings in the Real Estate module.
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');
const notificationService = require('../../services/notificationService');

/**
 * Get all listings
 * @route GET /api/real-estate/listings
 */
exports.getAllListings = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { 
      status, 
      agentId, 
      minPrice, 
      maxPrice,
      propertyType,
      city,
      state,
      limit = 20,
      offset = 0
    } = req.query;

    // Build query
    let query = `
      SELECT l.*, 
             p.address, p.city, p.state, p.zip, p.type, p.bedrooms, p.bathrooms, p.square_feet, p.images,
             u.first_name as agent_first_name, u.last_name as agent_last_name
      FROM real_estate.listings l
      JOIN real_estate.properties p ON l.property_id = p.id
      JOIN core.users u ON l.agent_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;

    // Add filters if provided
    if (status) {
      query += ` AND l.status = $${paramIndex++}`;
      queryParams.push(status);
    }

    if (agentId) {
      query += ` AND l.agent_id = $${paramIndex++}`;
      queryParams.push(agentId);
    }

    if (minPrice) {
      query += ` AND l.list_price >= $${paramIndex++}`;
      queryParams.push(minPrice);
    }

    if (maxPrice) {
      query += ` AND l.list_price <= $${paramIndex++}`;
      queryParams.push(maxPrice);
    }

    if (propertyType) {
      query += ` AND p.type = $${paramIndex++}`;
      queryParams.push(propertyType);
    }

    if (city) {
      query += ` AND p.city = $${paramIndex++}`;
      queryParams.push(city);
    }

    if (state) {
      query += ` AND p.state = $${paramIndex++}`;
      queryParams.push(state);
    }

    // Add pagination
    query += ` ORDER BY l.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(limit, offset);

    // Execute query
    const result = await db.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM real_estate.listings l
      JOIN real_estate.properties p ON l.property_id = p.id
      WHERE 1=1
    `;
    
    // Add the same filters to count query
    let countQueryParams = [];
    let countParamIndex = 1;
    
    if (status) {
      countQuery += ` AND l.status = $${countParamIndex++}`;
      countQueryParams.push(status);
    }

    if (agentId) {
      countQuery += ` AND l.agent_id = $${countParamIndex++}`;
      countQueryParams.push(agentId);
    }

    if (minPrice) {
      countQuery += ` AND l.list_price >= $${countParamIndex++}`;
      countQueryParams.push(minPrice);
    }

    if (maxPrice) {
      countQuery += ` AND l.list_price <= $${countParamIndex++}`;
      countQueryParams.push(maxPrice);
    }

    if (propertyType) {
      countQuery += ` AND p.type = $${countParamIndex++}`;
      countQueryParams.push(propertyType);
    }

    if (city) {
      countQuery += ` AND p.city = $${countParamIndex++}`;
      countQueryParams.push(city);
    }

    if (state) {
      countQuery += ` AND p.state = $${countParamIndex++}`;
      countQueryParams.push(state);
    }

    const countResult = await db.query(countQuery, countQueryParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    res.status(200).json({
      listings: result.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        hasMore: totalCount > parseInt(offset, 10) + parseInt(limit, 10)
      }
    });
  } catch (error) {
    logger.error('Error getting listings', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching listings' });
  }
};

/**
 * Get a listing by ID
 * @route GET /api/real-estate/listings/:id
 */
exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get listing with property and agent details
    const result = await db.query(
      `SELECT l.*, 
              p.address, p.city, p.state, p.zip, p.type, p.bedrooms, p.bathrooms, 
              p.square_feet, p.lot_size, p.year_built, p.description, p.images,
              u.first_name as agent_first_name, u.last_name as agent_last_name,
              u.email as agent_email, u.job_title as agent_job_title
       FROM real_estate.listings l
       JOIN real_estate.properties p ON l.property_id = p.id
       JOIN core.users u ON l.agent_id = u.id
       WHERE l.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Get showings for this listing
    const showingsResult = await db.query(
      `SELECT s.*, c.first_name, c.last_name, c.email, c.phone
       FROM real_estate.showings s
       JOIN real_estate.clients c ON s.client_id = c.id
       WHERE s.listing_id = $1
       ORDER BY s.start_time DESC`,
      [id]
    );

    // Get offers for this listing
    const offersResult = await db.query(
      `SELECT o.*, c.first_name, c.last_name, c.email, c.phone
       FROM real_estate.offers o
       JOIN real_estate.clients c ON o.client_id = c.id
       WHERE o.listing_id = $1
       ORDER BY o.offer_date DESC`,
      [id]
    );

    const listing = result.rows[0];
    listing.showings = showingsResult.rows;
    listing.offers = offersResult.rows;

    res.status(200).json(listing);
  } catch (error) {
    logger.error('Error getting listing by ID', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching listing' });
  }
};

/**
 * Create a new listing
 * @route POST /api/real-estate/listings
 */
exports.createListing = async (req, res) => {
  try {
    const {
      propertyId,
      agentId,
      listPrice,
      startDate,
      endDate,
      status
    } = req.body;

    // Check if property exists
    const propertyResult = await db.query(
      'SELECT * FROM real_estate.properties WHERE id = $1',
      [propertyId]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if agent exists
    const agentResult = await db.query(
      'SELECT * FROM core.users WHERE id = $1',
      [agentId]
    );

    if (agentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check if property already has an active listing
    const activeListingResult = await db.query(
      "SELECT id FROM real_estate.listings WHERE property_id = $1 AND status = 'Active'",
      [propertyId]
    );

    if (activeListingResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Property already has an active listing' 
      });
    }

    // Insert listing
    const result = await db.query(
      `INSERT INTO real_estate.listings (
        property_id,
        agent_id,
        list_price,
        start_date,
        end_date,
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`,
      [
        propertyId,
        agentId,
        listPrice,
        startDate,
        endDate,
        status
      ]
    );

    const newListing = result.rows[0];

    // Update property status if listing is active
    if (status === 'Active') {
      await db.query(
        "UPDATE real_estate.properties SET status = 'Available' WHERE id = $1",
        [propertyId]
      );
    }

    // Notify real estate managers about new listing
    try {
      await notificationService.notifyRole('real_estate_manager', {
        type: 'info',
        title: 'New Property Listing',
        message: `A new property has been listed at ${propertyResult.rows[0].address} for ${formatCurrency(listPrice)}`,
        module: 'real_estate',
        entityType: 'listing',
        entityId: newListing.id,
        actionUrl: `/real-estate/listings/${newListing.id}`,
        isEmail: true
      });
    } catch (notificationError) {
      logger.error('Error sending listing notification', { error: notificationError.message });
      // Continue even if notification fails
    }

    res.status(201).json(newListing);
  } catch (error) {
    logger.error('Error creating listing', { error: error.message });
    res.status(500).json({ message: 'Server error while creating listing' });
  }
};

/**
 * Update a listing
 * @route PUT /api/real-estate/listings/:id
 */
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      propertyId,
      agentId,
      listPrice,
      startDate,
      endDate,
      status
    } = req.body;

    // Check if listing exists
    const listingResult = await db.query(
      'SELECT * FROM real_estate.listings WHERE id = $1',
      [id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const currentListing = listingResult.rows[0];

    // Check if property exists
    const propertyResult = await db.query(
      'SELECT * FROM real_estate.properties WHERE id = $1',
      [propertyId]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if agent exists
    const agentResult = await db.query(
      'SELECT * FROM core.users WHERE id = $1',
      [agentId]
    );

    if (agentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // If status is changing to 'Active', check if property already has another active listing
    if (status === 'Active' && currentListing.status !== 'Active') {
      const activeListingResult = await db.query(
        "SELECT id FROM real_estate.listings WHERE property_id = $1 AND status = 'Active' AND id != $2",
        [propertyId, id]
      );

      if (activeListingResult.rows.length > 0) {
        return res.status(400).json({ 
          message: 'Property already has an active listing' 
        });
      }
    }

    // Update listing
    const result = await db.query(
      `UPDATE real_estate.listings
       SET property_id = $1,
           agent_id = $2,
           list_price = $3,
           start_date = $4,
           end_date = $5,
           status = $6,
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        propertyId,
        agentId,
        listPrice,
        startDate,
        endDate,
        status,
        id
      ]
    );

    const updatedListing = result.rows[0];

    // Update property status based on listing status
    if (status === 'Active') {
      await db.query(
        "UPDATE real_estate.properties SET status = 'Available' WHERE id = $1",
        [propertyId]
      );
    } else if (status === 'Sold') {
      await db.query(
        "UPDATE real_estate.properties SET status = 'Sold' WHERE id = $1",
        [propertyId]
      );
    } else if (status === 'Expired' || status === 'Cancelled') {
      // Check if property has any other active listings
      const otherActiveListings = await db.query(
        "SELECT id FROM real_estate.listings WHERE property_id = $1 AND status = 'Active' AND id != $2",
        [propertyId, id]
      );

      if (otherActiveListings.rows.length === 0) {
        await db.query(
          "UPDATE real_estate.properties SET status = 'Inactive' WHERE id = $1",
          [propertyId]
        );
      }
    }

    // If status changed, send notification
    if (currentListing.status !== status) {
      try {
        // Notify the agent
        await notificationService.createNotification({
          userId: agentId,
          type: 'info',
          title: 'Listing Status Updated',
          message: `The listing for ${propertyResult.rows[0].address} has been updated to ${status}`,
          module: 'real_estate',
          entityType: 'listing',
          entityId: id,
          actionUrl: `/real-estate/listings/${id}`,
          isEmail: true
        });
      } catch (notificationError) {
        logger.error('Error sending listing update notification', { error: notificationError.message });
        // Continue even if notification fails
      }
    }

    res.status(200).json(updatedListing);
  } catch (error) {
    logger.error('Error updating listing', { error: error.message });
    res.status(500).json({ message: 'Server error while updating listing' });
  }
};

/**
 * Delete a listing
 * @route DELETE /api/real-estate/listings/:id
 */
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if listing exists
    const listingResult = await db.query(
      'SELECT * FROM real_estate.listings WHERE id = $1',
      [id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = listingResult.rows[0];

    // Check if listing has showings
    const showingsResult = await db.query(
      'SELECT id FROM real_estate.showings WHERE listing_id = $1',
      [id]
    );

    if (showingsResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete listing with associated showings' 
      });
    }

    // Check if listing has offers
    const offersResult = await db.query(
      'SELECT id FROM real_estate.offers WHERE listing_id = $1',
      [id]
    );

    if (offersResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete listing with associated offers' 
      });
    }

    // Delete listing
    await db.query(
      'DELETE FROM real_estate.listings WHERE id = $1',
      [id]
    );

    // Update property status if this was an active listing
    if (listing.status === 'Active') {
      // Check if property has any other active listings
      const otherActiveListings = await db.query(
        "SELECT id FROM real_estate.listings WHERE property_id = $1 AND status = 'Active'",
        [listing.property_id]
      );

      if (otherActiveListings.rows.length === 0) {
        await db.query(
          "UPDATE real_estate.properties SET status = 'Inactive' WHERE id = $1",
          [listing.property_id]
        );
      }
    }

    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    logger.error('Error deleting listing', { error: error.message });
    res.status(500).json({ message: 'Server error while deleting listing' });
  }
};

/**
 * Format currency for notifications
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
