/**
 * Showing Controller
 * 
 * Handles operations related to property showings in the Real Estate module.
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');
const notificationService = require('../../services/notificationService');
const emailService = require('../../services/emailService');

/**
 * Get all showings
 * @route GET /api/real-estate/showings
 */
exports.getAllShowings = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { 
      agentId, 
      clientId, 
      listingId,
      propertyId,
      startDate,
      endDate,
      status,
      limit = 20,
      offset = 0
    } = req.query;

    // Build query
    let query = `
      SELECT s.*, 
             c.first_name as client_first_name, c.last_name as client_last_name, c.email as client_email, c.phone as client_phone,
             l.list_price, l.status as listing_status,
             p.address, p.city, p.state, p.zip, p.type, p.bedrooms, p.bathrooms, p.square_feet,
             u.first_name as agent_first_name, u.last_name as agent_last_name
      FROM real_estate.showings s
      JOIN real_estate.clients c ON s.client_id = c.id
      JOIN real_estate.listings l ON s.listing_id = l.id
      JOIN real_estate.properties p ON l.property_id = p.id
      JOIN core.users u ON l.agent_id = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;

    // Add filters if provided
    if (agentId) {
      query += ` AND l.agent_id = $${paramIndex++}`;
      queryParams.push(agentId);
    }

    if (clientId) {
      query += ` AND s.client_id = $${paramIndex++}`;
      queryParams.push(clientId);
    }

    if (listingId) {
      query += ` AND s.listing_id = $${paramIndex++}`;
      queryParams.push(listingId);
    }

    if (propertyId) {
      query += ` AND l.property_id = $${paramIndex++}`;
      queryParams.push(propertyId);
    }

    if (startDate) {
      query += ` AND s.start_time >= $${paramIndex++}`;
      queryParams.push(startDate);
    }

    if (endDate) {
      query += ` AND s.start_time <= $${paramIndex++}`;
      queryParams.push(endDate);
    }

    if (status) {
      query += ` AND s.status = $${paramIndex++}`;
      queryParams.push(status);
    }

    // Add pagination
    query += ` ORDER BY s.start_time DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(limit, offset);

    // Execute query
    const result = await db.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM real_estate.showings s
      JOIN real_estate.listings l ON s.listing_id = l.id
      WHERE 1=1
    `;
    
    // Add the same filters to count query
    let countQueryParams = [];
    let countParamIndex = 1;
    
    if (agentId) {
      countQuery += ` AND l.agent_id = $${countParamIndex++}`;
      countQueryParams.push(agentId);
    }

    if (clientId) {
      countQuery += ` AND s.client_id = $${countParamIndex++}`;
      countQueryParams.push(clientId);
    }

    if (listingId) {
      countQuery += ` AND s.listing_id = $${countParamIndex++}`;
      countQueryParams.push(listingId);
    }

    if (propertyId) {
      countQuery += ` AND l.property_id = $${countParamIndex++}`;
      countQueryParams.push(propertyId);
    }

    if (startDate) {
      countQuery += ` AND s.start_time >= $${countParamIndex++}`;
      countQueryParams.push(startDate);
    }

    if (endDate) {
      countQuery += ` AND s.start_time <= $${countParamIndex++}`;
      countQueryParams.push(endDate);
    }

    if (status) {
      countQuery += ` AND s.status = $${countParamIndex++}`;
      countQueryParams.push(status);
    }

    const countResult = await db.query(countQuery, countQueryParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    res.status(200).json({
      showings: result.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        hasMore: totalCount > parseInt(offset, 10) + parseInt(limit, 10)
      }
    });
  } catch (error) {
    logger.error('Error getting showings', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching showings' });
  }
};

/**
 * Get a showing by ID
 * @route GET /api/real-estate/showings/:id
 */
exports.getShowingById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get showing with related details
    const result = await db.query(
      `SELECT s.*, 
              c.first_name as client_first_name, c.last_name as client_last_name, 
              c.email as client_email, c.phone as client_phone,
              l.list_price, l.status as listing_status,
              p.address, p.city, p.state, p.zip, p.type, p.bedrooms, p.bathrooms, 
              p.square_feet, p.images,
              u.first_name as agent_first_name, u.last_name as agent_last_name,
              u.email as agent_email, u.phone as agent_phone
       FROM real_estate.showings s
       JOIN real_estate.clients c ON s.client_id = c.id
       JOIN real_estate.listings l ON s.listing_id = l.id
       JOIN real_estate.properties p ON l.property_id = p.id
       JOIN core.users u ON l.agent_id = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Showing not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error('Error getting showing by ID', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching showing' });
  }
};

/**
 * Create a new showing
 * @route POST /api/real-estate/showings
 */
