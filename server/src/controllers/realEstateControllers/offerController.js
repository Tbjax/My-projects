/**
 * Offer Controller
 * 
 * Handles operations related to property offers in the Real Estate module.
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');
const notificationService = require('../../services/notificationService');
const emailService = require('../../services/emailService');
const workflowService = require('../../services/workflow');

/**
 * Get all offers
 * @route GET /api/real-estate/offers
 */
exports.getAllOffers = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { 
      agentId, 
      clientId, 
      listingId,
      propertyId,
      status,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      limit = 20,
      offset = 0
    } = req.query;

    // Build query
    let query = `
      SELECT o.*, 
             c.first_name as client_first_name, c.last_name as client_last_name, c.email as client_email,
             l.list_price, l.status as listing_status,
             p.address, p.city, p.state, p.zip, p.type,
             u.first_name as agent_first_name, u.last_name as agent_last_name
      FROM real_estate.offers o
      JOIN real_estate.clients c ON o.client_id = c.id
      JOIN real_estate.listings l ON o.listing_id = l.id
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
      query += ` AND o.client_id = $${paramIndex++}`;
      queryParams.push(clientId);
    }

    if (listingId) {
      query += ` AND o.listing_id = $${paramIndex++}`;
      queryParams.push(listingId);
    }

    if (propertyId) {
      query += ` AND l.property_id = $${paramIndex++}`;
      queryParams.push(propertyId);
    }

    if (status) {
      query += ` AND o.status = $${paramIndex++}`;
      queryParams.push(status);
    }

    if (minAmount) {
      query += ` AND o.offer_price >= $${paramIndex++}`;
      queryParams.push(minAmount);
    }

    if (maxAmount) {
      query += ` AND o.offer_price <= $${paramIndex++}`;
      queryParams.push(maxAmount);
    }

    if (startDate) {
      query += ` AND o.offer_date >= $${paramIndex++}`;
      queryParams.push(startDate);
    }

    if (endDate) {
      query += ` AND o.offer_date <= $${paramIndex++}`;
      queryParams.push(endDate);
    }

    // Add pagination
    query += ` ORDER BY o.offer_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(limit, offset);

    // Execute query
    const result = await db.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM real_estate.offers o
      JOIN real_estate.listings l ON o.listing_id = l.id
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
      countQuery += ` AND o.client_id = $${countParamIndex++}`;
      countQueryParams.push(clientId);
    }

    if (listingId) {
      countQuery += ` AND o.listing_id = $${countParamIndex++}`;
      countQueryParams.push(listingId);
    }

    if (propertyId) {
      countQuery += ` AND l.property_id = $${countParamIndex++}`;
      countQueryParams.push(propertyId);
    }

    if (status) {
      countQuery += ` AND o.status = $${countParamIndex++}`;
      countQueryParams.push(status);
    }

    if (minAmount) {
      countQuery += ` AND o.offer_price >= $${countParamIndex++}`;
      countQueryParams.push(minAmount);
    }

    if (maxAmount) {
      countQuery += ` AND o.offer_price <= $${countParamIndex++}`;
      countQueryParams.push(maxAmount);
    }

    if (startDate) {
      countQuery += ` AND o.offer_date >= $${countParamIndex++}`;
      countQueryParams.push(startDate);
    }

    if (endDate) {
      countQuery += ` AND o.offer_date <= $${countParamIndex++}`;
      countQueryParams.push(endDate);
    }

    const countResult = await db.query(countQuery, countQueryParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    res.status(200).json({
      offers: result.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        hasMore: totalCount > parseInt(offset, 10) + parseInt(limit, 10)
      }
    });
  } catch (error) {
    logger.error('Error getting offers', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching offers' });
  }
};

/**
 * Get an offer by ID
 * @route GET /api/real-estate/offers/:id
 */
