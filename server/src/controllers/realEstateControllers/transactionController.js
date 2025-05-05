/**
 * Transaction Controller
 * 
 * Handles operations related to real estate transactions.
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');
const notificationService = require('../../services/notificationService');
const emailService = require('../../services/emailService');
const workflowService = require('../../services/workflow');

/**
 * Get all transactions
 * @route GET /api/real-estate/transactions
 */
exports.getAllTransactions = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { 
      agentId, 
      clientId, 
      propertyId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      limit = 20,
      offset = 0
    } = req.query;

    // Build query
    let query = `
      SELECT t.*, 
             o.offer_price, o.offer_date, o.client_id,
             c.first_name as client_first_name, c.last_name as client_last_name,
             l.list_price, l.property_id,
             p.address, p.city, p.state, p.zip, p.type,
             u.first_name as agent_first_name, u.last_name as agent_last_name
      FROM real_estate.transactions t
      JOIN real_estate.offers o ON t.offer_id = o.id
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

    if (propertyId) {
      query += ` AND l.property_id = $${paramIndex++}`;
      queryParams.push(propertyId);
    }

    if (startDate) {
      query += ` AND t.closing_date >= $${paramIndex++}`;
      queryParams.push(startDate);
    }

    if (endDate) {
      query += ` AND t.closing_date <= $${paramIndex++}`;
      queryParams.push(endDate);
    }

    if (minAmount) {
      query += ` AND o.offer_price >= $${paramIndex++}`;
      queryParams.push(minAmount);
    }

    if (maxAmount) {
      query += ` AND o.offer_price <= $${paramIndex++}`;
      queryParams.push(maxAmount);
    }

    // Add pagination
    query += ` ORDER BY t.closing_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(limit, offset);

    // Execute query
    const result = await db.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM real_estate.transactions t
      JOIN real_estate.offers o ON t.offer_id = o.id
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

    if (propertyId) {
      countQuery += ` AND l.property_id = $${countParamIndex++}`;
      countQueryParams.push(propertyId);
    }

    if (startDate) {
      countQuery += ` AND t.closing_date >= $${countParamIndex++}`;
      countQueryParams.push(startDate);
    }

    if (endDate) {
      countQuery += ` AND t.closing_date <= $${countParamIndex++}`;
      countQueryParams.push(endDate);
    }

    if (minAmount) {
      countQuery += ` AND o.offer_price >= $${countParamIndex++}`;
      countQueryParams.push(minAmount);
    }

    if (maxAmount) {
      countQuery += ` AND o.offer_price <= $${countParamIndex++}`;
      countQueryParams.push(maxAmount);
    }

    const countResult = await db.query(countQuery, countQueryParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    res.status(200).json({
      transactions: result.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        hasMore: totalCount > parseInt(offset, 10) + parseInt(limit, 10)
      }
    });
  } catch (error) {
    logger.error('Error getting transactions', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching transactions' });
  }
};