exports.createShowing = async (req, res) => {
  try {
    const {
      listingId,
      clientId,
      startTime,
      endTime,
      notes,
      status = 'Scheduled',
      feedback
    } = req.body;

    // Check if listing exists
    const listingResult = await db.query(
      `SELECT l.*, p.address, p.city, p.state, p.zip, u.id as agent_id, u.email as agent_email,
              u.first_name as agent_first_name, u.last_name as agent_last_name
       FROM real_estate.listings l
       JOIN real_estate.properties p ON l.property_id = p.id
       JOIN core.users u ON l.agent_id = u.id
       WHERE l.id = $1`,
      [listingId]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = listingResult.rows[0];

    // Check if client exists
    const clientResult = await db.query(
      'SELECT * FROM real_estate.clients WHERE id = $1',
      [clientId]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const client = clientResult.rows[0];

    // Check for scheduling conflicts
    const conflictResult = await db.query(
      `SELECT id FROM real_estate.showings 
       WHERE listing_id = $1 
       AND (
         (start_time <= $2 AND end_time >= $2) OR
         (start_time <= $3 AND end_time >= $3) OR
         (start_time >= $2 AND end_time <= $3)
       )`,
      [listingId, startTime, endTime]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'There is a scheduling conflict with another showing' 
      });
    }

    // Insert showing
    const result = await db.query(
      `INSERT INTO real_estate.showings (
        listing_id,
        client_id,
        start_time,
        end_time,
        notes,
        status,
        feedback,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *`,
      [
        listingId,
        clientId,
        startTime,
        endTime,
        notes,
        status,
        feedback
      ]
    );

    const newShowing = result.rows[0];

    // Send notifications
    try {
      // Notify the agent
      await notificationService.createNotification({
        userId: listing.agent_id,
        type: 'info',
        title: 'New Showing Scheduled',
        message: `A showing has been scheduled for ${listing.address} on ${formatDateTime(startTime)}`,
        module: 'real_estate',
        entityType: 'showing',
        entityId: newShowing.id,
        actionUrl: `/real-estate/showings/${newShowing.id}`,
        isEmail: true
      });

      // Send email to client
      await emailService.sendEmail({
        to: client.email,
        subject: 'Property Showing Confirmation',
        template: 'showing-confirmation',
        data: {
          clientName: `${client.first_name} ${client.last_name}`,
          propertyAddress: `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`,
          showingDate: formatDate(startTime),
          showingTime: `${formatTime(startTime)} - ${formatTime(endTime)}`,
          agentName: `${listing.agent_first_name} ${listing.agent_last_name}`,
          agentEmail: listing.agent_email,
          showingId: newShowing.id
        }
      });
    } catch (notificationError) {
      logger.error('Error sending showing notifications', { error: notificationError.message });
      // Continue even if notification fails
    }

    res.status(201).json(newShowing);
  } catch (error) {
    logger.error('Error creating showing', { error: error.message });
    res.status(500).json({ message: 'Server error while creating showing' });
  }
};

/**
 * Update a showing
 * @route PUT /api/real-estate/showings/:id
 */