exports.getOfferById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get offer with related details
    const result = await db.query(
      `SELECT o.*, 
              c.first_name as client_first_name, c.last_name as client_last_name, 
              c.email as client_email, c.phone as client_phone,
              l.list_price, l.status as listing_status, l.start_date as listing_start_date,
              p.address, p.city, p.state, p.zip, p.type, p.bedrooms, p.bathrooms, 
              p.square_feet, p.images,
              u.first_name as agent_first_name, u.last_name as agent_last_name,
              u.email as agent_email, u.phone as agent_phone
       FROM real_estate.offers o
       JOIN real_estate.clients c ON o.client_id = c.id
       JOIN real_estate.listings l ON o.listing_id = l.id
       JOIN real_estate.properties p ON l.property_id = p.id
       JOIN core.users u ON l.agent_id = u.id
       WHERE o.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Get transaction if exists
    const transactionResult = await db.query(
      `SELECT * FROM real_estate.transactions WHERE offer_id = $1`,
      [id]
    );

    const offer = result.rows[0];
    
    if (transactionResult.rows.length > 0) {
      offer.transaction = transactionResult.rows[0];
    }

    // Get workflow status if exists
    try {
      const workflowStatus = await workflowService.getWorkflowStatus('real_estate', 'offer', id);
      if (workflowStatus) {
        offer.workflow = workflowStatus;
      }
    } catch (workflowError) {
      logger.error('Error getting workflow status', { error: workflowError.message });
      // Continue even if workflow status fetch fails
    }

    res.status(200).json(offer);
  } catch (error) {
    logger.error('Error getting offer by ID', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching offer' });
  }
};

/**
 * Create a new offer
 * @route POST /api/real-estate/offers
 */
exports.createOffer = async (req, res) => {
  try {
    const {
      listingId,
      clientId,
      offerPrice,
      offerDate,
      expirationDate,
      status = 'Pending',
      contingencies,
      notes
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

    // Check if listing is active
    if (listing.status !== 'Active') {
      return res.status(400).json({ 
        message: 'Cannot create an offer for a non-active listing' 
      });
    }

    // Check if client exists
    const clientResult = await db.query(
      'SELECT * FROM real_estate.clients WHERE id = $1',
      [clientId]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const client = clientResult.rows[0];

    // Insert offer
    const result = await db.query(
      `INSERT INTO real_estate.offers (
        listing_id,
        client_id,
        offer_price,
        offer_date,
        expiration_date,
        status,
        contingencies,
        notes,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [
        listingId,
        clientId,
        offerPrice,
        offerDate,
        expirationDate,
        status,
        contingencies,
        notes
      ]
    );

    const newOffer = result.rows[0];

    // Start offer workflow
    try {
      await workflowService.startWorkflow({
        module: 'real_estate',
        entityType: 'offer',
        entityId: newOffer.id,
        workflowType: 'offer_processing',
        initiatorId: req.user.id,
        data: {
          listingId,
          propertyAddress: `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`,
          clientName: `${client.first_name} ${client.last_name}`,
          offerPrice,
          listPrice: listing.list_price,
          offerDate,
          expirationDate
        }
      });
    } catch (workflowError) {
      logger.error('Error starting offer workflow', { error: workflowError.message });
      // Continue even if workflow fails to start
    }

    // Send notifications
    try {
      // Notify the agent
      await notificationService.createNotification({
        userId: listing.agent_id,
        type: 'info',
        title: 'New Offer Received',
        message: `A new offer of ${formatCurrency(offerPrice)} has been received for ${listing.address}`,
        module: 'real_estate',
        entityType: 'offer',
        entityId: newOffer.id,
        actionUrl: `/real-estate/offers/${newOffer.id}`,
        isEmail: true
      });

      // Notify real estate managers
      await notificationService.notifyRole('real_estate_manager', {
        type: 'info',
        title: 'New Offer Received',
        message: `A new offer of ${formatCurrency(offerPrice)} has been received for ${listing.address}`,
        module: 'real_estate',
        entityType: 'offer',
        entityId: newOffer.id,
        actionUrl: `/real-estate/offers/${newOffer.id}`,
        isEmail: true
      });

      // Send email to client
      await emailService.sendEmail({
        to: client.email,
        subject: 'Offer Submission Confirmation',
        template: 'offer-confirmation',
        data: {
          clientName: `${client.first_name} ${client.last_name}`,
          propertyAddress: `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`,
          offerAmount: formatCurrency(offerPrice),
          offerDate: formatDate(offerDate),
          expirationDate: formatDate(expirationDate),
          agentName: `${listing.agent_first_name} ${listing.agent_last_name}`,
          agentEmail: listing.agent_email,
          offerId: newOffer.id
        }
      });
    } catch (notificationError) {
      logger.error('Error sending offer notifications', { error: notificationError.message });
      // Continue even if notification fails
    }

    res.status(201).json(newOffer);
  } catch (error) {
    logger.error('Error creating offer', { error: error.message });
    res.status(500).json({ message: 'Server error while creating offer' });
  }
};