/**
 * Get a transaction by ID
 * @route GET /api/real-estate/transactions/:id
 */
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get transaction with related details
    const result = await db.query(
      `SELECT t.*, 
              o.offer_price, o.offer_date, o.status as offer_status, o.contingencies,
              c.first_name as client_first_name, c.last_name as client_last_name, 
              c.email as client_email, c.phone as client_phone,
              l.list_price, l.status as listing_status, l.start_date as listing_start_date,
              p.address, p.city, p.state, p.zip, p.type, p.bedrooms, p.bathrooms, 
              p.square_feet, p.images,
              u.id as agent_id, u.first_name as agent_first_name, u.last_name as agent_last_name,
              u.email as agent_email, u.phone as agent_phone
       FROM real_estate.transactions t
       JOIN real_estate.offers o ON t.offer_id = o.id
       JOIN real_estate.clients c ON o.client_id = c.id
       JOIN real_estate.listings l ON o.listing_id = l.id
       JOIN real_estate.properties p ON l.property_id = p.id
       JOIN core.users u ON l.agent_id = u.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Get workflow status if exists
    const transaction = result.rows[0];
    
    try {
      const workflowStatus = await workflowService.getWorkflowStatus('real_estate', 'transaction', id);
      if (workflowStatus) {
        transaction.workflow = workflowStatus;
      }
    } catch (workflowError) {
      logger.error('Error getting workflow status', { error: workflowError.message });
      // Continue even if workflow status fetch fails
    }

    res.status(200).json(transaction);
  } catch (error) {
    logger.error('Error getting transaction by ID', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching transaction' });
  }
};

/**
 * Create a new transaction
 * @route POST /api/real-estate/transactions
 */
exports.createTransaction = async (req, res) => {
  try {
    const {
      offerId,
      closingDate,
      commissionAmount,
      closingCosts,
      notes
    } = req.body;

    // Check if offer exists and is accepted
    const offerResult = await db.query(
      `SELECT o.*, 
              c.first_name as client_first_name, c.last_name as client_last_name, c.email as client_email,
              l.list_price, l.property_id, l.agent_id,
              p.address, p.city, p.state, p.zip,
              u.first_name as agent_first_name, u.last_name as agent_last_name, u.email as agent_email
       FROM real_estate.offers o
       JOIN real_estate.clients c ON o.client_id = c.id
       JOIN real_estate.listings l ON o.listing_id = l.id
       JOIN real_estate.properties p ON l.property_id = p.id
       JOIN core.users u ON l.agent_id = u.id
       WHERE o.id = $1`,
      [offerId]
    );

    if (offerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const offer = offerResult.rows[0];

    if (offer.status !== 'Accepted') {
      return res.status(400).json({ 
        message: 'Cannot create a transaction for a non-accepted offer' 
      });
    }

    // Check if transaction already exists for this offer
    const existingTransactionResult = await db.query(
      'SELECT id FROM real_estate.transactions WHERE offer_id = $1',
      [offerId]
    );

    if (existingTransactionResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'A transaction already exists for this offer' 
      });
    }

    // Insert transaction
    const result = await db.query(
      `INSERT INTO real_estate.transactions (
        offer_id,
        closing_date,
        commission_amount,
        closing_costs,
        notes,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *`,
      [
        offerId,
        closingDate,
        commissionAmount,
        closingCosts,
        notes
      ]
    );

    const newTransaction = result.rows[0];

    // Update listing and property status
    await db.query(
      "UPDATE real_estate.listings SET status = 'Sold' WHERE id = $1",
      [offer.listing_id]
    );

    await db.query(
      "UPDATE real_estate.properties SET status = 'Sold', sale_price = $1 WHERE id = $2",
      [offer.offer_price, offer.property_id]
    );

    // Start transaction workflow
    try {
      await workflowService.startWorkflow({
        module: 'real_estate',
        entityType: 'transaction',
        entityId: newTransaction.id,
        workflowType: 'closing_process',
        initiatorId: req.user.id,
        data: {
          offerId,
          propertyAddress: `${offer.address}, ${offer.city}, ${offer.state} ${offer.zip}`,
          clientName: `${offer.client_first_name} ${offer.client_last_name}`,
          agentName: `${offer.agent_first_name} ${offer.agent_last_name}`,
          salePrice: offer.offer_price,
          closingDate,
          commissionAmount
        }
      });
    } catch (workflowError) {
      logger.error('Error starting transaction workflow', { error: workflowError.message });
      // Continue even if workflow fails to start
    }

    // Send notifications
    try {
      // Notify the agent
      await notificationService.createNotification({
        userId: offer.agent_id,
        type: 'info',
        title: 'New Transaction Created',
        message: `A new transaction has been created for the sale of ${offer.address}`,
        module: 'real_estate',
        entityType: 'transaction',
        entityId: newTransaction.id,
        actionUrl: `/real-estate/transactions/${newTransaction.id}`,
        isEmail: true
      });

      // Notify real estate managers
      await notificationService.notifyRole('real_estate_manager', {
        type: 'info',
        title: 'New Transaction Created',
        message: `A new transaction has been created for the sale of ${offer.address} for ${formatCurrency(offer.offer_price)}`,
        module: 'real_estate',
        entityType: 'transaction',
        entityId: newTransaction.id,
        actionUrl: `/real-estate/transactions/${newTransaction.id}`,
        isEmail: true
      });

      // Send email to client
      await emailService.sendEmail({
        to: offer.client_email,
        subject: 'Property Sale Transaction Initiated',
        template: 'transaction-created',
        data: {
          clientName: `${offer.client_first_name} ${offer.client_last_name}`,
          propertyAddress: `${offer.address}, ${offer.city}, ${offer.state} ${offer.zip}`,
          salePrice: formatCurrency(offer.offer_price),
          closingDate: formatDate(closingDate),
          agentName: `${offer.agent_first_name} ${offer.agent_last_name}`,
          agentEmail: offer.agent_email,
          transactionId: newTransaction.id
        }
      });
    } catch (notificationError) {
      logger.error('Error sending transaction notifications', { error: notificationError.message });
      // Continue even if notification fails
    }

    res.status(201).json(newTransaction);
  } catch (error) {
    logger.error('Error creating transaction', { error: error.message });
    res.status(500).json({ message: 'Server error while creating transaction' });
  }
};

/**
 * Update a transaction
 * @route PUT /api/real-estate/transactions/:id
 */
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      offerId,
      closingDate,
      commissionAmount,
      closingCosts,
      notes
    } = req.body;

    // Check if transaction exists
    const transactionResult = await db.query(
      'SELECT * FROM real_estate.transactions WHERE id = $1',
      [id]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const currentTransaction = transactionResult.rows[0];

    // Check if offer exists and is accepted
    const offerResult = await db.query(
      `SELECT o.*, 
              c.first_name as client_first_name, c.last_name as client_last_name, c.email as client_email,
              l.list_price, l.property_id, l.agent_id,
              p.address, p.city, p.state, p.zip,
              u.first_name as agent_first_name, u.last_name as agent_last_name, u.email as agent_email
       FROM real_estate.offers o
       JOIN real_estate.clients c ON o.client_id = c.id
       JOIN real_estate.listings l ON o.listing_id = l.id
       JOIN real_estate.properties p ON l.property_id = p.id
       JOIN core.users u ON l.agent_id = u.id
       WHERE o.id = $1`,
      [offerId]
    );

    if (offerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const offer = offerResult.rows[0];

    if (offer.status !== 'Accepted') {
      return res.status(400).json({ 
        message: 'Cannot update a transaction with a non-accepted offer' 
      });
    }

    // If changing the offer, check if new offer already has a transaction
    if (offerId !== currentTransaction.offer_id) {
      const existingTransactionResult = await db.query(
        'SELECT id FROM real_estate.transactions WHERE offer_id = $1 AND id != $2',
        [offerId, id]
      );

      if (existingTransactionResult.rows.length > 0) {
        return res.status(400).json({ 
          message: 'A transaction already exists for this offer' 
        });
      }
    }

    // Update transaction
    const result = await db.query(
      `UPDATE real_estate.transactions
       SET offer_id = $1,
           closing_date = $2,
           commission_amount = $3,
           closing_costs = $4,
           notes = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        offerId,
        closingDate,
        commissionAmount,
        closingCosts,
        notes,
        id
      ]
    );

    const updatedTransaction = result.rows[0];

    // Update workflow if closing date changed
    if (closingDate !== currentTransaction.closing_date) {
      try {
        await workflowService.updateWorkflowStatus({
          module: 'real_estate',
          entityType: 'transaction',
          entityId: id,
          status: 'closing_date_updated',
          data: {
            updatedBy: req.user.id,
            updatedAt: new Date().toISOString(),
            previousClosingDate: currentTransaction.closing_date,
            newClosingDate: closingDate
          }
        });
      } catch (workflowError) {
        logger.error('Error updating transaction workflow', { error: workflowError.message });
        // Continue even if workflow update fails
      }
    }

    // Send notifications if closing date changed
    if (closingDate !== currentTransaction.closing_date) {
      try {
        // Notify the agent
        await notificationService.createNotification({
          userId: offer.agent_id,
          type: 'info',
          title: 'Transaction Closing Date Updated',
          message: `The closing date for ${offer.address} has been updated to ${formatDate(closingDate)}`,
          module: 'real_estate',
          entityType: 'transaction',
          entityId: id,
          actionUrl: `/real-estate/transactions/${id}`,
          isEmail: true
        });

        // Send email to client
        await emailService.sendEmail({
          to: offer.client_email,
          subject: 'Closing Date Update',
          template: 'closing-date-updated',
          data: {
            clientName: `${offer.client_first_name} ${offer.client_last_name}`,
            propertyAddress: `${offer.address}, ${offer.city}, ${offer.state} ${offer.zip}`,
            previousClosingDate: formatDate(currentTransaction.closing_date),
            newClosingDate: formatDate(closingDate),
            agentName: `${offer.agent_first_name} ${offer.agent_last_name}`,
            agentEmail: offer.agent_email,
            transactionId: id
          }
        });
      } catch (notificationError) {
        logger.error('Error sending transaction update notifications', { error: notificationError.message });
        // Continue even if notification fails
      }
    }

    res.status(200).json(updatedTransaction);
  } catch (error) {
    logger.error('Error updating transaction', { error: error.message });
    res.status(500).json({ message: 'Server error while updating transaction' });
  }
};

