/**
 * Real Estate Controllers Index
 * 
 * Exports all real estate controllers for use in the API routes.
 */

const propertyController = require('./propertyController');
const listingController = require('./listingController');
const clientController = require('./clientController');
const showingController = require('./showingController');
const offerController = require('./offerController');
const transactionController = require('./transactionController');
const dashboardController = require('./dashboardController');

module.exports = {
  // Property endpoints
  getAllProperties: propertyController.getAllProperties,
  getPropertyById: propertyController.getPropertyById,
  createProperty: propertyController.createProperty,
  updateProperty: propertyController.updateProperty,
  deleteProperty: propertyController.deleteProperty,
  
  // Listing endpoints
  getAllListings: listingController.getAllListings,
  getListingById: listingController.getListingById,
  createListing: listingController.createListing,
  updateListing: listingController.updateListing,
  deleteListing: listingController.deleteListing,
  
  // Client endpoints
  getAllClients: clientController.getAllClients,
  getClientById: clientController.getClientById,
  createClient: clientController.createClient,
  updateClient: clientController.updateClient,
  deleteClient: clientController.deleteClient,
  
  // Showing endpoints
  getAllShowings: showingController.getAllShowings,
  getShowingById: showingController.getShowingById,
  createShowing: showingController.createShowing,
  updateShowing: showingController.updateShowing,
  deleteShowing: showingController.deleteShowing,
  
  // Offer endpoints
  getAllOffers: offerController.getAllOffers,
  getOfferById: offerController.getOfferById,
  createOffer: offerController.createOffer,
  updateOffer: offerController.updateOffer,
  deleteOffer: offerController.deleteOffer,
  
  // Transaction endpoints
  getAllTransactions: transactionController.getAllTransactions,
  getTransactionById: transactionController.getTransactionById,
  createTransaction: transactionController.createTransaction,
  updateTransaction: transactionController.updateTransaction,
  deleteTransaction: transactionController.deleteTransaction,
  
  // Dashboard endpoints
  getDashboardStats: dashboardController.getDashboardStats,
  getRecentListings: dashboardController.getRecentListings,
  getUpcomingShowings: dashboardController.getUpcomingShowings,
  getRecentActivities: dashboardController.getRecentActivities
};