/**
 * Update an offer
 * @route PUT /api/real-estate/offers/:id
 */
exports.updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      listingId,
      clientId,
      offerPrice,
      offerDate,
      expirationDate,
      status,
      contingencies,
      notes
    } = req.body;

    // Check if offer exists
    const offerResult = await db.query(
      'SELECT * FROM real_estate.offers WHERE id = $1',
      [id]
    );

    if (offerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const currentOffer = offerResult.rows[0];

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

    // Update offer
    const result = await db.query(
      `UPDATE real_estate.offers
       SET listing_id = $1,
           client_id = $2,
           offer_price = $3,
           offer_date = $4,
           expiration_date = $5,
           status = $6,
           contingencies = $7,
           notes = $8,
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        listingId,
        clientId,
        offerPrice,
        offerDate,
        expirationDate,
        status,
        contingencies,
        notes,
        id
      ]
    );

    const updatedOffer = result.rows[0];

    // If status changed to Accepted, update listing status
    if (status === 'Accepted' && currentOffer.status !== 'Accepted') {
      await db.query(
        "UPDATE real_estate.listings SET status = 'Pending' WHERE id = $1",
        [listingId]
      );

      // Update workflow status
      try {
        await workflowService.updateWorkflowStatus({
          module: 'real_estate',
          entityType: 'offer',
          entityId: id,
          status: 'accepted',
          data: {
            acceptedBy: req.user.id,
            acceptedAt: new Date().toISOString()
          }
        });
      } catch (workflowError) {
        logger.error('Error updating offer workflow', { error: workflowError.message });
        // Continue even if workflow update fails
      }
    }
    // If status changed to Rejected, update workflow
    else if (status === 'Rejected' && currentOffer.status !== 'Rejected') {
      try {
        await workflowService.updateWorkflowStatus({
          module: 'real_estate',
          entityType: 'offer',
          entityId: id,
          status: 'rejected',
          data: {
            rejectedBy: req.user.id,
            rejectedAt: new Date().toISOString(),
            rejectionReason: notes
          }
        });
      } catch (workflowError) {
        logger.error('Error updating offer workflow', { error: workflowError.message });
        // Continue even if workflow update fails
      }
    }
    // If status changed to Countered, update workflow
    else if (status === 'Countered' && currentOffer.status !== 'Countered') {
      try {
        await workflowService.updateWorkflowStatus({
          module: 'real_estate',
          entityType: 'offer',
          entityId: id,
          status: 'countered',
          data: {
            counteredBy: req.user.id,
            counteredAt: new Date().toISOString(),
            counterOfferPrice: offerPrice
          }
        });
      } catch (workflowError) {
        logger.error('Error updating offer workflow', { error: workflowError.message });
        // Continue even if workflow update fails
      }
    }

    // Send notifications if status changed
    if (currentOffer.status !== status) {
      try {
        // Notify the agent
        await notificationService.createNotification({
          userId: listing.agent_id,
          type: 'info',
          title: 'Offer Status Updated',
          message: `The offer for ${listing.address} has been updated to ${status}`,
          module: 'real_estate',
          entityType: 'offer',
          entityId: id,
          actionUrl: `/real-estate/offers/${id}`,
          isEmail: true
        });

        // Send email to client
        let emailTemplate;
        let emailSubject;
        
        if (status === 'Accepted') {
          emailTemplate = 'offer-accepted';
          emailSubject = 'Your Offer Has Been Accepted';
        } else if (status === 'Rejected') {
          emailTemplate = 'offer-rejected';
          emailSubject = 'Your Offer Status Update';
        } else if (status === 'Countered') {
          emailTemplate = 'offer-countered';
          emailSubject = 'Counter Offer Received';
        } else if (status === 'Withdrawn') {
          emailTemplate = 'offer-withdrawn';
          emailSubject = 'Offer Withdrawn Confirmation';
        }

        if (emailTemplate) {
          await emailService.sendEmail({
            to: client.email,
            subject: emailSubject,
            template: emailTemplate,
            data: {
              clientName: `${client.first_name} ${client.last_name}`,
              propertyAddress: `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`,
              offerAmount: formatCurrency(offerPrice),
              offerDate: formatDate(offerDate),
              expirationDate: formatDate(expirationDate),
              agentName: `${listing.agent_first_name} ${listing.agent_last_name}`,
              agentEmail: listing.agent_email,
              offerId: id,
              notes: notes || ''
            }
          });
        }
      } catch (notificationError) {
        logger.error('Error sending offer update notifications', { error: notificationError.message });
        // Continue even if notification fails
      }
    }

    res.status(200).json(updatedOffer);
  } catch (error) {
    logger.error('Error updating offer', { error: error.message });
    res.status(500).json({ message: 'Server error while updating offer' });
  }
};

/**
 * Delete an offer
 * @route DELETE /api/real-estate/offers/:id
 */
exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if offer exists
    const offerResult = await db.query(
      `SELECT o.*, 
              c.first_name as client_first_name, c.last_name as client_last_name, c.email as client_email,
              l.agent_id, p.address, p.city, p.state, p.zip,
              u.first_name as agent_first_name, u.last_name as agent_last_name, u.email as agent_email
       FROM real_estate.offers o
       JOIN real_estate.clients c ON o.client_id = c.id
       JOIN real_estate.listings l ON o.listing_id = l.id
       JOIN real_estate.properties p ON l.property_id = p.id
       JOIN core.users u ON l.agent_id = u.id
       WHERE o.id = $1`,
      [id]
    );

    if (offerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const offer = offerResult.rows[0];

    // Check if offer has a transaction
    const transactionResult = await db.query(
      'SELECT id FROM real_estate.transactions WHERE offer_id = $1',
      [id]
    );

    if (transactionResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete an offer with an associated transaction' 
      });
    }

    // Delete offer
    await db.query(
      'DELETE FROM real_estate.offers WHERE id = $1',
      [id]
    );

    // Cancel workflow if exists
    try {
      await workflowService.cancelWorkflow({
        module: 'real_estate',
        entityType: 'offer',
        entityId: id,
        reason: 'Offer deleted',
        userId: req.user.id
      });
    } catch (workflowError) {
      logger.error('Error cancelling offer workflow', { error: workflowError.message });
      // Continue even if workflow cancellation fails
    }

    // Send notifications
    try {
      // Notify the agent
      await notificationService.createNotification({
        userId: offer.agent_id,
        type: 'info',
        title: 'Offer Deleted',
        message: `The offer for ${offer.address} has been deleted`,
        module: 'real_estate',
        entityType: 'offer',
        isEmail: true
      });

      // Notify the client
      await emailService.sendEmail({
        to: offer.client_email,
        subject: 'Offer Deleted',
        template: 'offer-deleted',
        data: {
          clientName: `${offer.client_first_name} ${offer.client_last_name}`,
          propertyAddress: `${offer.address}, ${offer.city}, ${offer.state} ${offer.zip}`,
          offerAmount: formatCurrency(offer.offer_price),
          offerDate: formatDate(offer.offer_date),
          agentName: `${offer.agent_first_name} ${offer.agent_last_name}`,
          agentEmail: offer.agent_email
        }
      });
    } catch (notificationError) {
      logger.error('Error sending offer deletion notifications', { error: notificationError.message });
      // Continue even if notification fails
    }

    res.status(200).json({ message: 'Offer deleted successfully' });
  } catch (error) {
    logger.error('Error deleting offer', { error: error.message });
    res.status(500).json({ message: 'Server error while deleting offer' });
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
