/**
 * Client Controller
 * 
 * Handles operations related to real estate clients.
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Get all clients
 * @route GET /api/real-estate/clients
 */
exports.getAllClients = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { 
      search,
      agentId,
      limit = 20,
      offset = 0
    } = req.query;

    // Build query
    let query = `
      SELECT c.*, 
             COUNT(DISTINCT s.id) as showing_count,
             COUNT(DISTINCT o.id) as offer_count
      FROM real_estate.clients c
      LEFT JOIN real_estate.showings s ON c.id = s.client_id
      LEFT JOIN real_estate.offers o ON c.id = o.client_id
    `;
    
    // Add WHERE clause
    let whereClause = [];
    const queryParams = [];
    let paramIndex = 1;

    // Add filters if provided
    if (search) {
      whereClause.push(`(
        c.first_name ILIKE $${paramIndex} OR 
        c.last_name ILIKE $${paramIndex} OR 
        c.email ILIKE $${paramIndex} OR 
        c.phone ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (agentId) {
      whereClause.push(`c.agent_id = $${paramIndex}`);
      queryParams.push(agentId);
      paramIndex++;
    }

    if (whereClause.length > 0) {
      query += ` WHERE ${whereClause.join(' AND ')}`;
    }

    // Add group by, order by, and pagination
    query += `
      GROUP BY c.id
      ORDER BY c.last_name, c.first_name
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(limit, offset);

    // Execute query
    const result = await db.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) FROM real_estate.clients c
    `;
    
    // Add the same filters to count query
    let countWhereClause = [];
    let countQueryParams = [];
    let countParamIndex = 1;
    
    if (search) {
      countWhereClause.push(`(
        c.first_name ILIKE $${countParamIndex} OR 
        c.last_name ILIKE $${countParamIndex} OR 
        c.email ILIKE $${countParamIndex} OR 
        c.phone ILIKE $${countParamIndex}
      )`);
      countQueryParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (agentId) {
      countWhereClause.push(`c.agent_id = $${countParamIndex}`);
      countQueryParams.push(agentId);
      countParamIndex++;
    }

    if (countWhereClause.length > 0) {
      countQuery += ` WHERE ${countWhereClause.join(' AND ')}`;
    }

    const countResult = await db.query(countQuery, countQueryParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    res.status(200).json({
      clients: result.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        hasMore: totalCount > parseInt(offset, 10) + parseInt(limit, 10)
      }
    });
  } catch (error) {
    logger.error('Error getting clients', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching clients' });
  }
};

/**
 * Get a client by ID
 * @route GET /api/real-estate/clients/:id
 */
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get client
    const clientResult = await db.query(
      `SELECT c.*, 
              u.first_name as agent_first_name, 
              u.last_name as agent_last_name,
              u.email as agent_email
       FROM real_estate.clients c
       LEFT JOIN core.users u ON c.agent_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const client = clientResult.rows[0];

    // Get showings for this client
    const showingsResult = await db.query(
      `SELECT s.*, 
              l.list_price, l.status as listing_status,
              p.address, p.city, p.state, p.zip, p.type, p.bedrooms, p.bathrooms, p.square_feet
       FROM real_estate.showings s
       JOIN real_estate.listings l ON s.listing_id = l.id
       JOIN real_estate.properties p ON l.property_id = p.id
       WHERE s.client_id = $1
       ORDER BY s.start_time DESC`,
      [id]
    );

    // Get offers for this client
    const offersResult = await db.query(
      `SELECT o.*, 
              l.list_price, l.status as listing_status,
              p.address, p.city, p.state, p.zip, p.type
       FROM real_estate.offers o
       JOIN real_estate.listings l ON o.listing_id = l.id
       JOIN real_estate.properties p ON l.property_id = p.id
       WHERE o.client_id = $1
       ORDER BY o.offer_date DESC`,
      [id]
    );

    // Get transactions for this client
    const transactionsResult = await db.query(
      `SELECT t.*, 
              o.offer_price, o.offer_date,
              p.address, p.city, p.state, p.zip, p.type
       FROM real_estate.transactions t
       JOIN real_estate.offers o ON t.offer_id = o.id
       JOIN real_estate.listings l ON o.listing_id = l.id
       JOIN real_estate.properties p ON l.property_id = p.id
       WHERE o.client_id = $1
       ORDER BY t.closing_date DESC`,
      [id]
    );

    client.showings = showingsResult.rows;
    client.offers = offersResult.rows;
    client.transactions = transactionsResult.rows;

    res.status(200).json(client);
  } catch (error) {
    logger.error('Error getting client by ID', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching client' });
  }
};

