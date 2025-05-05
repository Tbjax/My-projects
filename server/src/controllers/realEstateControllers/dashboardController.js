/**
 * Dashboard Controller
 * 
 * Handles operations related to the real estate dashboard.
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Get dashboard statistics
 * @route GET /api/real-estate/dashboard/stats
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get user ID from request
    const userId = req.user.id;
    
    // Check if user has real estate role
    const userRoleResult = await db.query(
      `SELECT role FROM core.user_roles 
       WHERE user_id = $1 AND role IN ('real_estate_agent', 'real_estate_manager', 'admin')`,
      [userId]
    );
    
    if (userRoleResult.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    
    const userRole = userRoleResult.rows[0].role;
    let agentFilter = '';
    let agentParams = [];
    
    // If user is an agent, only show their properties
    if (userRole === 'real_estate_agent') {
      agentFilter = 'WHERE l.agent_id = $1';
      agentParams = [userId];
    }
    
    // Get property count
    const propertiesResult = await db.query(
      `SELECT COUNT(*) FROM real_estate.properties`,
      []
    );
    
    // Get active listings count
    const listingsQuery = `
      SELECT COUNT(*) FROM real_estate.listings l
      ${agentFilter}
      AND l.status = 'Active'
    `;
    
    const listingsResult = await db.query(
      agentParams.length > 0 ? listingsQuery : listingsQuery.replace('AND', 'WHERE'),
      agentParams
    );
    
    // Get upcoming showings count
    const showingsQuery = `
      SELECT COUNT(*) FROM real_estate.showings s
      JOIN real_estate.listings l ON s.listing_id = l.id
      ${agentFilter}
      AND s.start_time > NOW()
      AND s.status = 'Scheduled'
    `;
    
    const showingsResult = await db.query(
      agentParams.length > 0 ? showingsQuery : showingsQuery.replace('AND', 'WHERE'),
      agentParams
    );
    
    // Get pending offers count
    const offersQuery = `
      SELECT COUNT(*) FROM real_estate.offers o
      JOIN real_estate.listings l ON o.listing_id = l.id
      ${agentFilter}
      AND o.status = 'Pending'
    `;
    
    const offersResult = await db.query(
      agentParams.length > 0 ? offersQuery : offersQuery.replace('AND', 'WHERE'),
      agentParams
    );
    
    // Get closed deals count
    const dealsQuery = `
      SELECT COUNT(*) FROM real_estate.transactions t
      JOIN real_estate.offers o ON t.offer_id = o.id
      JOIN real_estate.listings l ON o.listing_id = l.id
      ${agentFilter}
      AND l.status = 'Sold'
    `;
    
    const dealsResult = await db.query(
      agentParams.length > 0 ? dealsQuery : dealsQuery.replace('AND', 'WHERE'),
      agentParams
    );
    
    // Get total revenue
    const revenueQuery = `
      SELECT COALESCE(SUM(t.commission_amount), 0) as total_revenue
      FROM real_estate.transactions t
      JOIN real_estate.offers o ON t.offer_id = o.id
      JOIN real_estate.listings l ON o.listing_id = l.id
      ${agentFilter}
    `;
    
    const revenueResult = await db.query(
      agentParams.length > 0 ? revenueQuery : revenueQuery.replace('WHERE', ''),
      agentParams
    );
    
    res.status(200).json({
      properties: parseInt(propertiesResult.rows[0].count, 10),
      listings: parseInt(listingsResult.rows[0].count, 10),
      showings: parseInt(showingsResult.rows[0].count, 10),
      pendingOffers: parseInt(offersResult.rows[0].count, 10),
      closedDeals: parseInt(dealsResult.rows[0].count, 10),
      revenue: parseFloat(revenueResult.rows[0].total_revenue)
    });
  } catch (error) {
    logger.error('Error getting dashboard stats', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching dashboard stats' });
  }
};

/**
 * Get recent listings
 * @route GET /api/real-estate/dashboard/recent-listings
 */
