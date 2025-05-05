/**
 * Real Estate API Routes
 */

const express = require('express');
const { body, param } = require('express-validator');
const realEstateController = require('../controllers/realEstateControllers/index');
const { auth, checkPermission, checkOwnership } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

const router = express.Router();

/**
 * @route GET /api/real-estate/properties
 * @desc Get all properties
 */
router.get('/properties', auth, realEstateController.getAllProperties);

/**
 * @route GET /api/real-estate/properties/:id
 * @desc Get a property by ID
 */
router.get(
  '/properties/:id',
  auth,
  [
    param('id').isInt().withMessage('Invalid property ID')
  ],
  validationMiddleware,
  realEstateController.getPropertyById
);

/**
 * @route POST /api/real-estate/properties
 * @desc Create a new property
 */
router.post(
  '/properties',
  auth,
  checkPermission('create_property'),
  [
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('zip').notEmpty().withMessage('Zip code is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('type').notEmpty().withMessage('Property type is required'),
    body('bedrooms').isInt().withMessage('Bedrooms must be an integer'),
    body('bathrooms').isDecimal().withMessage('Bathrooms must be a decimal'),
    body('squareFeet').isInt().withMessage('Square feet must be an integer'),
    body('lotSize').isDecimal().withMessage('Lot size must be a decimal'),
    body('yearBuilt').isInt().withMessage('Year built must be an integer'),
    body('listingPrice').isDecimal().withMessage('Listing price must be a decimal'),
    body('salePrice').isDecimal().withMessage('Sale price must be a decimal'),
    body('status').notEmpty().withMessage('Property status is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('images').optional().isArray().withMessage('Images must be an array')
  ],
  validationMiddleware,
  realEstateController.createProperty
);

/**
 * @route PUT /api/real-estate/properties/:id
 * @desc Update a property
 */
router.put(
  '/properties/:id',
  auth,
  checkPermission('update_property'),
  [
    param('id').isInt().withMessage('Invalid property ID'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('zip').notEmpty().withMessage('Zip code is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('type').notEmpty().withMessage('Property type is required'),
    body('bedrooms').isInt().withMessage('Bedrooms must be an integer'),
    body('bathrooms').isDecimal().withMessage('Bathrooms must be a decimal'),
    body('squareFeet').isInt().withMessage('Square feet must be an integer'),
    body('lotSize').isDecimal().withMessage('Lot size must be a decimal'),
    body('yearBuilt').isInt().withMessage('Year built must be an integer'),
    body('listingPrice').isDecimal().withMessage('Listing price must be a decimal'),
    body('salePrice').isDecimal().withMessage('Sale price must be a decimal'),
    body('status').notEmpty().withMessage('Property status is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('images').optional().isArray().withMessage('Images must be an array')
  ],
  validationMiddleware,
  realEstateController.updateProperty
);

/**
 * @route DELETE /api/real-estate/properties/:id
 * @desc Delete a property
 */
router.delete(
  '/properties/:id',
  auth,
  checkPermission('delete_property'),
  [
    param('id').isInt().withMessage('Invalid property ID')
  ],
  validationMiddleware,
  realEstateController.deleteProperty
);

/**
 * @route GET /api/real-estate/listings
 * @desc Get all listings
 */
router.get('/listings', auth, realEstateController.getAllListings);

/**
 * @route GET /api/real-estate/listings/:id
 * @desc Get a listing by ID
 */
router.get(
  '/listings/:id',
  auth,
  [
    param('id').isInt().withMessage('Invalid listing ID')
  ],
  validationMiddleware,
  realEstateController.getListingById
);

/**
 * @route POST /api/real-estate/listings
 * @desc Create a new listing
 */
router.post(
  '/listings',
  auth,
  checkPermission('create_listing'),
  [
    body('propertyId').isInt().withMessage('Invalid property ID'),
    body('agentId').isInt().withMessage('Invalid agent ID'),
    body('listPrice').isDecimal().withMessage('List price must be a decimal'),
    body('startDate').isDate().withMessage('Start date must be a valid date'),
    body('endDate').optional().isDate().withMessage('End date must be a valid date'),
    body('status').notEmpty().withMessage('Listing status is required')
  ],
  validationMiddleware,
  realEstateController.createListing
);

/**
 * @route PUT /api/real-estate/listings/:id
 * @desc Update a listing
 */
router.put(
  '/listings/:id',
  auth,
  checkPermission('update_listing'),
  [
    param('id').isInt().withMessage('Invalid listing ID'),
    body('propertyId').isInt().withMessage('Invalid property ID'),
    body('agentId').isInt().withMessage('Invalid agent ID'),
    body('listPrice').isDecimal().withMessage('List price must be a decimal'),
    body('startDate').isDate().withMessage('Start date must be a valid date'),
    body('endDate').optional().isDate().withMessage('End date must be a valid date'),
    body('status').notEmpty().withMessage('Listing status is required')
  ],
  validationMiddleware,
  realEstateController.updateListing
);

/**
 * @route DELETE /api/real-estate/listings/:id
 * @desc Delete a listing
 */
router.delete(
  '/listings/:id',
  auth,
  checkPermission('delete_listing'),
  [
    param('id').isInt().withMessage('Invalid listing ID')
  ],
  validationMiddleware,
  realEstateController.deleteListing
);

/**
 * @route GET /api/real-estate/clients
 * @desc Get all clients
 */
router.get('/clients', auth, realEstateController.getAllClients);

/**
 * @route GET /api/real-estate/clients/:id
 * @desc Get a client by ID
 */
router.get(
  '/clients/:id',
  auth,
  [
    param('id').isInt().withMessage('Invalid client ID')
  ],
  validationMiddleware,
  realEstateController.getClientById
);

/**
 * @route POST /api/real-estate/clients
 * @desc Create a new client
 */
router.post(
  '/clients',
  auth,
  checkPermission('create_client'),
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('address').optional().isString().withMessage('Address must be a string'),
    body('city').optional().isString().withMessage('City must be a string'),
    body('state').optional().isString().withMessage('State must be a string'),
    body('zip').optional().isString().withMessage('Zip code must be a string'),
    body('country').optional().isString().withMessage('Country must be a string')
  ],
  validationMiddleware,
  realEstateController.createClient
);

/**
 * @route PUT /api/real-estate/clients/:id
 * @desc Update a client
 */
router.put(
  '/clients/:id',
  auth,
  checkPermission('update_client'),
  [
    param('id').isInt().withMessage('Invalid client ID'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('address').optional().isString().withMessage('Address must be a string'),
    body('city').optional().isString().withMessage('City must be a string'),
    body('state').optional().isString().withMessage('State must be a string'),
    body('zip').optional().isString().withMessage('Zip code must be a string'),
    body('country').optional().isString().withMessage('Country must be a string')
  ],
  validationMiddleware,
  realEstateController.updateClient
);

/**
 * @route DELETE /api/real-estate/clients/:id
 * @desc Delete a client
 */
router.delete(
  '/clients/:id',
  auth,
  checkPermission('delete_client'),
  [
    param('id').isInt().withMessage('Invalid client ID')
  ],
  validationMiddleware,
  realEstateController.deleteClient
);

/**
 * @route GET /api/real-estate/showings
 * @desc Get all showings
 */
router.get('/showings', auth, realEstateController.getAllShowings);

/**
 * @route GET /api/real-estate/showings/:id
 * @desc Get a showing by ID
 */
router.get(
  '/showings/:id',
  auth,
  [
    param('id').isInt().withMessage('Invalid showing ID')
  ],
  validationMiddleware,
  realEstateController.getShowingById
);

/**
 * @route POST /api/real-estate/showings
 * @desc Create a new showing
 */
router.post(
  '/showings',
  auth,
  checkPermission('create_showing'),
  [
    body('listingId').isInt().withMessage('Invalid listing ID'),
    body('clientId').isInt().withMessage('Invalid client ID'),
    body('startTime').isISO8601().withMessage('Start time must be a valid ISO 8601 date-time'),
    body('endTime').isISO8601().withMessage('End time must be a valid ISO 8601 date-time'),
    body('feedback').optional().isString().withMessage('Feedback must be a string')
  ],
  validationMiddleware,
  realEstateController.createShowing
);

/**
 * @route PUT /api/real-estate/showings/:id
 * @desc Update a showing
 */
router.put(
  '/showings/:id',
  auth,
  checkPermission('update_showing'),
  [
    param('id').isInt().withMessage('Invalid showing ID'),
    body('listingId').isInt().withMessage('Invalid listing ID'),
    body('clientId').isInt().withMessage('Invalid client ID'),
    body('startTime').isISO8601().withMessage('Start time must be a valid ISO 8601 date-time'),
    body('endTime').isISO8601().withMessage('End time must be a valid ISO 8601 date-time'),
    body('feedback').optional().isString().withMessage('Feedback must be a string')
  ],
  validationMiddleware,
  realEstateController.updateShowing
);

/**
 * @route DELETE /api/real-estate/showings/:id
 * @desc Delete a showing
 */
router.delete(
  '/showings/:id',
  auth,
  checkPermission('delete_showing'),
  [
    param('id').isInt().withMessage('Invalid showing ID')
  ],
  validationMiddleware,
  realEstateController.deleteShowing
);

/**
 * @route GET /api/real-estate/offers
 * @desc Get all offers
 */
router.get('/offers', auth, realEstateController.getAllOffers);

/**
 * @route GET /api/real-estate/offers/:id
 * @desc Get an offer by ID
 */
router.get(
  '/offers/:id',
  auth,
  [
    param('id').isInt().withMessage('Invalid offer ID')
  ],
  validationMiddleware,
  realEstateController.getOfferById
);

/**
 * @route POST /api/real-estate/offers
 * @desc Create a new offer
 */
router.post(
  '/offers',
  auth,
  checkPermission('create_offer'),
  [
    body('listingId').isInt().withMessage('Invalid listing ID'),
    body('clientId').isInt().withMessage('Invalid client ID'),
    body('offerPrice').isDecimal().withMessage('Offer price must be a decimal'),
    body('offerDate').isDate().withMessage('Offer date must be a valid date'),
    body('status').notEmpty().withMessage('Offer status is required')
  ],
  validationMiddleware,
  realEstateController.createOffer
);

/**
 * @route PUT /api/real-estate/offers/:id
 * @desc Update an offer
 */
router.put(
  '/offers/:id',
  auth,
  checkPermission('update_offer'),
  [
    param('id').isInt().withMessage('Invalid offer ID'),
    body('listingId').isInt().withMessage('Invalid listing ID'),
    body('clientId').isInt().withMessage('Invalid client ID'),
    body('offerPrice').isDecimal().withMessage('Offer price must be a decimal'),
    body('offerDate').isDate().withMessage('Offer date must be a valid date'),
    body('status').notEmpty().withMessage('Offer status is required')
  ],
  validationMiddleware,
  realEstateController.updateOffer
);

/**
 * @route DELETE /api/real-estate/offers/:id
 * @desc Delete an offer
 */
router.delete(
  '/offers/:id',
  auth,
  checkPermission('delete_offer'),
  [
    param('id').isInt().withMessage('Invalid offer ID')
  ],
  validationMiddleware,
  realEstateController.deleteOffer
);

/**
 * @route GET /api/real-estate/transactions
 * @desc Get all transactions
 */
router.get('/transactions', auth, realEstateController.getAllTransactions);

/**
 * @route GET /api/real-estate/transactions/:id
 * @desc Get a transaction by ID
 */
router.get(
  '/transactions/:id',
  auth,
  [
    param('id').isInt().withMessage('Invalid transaction ID')
  ],
  validationMiddleware,
  realEstateController.getTransactionById
);

/**
 * @route POST /api/real-estate/transactions
 * @desc Create a new transaction
 */
router.post(
  '/transactions',
  auth,
  checkPermission('create_transaction'),
  [
    body('offerId').isInt().withMessage('Invalid offer ID'),
    body('closingDate').isDate().withMessage('Closing date must be a valid date'),
    body('commissionAmount').isDecimal().withMessage('Commission amount must be a decimal')
  ],
  validationMiddleware,
  realEstateController.createTransaction
);

/**
 * @route PUT /api/real-estate/transactions/:id
 * @desc Update a transaction
 */
router.put(
  '/transactions/:id',
  auth,
  checkPermission('update_transaction'),
  [
    param('id').isInt().withMessage('Invalid transaction ID'),
    body('offerId').isInt().withMessage('Invalid offer ID'),
    body('closingDate').isDate().withMessage('Closing date must be a valid date'),
    body('commissionAmount').isDecimal().withMessage('Commission amount must be a decimal')
  ],
  validationMiddleware,
  realEstateController.updateTransaction
);

/**
 * @route DELETE /api/real-estate/transactions/:id
 * @desc Delete a transaction
 */
router.delete(
  '/transactions/:id',
  auth,
  checkPermission('delete_transaction'),
  [
    param('id').isInt().withMessage('Invalid transaction ID')
  ],
  validationMiddleware,
  realEstateController.deleteTransaction
);

/**
 * @route GET /api/real-estate/dashboard/stats
 * @desc Get dashboard statistics
 */
router.get('/dashboard/stats', auth, realEstateController.getDashboardStats);

/**
 * @route GET /api/real-estate/dashboard/recent-listings
 * @desc Get recent listings for dashboard
 */
router.get('/dashboard/recent-listings', auth, realEstateController.getRecentListings);

/**
 * @route GET /api/real-estate/dashboard/upcoming-showings
 * @desc Get upcoming showings for dashboard
 */
router.get('/dashboard/upcoming-showings', auth, realEstateController.getUpcomingShowings);

/**
 * @route GET /api/real-estate/dashboard/activities
 * @desc Get recent activities for dashboard
 */
router.get('/dashboard/activities', auth, realEstateController.getRecentActivities);

module.exports = router;