/**
 * Create a new client
 * @route POST /api/real-estate/clients
 */
exports.createClient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zip,
      country,
      agentId,
      notes
    } = req.body;

    // Check if email already exists
    if (email) {
      const emailCheckResult = await db.query(
        'SELECT id FROM real_estate.clients WHERE email = $1',
        [email]
      );

      if (emailCheckResult.rows.length > 0) {
        return res.status(400).json({ 
          message: 'A client with this email already exists' 
        });
      }
    }

    // Check if agent exists if provided
    if (agentId) {
      const agentResult = await db.query(
        'SELECT id FROM core.users WHERE id = $1',
        [agentId]
      );

      if (agentResult.rows.length === 0) {
        return res.status(404).json({ message: 'Agent not found' });
      }
    }

    // Insert client
    const result = await db.query(
      `INSERT INTO real_estate.clients (
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        state,
        zip,
        country,
        agent_id,
        notes,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *`,
      [
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zip,
        country,
        agentId,
        notes
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error creating client', { error: error.message });
    res.status(500).json({ message: 'Server error while creating client' });
  }
};

/**
 * Update a client
 * @route PUT /api/real-estate/clients/:id
 */
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zip,
      country,
      agentId,
      notes
    } = req.body;

    // Check if client exists
    const clientResult = await db.query(
      'SELECT * FROM real_estate.clients WHERE id = $1',
      [id]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if email already exists for another client
    if (email) {
      const emailCheckResult = await db.query(
        'SELECT id FROM real_estate.clients WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (emailCheckResult.rows.length > 0) {
        return res.status(400).json({ 
          message: 'Another client with this email already exists' 
        });
      }
    }

    // Check if agent exists if provided
    if (agentId) {
      const agentResult = await db.query(
        'SELECT id FROM core.users WHERE id = $1',
        [agentId]
      );

      if (agentResult.rows.length === 0) {
        return res.status(404).json({ message: 'Agent not found' });
      }
    }

    // Update client
    const result = await db.query(
      `UPDATE real_estate.clients
       SET first_name = $1,
           last_name = $2,
           email = $3,
           phone = $4,
           address = $5,
           city = $6,
           state = $7,
           zip = $8,
           country = $9,
           agent_id = $10,
           notes = $11,
           updated_at = NOW()
       WHERE id = $12
       RETURNING *`,
      [
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zip,
        country,
        agentId,
        notes,
        id
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating client', { error: error.message });
    res.status(500).json({ message: 'Server error while updating client' });
  }
};

/**
 * Delete a client
 * @route DELETE /api/real-estate/clients/:id
 */
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if client exists
    const clientResult = await db.query(
      'SELECT id FROM real_estate.clients WHERE id = $1',
      [id]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if client has showings
    const showingsResult = await db.query(
      'SELECT id FROM real_estate.showings WHERE client_id = $1',
      [id]
    );

    if (showingsResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete client with associated showings' 
      });
    }

    // Check if client has offers
    const offersResult = await db.query(
      'SELECT id FROM real_estate.offers WHERE client_id = $1',
      [id]
    );

    if (offersResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete client with associated offers' 
      });
    }

    // Delete client
    await db.query(
      'DELETE FROM real_estate.clients WHERE id = $1',
      [id]
    );

    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    logger.error('Error deleting client', { error: error.message });
    res.status(500).json({ message: 'Server error while deleting client' });
  }
};