exports.getRecentListings = async (req, res) => {
  try {
    // Get user ID from request
    const userId = req.user.id;
    
    // Check if user has real estate role
    const userRoleResult = await db.query(
      `SELECT role FROM core.user_roles 
       WHERE user_id = $1 AND role IN ('real_estate_agent', 'real_estate_manager', 'admin')`,
      [userId]
    );
    
    if (userRoleResult.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    
    const userRole = userRoleResult.rows[0].role;
    let agentFilter = '';
    let agentParams = [];
    
    // If user is an agent, only show their listings
    if (userRole === 'real_estate_agent') {
      agentFilter = 'AND l.agent_id = $1';
      agentParams = [userId];
    }
    
    // Get recent listings
    const query = `
      SELECT l.*, 
             p.address, p.city, p.state, p.zip, p.type, p.bedrooms, p.bathrooms, p.square_feet, p.images,
             u.first_name as agent_first_name, u.last_name as agent_last_name
      FROM real_estate.listings l
      JOIN real_estate.properties p ON l.property_id = p.id
      JOIN core.users u ON l.agent_id = u.id
      WHERE 1=1
      ${agentFilter}
      ORDER BY l.created_at DESC
      LIMIT 6
    `;
    
    const result = await db.query(query, agentParams);
    
    // Format the response
    const listings = result.rows.map(listing => {
      return {
        id: listing.id,
        listPrice: listing.list_price,
        status: listing.status,
        createdAt: listing.created_at,
        property: {
          id: listing.property_id,
          address: listing.address,
          city: listing.city,
          state: listing.state,
          zip: listing.zip,
          type: listing.type,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          squareFeet: listing.square_feet,
          images: listing.images
        },
        agent: {
          id: listing.agent_id,
          firstName: listing.agent_first_name,
          lastName: listing.agent_last_name
        }
      };
    });
    
    res.status(200).json(listings);
  } catch (error) {
    logger.error('Error getting recent listings', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching recent listings' });
  }
};

/**
 * Get upcoming showings
 * @route GET /api/real-estate/dashboard/upcoming-showings
 */
exports.getUpcomingShowings = async (req, res) => {
  try {
    // Get user ID from request
    const userId = req.user.id;
    
    // Check if user has real estate role
    const userRoleResult = await db.query(
      `SELECT role FROM core.user_roles 
       WHERE user_id = $1 AND role IN ('real_estate_agent', 'real_estate_manager', 'admin')`,
      [userId]
    );
    
    if (userRoleResult.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    
    const userRole = userRoleResult.rows[0].role;
    let agentFilter = '';
    let agentParams = [];
    
    // If user is an agent, only show their showings
    if (userRole === 'real_estate_agent') {
      agentFilter = 'AND l.agent_id = $1';
      agentParams = [userId];
    }
    
    // Get upcoming showings
    const query = `
      SELECT s.*, 
             c.first_name as client_first_name, c.last_name as client_last_name, c.email as client_email,
             l.list_price, l.status as listing_status,
             p.address, p.city, p.state, p.zip, p.type
      FROM real_estate.showings s
      JOIN real_estate.clients c ON s.client_id = c.id
      JOIN real_estate.listings l ON s.listing_id = l.id
      JOIN real_estate.properties p ON l.property_id = p.id
      WHERE s.start_time > NOW()
      AND s.status = 'Scheduled'
      ${agentFilter}
      ORDER BY s.start_time ASC
      LIMIT 5
    `;
    
    const result = await db.query(query, agentParams);
    
    // Format the response
    const showings = result.rows.map(showing => {
      return {
        id: showing.id,
        startTime: showing.start_time,
        endTime: showing.end_time,
        status: showing.status,
        client: {
          id: showing.client_id,
          firstName: showing.client_first_name,
          lastName: showing.client_last_name,
          email: showing.client_email
        },
        listing: {
          id: showing.listing_id,
          listPrice: showing.list_price,
          status: showing.listing_status,
          property: {
            address: showing.address,
            city: showing.city,
            state: showing.state,
            zip: showing.zip,
            type: showing.type
          }
        }
      };
    });
    
    res.status(200).json(showings);
  } catch (error) {
    logger.error('Error getting upcoming showings', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching upcoming showings' });
  }
};

/**
 * Get recent activities
 * @route GET /api/real-estate/dashboard/activities
 */
exports.getRecentActivities = async (req, res) => {
  try {
    // Get user ID from request
    const userId = req.user.id;
    
    // Check if user has real estate role
    const userRoleResult = await db.query(
      `SELECT role FROM core.user_roles 
       WHERE user_id = $1 AND role IN ('real_estate_agent', 'real_estate_manager', 'admin')`,
      [userId]
    );
    
    if (userRoleResult.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    
    const userRole = userRoleResult.rows[0].role;
    let agentFilter = '';
    let agentParams = [];
    
    // If user is an agent, only show their activities
    if (userRole === 'real_estate_agent') {
      agentFilter = 'AND (l.agent_id = $1 OR a.user_id = $1)';
      agentParams = [userId];
    }
    
    // Get recent activities
    const query = `
      SELECT a.*, 
             u.first_name as user_first_name, u.last_name as user_last_name,
             p.address, p.city, p.state, p.zip,
             l.agent_id
      FROM real_estate.activities a
      JOIN core.users u ON a.user_id = u.id
      LEFT JOIN real_estate.properties p ON a.property_id = p.id
      LEFT JOIN real_estate.listings l ON a.listing_id = l.id
      WHERE 1=1
      ${agentFilter}
      ORDER BY a.created_at DESC
      LIMIT 10
    `;
    
    const result = await db.query(query, agentParams);
    
    // Format the response
    const activities = result.rows.map(activity => {
      return {
        id: activity.id,
        type: activity.type,
        description: activity.description,
        createdAt: activity.created_at,
        user: {
          id: activity.user_id,
          firstName: activity.user_first_name,
          lastName: activity.user_last_name
        },
        property: activity.property_id ? {
          id: activity.property_id,
          address: activity.address,
          city: activity.city,
          state: activity.state,
          zip: activity.zip
        } : null,
        listing: activity.listing_id ? {
          id: activity.listing_id
        } : null,
        client: activity.client_id ? {
          id: activity.client_id
        } : null,
        showing: activity.showing_id ? {
          id: activity.showing_id
        } : null,
        offer: activity.offer_id ? {
          id: activity.offer_id
        } : null,
        transaction: activity.transaction_id ? {
          id: activity.transaction_id
        } : null
      };
    });
    
    res.status(200).json(activities);
  } catch (error) {
    logger.error('Error getting recent activities', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching recent activities' });
  }
};