/**
 * Delete a transaction
 * @route DELETE /api/real-estate/transactions/:id
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if transaction exists
    const transactionResult = await db.query(
      `SELECT t.*, 
              o.listing_id, o.client_id, o.offer_price,
              c.first_name as client_first_name, c.last_name as client_last_name, c.email as client_email,
              l.agent_id, l.property_id,
              p.address, p.city, p.state, p.zip,
              u.first_name as agent_first_name, u.last_name as agent_last_name, u.email as agent_email
       FROM real_estate.transactions t
       JOIN real_estate.offers o ON t.offer_id = o.id
       JOIN real_estate.clients c ON o.client_id = c.id
       JOIN real_estate.listings l ON o.listing_id = l.id
       JOIN real_estate.properties p ON l.property_id = p.id
       JOIN core.users u ON l.agent_id = u.id
       WHERE t.id = $1`,
      [id]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const transaction = transactionResult.rows[0];

    // Delete transaction
    await db.query(
      'DELETE FROM real_estate.transactions WHERE id = $1',
      [id]
    );

    // Update listing and property status back to active/available
    await db.query(
      "UPDATE real_estate.listings SET status = 'Active' WHERE id = $1",
      [transaction.listing_id]
    );

    await db.query(
      "UPDATE real_estate.properties SET status = 'Available', sale_price = NULL WHERE id = $1",
      [transaction.property_id]
    );

    // Cancel workflow if exists
    try {
      await workflowService.cancelWorkflow({
        module: 'real_estate',
        entityType: 'transaction',
        entityId: id,
        reason: 'Transaction deleted',
        userId: req.user.id
      });
    } catch (workflowError) {
      logger.error('Error cancelling transaction workflow', { error: workflowError.message });
      // Continue even if workflow cancellation fails
    }

    // Send notifications
    try {
      // Notify the agent
      await notificationService.createNotification({
        userId: transaction.agent_id,
        type: 'warning',
        title: 'Transaction Deleted',
        message: `The transaction for ${transaction.address} has been deleted`,
        module: 'real_estate',
        entityType: 'transaction',
        isEmail: true
      });

      // Notify real estate managers
      await notificationService.notifyRole('real_estate_manager', {
        type: 'warning',
        title: 'Transaction Deleted',
        message: `The transaction for ${transaction.address} has been deleted`,
        module: 'real_estate',
        entityType: 'transaction',
        isEmail: true
      });

      // Send email to client
      await emailService.sendEmail({
        to: transaction.client_email,
        subject: 'Property Transaction Cancelled',
        template: 'transaction-cancelled',
        data: {
          clientName: `${transaction.client_first_name} ${transaction.client_last_name}`,
          propertyAddress: `${transaction.address}, ${transaction.city}, ${transaction.state} ${transaction.zip}`,
          salePrice: formatCurrency(transaction.offer_price),
          closingDate: formatDate(transaction.closing_date),
          agentName: `${transaction.agent_first_name} ${transaction.agent_last_name}`,
          agentEmail: transaction.agent_email
        }
      });
    } catch (notificationError) {
      logger.error('Error sending transaction deletion notifications', { error: notificationError.message });
      // Continue even if notification fails
    }

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    logger.error('Error deleting transaction', { error: error.message });
    res.status(500).json({ message: 'Server error while deleting transaction' });
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