exports.updateShowing = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      listingId,
      clientId,
      startTime,
      endTime,
      notes,
      status,
      feedback
    } = req.body;

    // Check if showing exists
    const showingResult = await db.query(
      'SELECT * FROM real_estate.showings WHERE id = $1',
      [id]
    );

    if (showingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Showing not found' });
    }

    const currentShowing = showingResult.rows[0];

    // Check if listing exists
    const listingResult = await db.query(
      `SELECT l.*, p.address, p.city, p.state, p.zip, u.id as agent_id, u.email as agent_email,
              u.first_name as agent_first_name, u.last_name as agent_last_name
       FROM real_estate.listings l
       JOIN real_estate.properties p ON l.property_id = p.id
       JOIN core.users u ON l.agent_id = u.id
       WHERE l.id = $1`,
      [listingId]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = listingResult.rows[0];

    // Check if client exists
    const clientResult = await db.query(
      'SELECT * FROM real_estate.clients WHERE id = $1',
      [clientId]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const client = clientResult.rows[0];

    // Check for scheduling conflicts if time is changing
    if (startTime !== currentShowing.start_time || endTime !== currentShowing.end_time) {
      const conflictResult = await db.query(
        `SELECT id FROM real_estate.showings 
         WHERE listing_id = $1 
         AND id != $2
         AND (
           (start_time <= $3 AND end_time >= $3) OR
           (start_time <= $4 AND end_time >= $4) OR
           (start_time >= $3 AND end_time <= $4)
         )`,
        [listingId, id, startTime, endTime]
      );

      if (conflictResult.rows.length > 0) {
        return res.status(400).json({ 
          message: 'There is a scheduling conflict with another showing' 
        });
      }
    }

    // Update showing
    const result = await db.query(
      `UPDATE real_estate.showings
       SET listing_id = $1,
           client_id = $2,
           start_time = $3,
           end_time = $4,
           notes = $5,
           status = $6,
           feedback = $7,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        listingId,
        clientId,
        startTime,
        endTime,
        notes,
        status,
        feedback,
        id
      ]
    );

    const updatedShowing = result.rows[0];

    // Send notifications if status changed
    if (currentShowing.status !== status) {
      try {
        // Notify the agent
        await notificationService.createNotification({
          userId: listing.agent_id,
          type: 'info',
          title: 'Showing Status Updated',
          message: `The showing for ${listing.address} has been updated to ${status}`,
          module: 'real_estate',
          entityType: 'showing',
          entityId: id,
          actionUrl: `/real-estate/showings/${id}`,
          isEmail: true
        });

        // If showing was cancelled, notify client
        if (status === 'Cancelled') {
          await emailService.sendEmail({
            to: client.email,
            subject: 'Property Showing Cancelled',
            template: 'showing-cancelled',
            data: {
              clientName: `${client.first_name} ${client.last_name}`,
              propertyAddress: `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`,
              showingDate: formatDate(startTime),
              showingTime: `${formatTime(startTime)} - ${formatTime(endTime)}`,
              agentName: `${listing.agent_first_name} ${listing.agent_last_name}`,
              agentEmail: listing.agent_email
            }
          });
        }
        // If showing was rescheduled, notify client
        else if (startTime !== currentShowing.start_time || endTime !== currentShowing.end_time) {
          await emailService.sendEmail({
            to: client.email,
            subject: 'Property Showing Rescheduled',
            template: 'showing-rescheduled',
            data: {
              clientName: `${client.first_name} ${client.last_name}`,
              propertyAddress: `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`,
              showingDate: formatDate(startTime),
              showingTime: `${formatTime(startTime)} - ${formatTime(endTime)}`,
              previousDate: formatDate(currentShowing.start_time),
              previousTime: `${formatTime(currentShowing.start_time)} - ${formatTime(currentShowing.end_time)}`,
              agentName: `${listing.agent_first_name} ${listing.agent_last_name}`,
              agentEmail: listing.agent_email,
              showingId: id
            }
          });
        }
      } catch (notificationError) {
        logger.error('Error sending showing update notifications', { error: notificationError.message });
        // Continue even if notification fails
      }
    }

    res.status(200).json(updatedShowing);
  } catch (error) {
    logger.error('Error updating showing', { error: error.message });
    res.status(500).json({ message: 'Server error while updating showing' });
  }
};

/**
 * Delete a showing
 * @route DELETE /api/real-estate/showings/:id
 */
exports.deleteShowing = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if showing exists
    const showingResult = await db.query(
      `SELECT s.*, 
              c.first_name as client_first_name, c.last_name as client_last_name, c.email as client_email,
              l.agent_id, p.address, p.city, p.state, p.zip,
              u.first_name as agent_first_name, u.last_name as agent_last_name, u.email as agent_email
       FROM real_estate.showings s
       JOIN real_estate.clients c ON s.client_id = c.id
       JOIN real_estate.listings l ON s.listing_id = l.id
       JOIN real_estate.properties p ON l.property_id = p.id
       JOIN core.users u ON l.agent_id = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (showingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Showing not found' });
    }

    const showing = showingResult.rows[0];

    // Delete showing
    await db.query(
      'DELETE FROM real_estate.showings WHERE id = $1',
      [id]
    );

    // Send notifications
    try {
      // Notify the agent
      await notificationService.createNotification({
        userId: showing.agent_id,
        type: 'info',
        title: 'Showing Deleted',
        message: `The showing for ${showing.address} on ${formatDateTime(showing.start_time)} has been deleted`,
        module: 'real_estate',
        entityType: 'showing',
        isEmail: true
      });

      // Notify the client
      await emailService.sendEmail({
        to: showing.client_email,
        subject: 'Property Showing Cancelled',
        template: 'showing-cancelled',
        data: {
          clientName: `${showing.client_first_name} ${showing.client_last_name}`,
          propertyAddress: `${showing.address}, ${showing.city}, ${showing.state} ${showing.zip}`,
          showingDate: formatDate(showing.start_time),
          showingTime: `${formatTime(showing.start_time)} - ${formatTime(showing.end_time)}`,
          agentName: `${showing.agent_first_name} ${showing.agent_last_name}`,
          agentEmail: showing.agent_email
        }
      });
    } catch (notificationError) {
      logger.error('Error sending showing deletion notifications', { error: notificationError.message });
      // Continue even if notification fails
    }

    res.status(200).json({ message: 'Showing deleted successfully' });
  } catch (error) {
    logger.error('Error deleting showing', { error: error.message });
    res.status(500).json({ message: 'Server error while deleting showing' });
  }
};

/**
 * Format date for notifications
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time for notifications
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted time string
 */
function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format date and time for notifications
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date and time string
 */
function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
