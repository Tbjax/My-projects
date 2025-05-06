import React, { useContext, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthContext } from './contexts/AuthContext';
import Layout from './components/core/Layout';
import ProtectedRoute from './components/core/ProtectedRoute';
import Notification from './components/common/Notification';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('./pages/core/Dashboard'));
const Profile = lazy(() => import('./pages/core/Profile'));
const NotFound = lazy(() => import('./pages/core/NotFound'));

// Real Estate Module
const RealEstateDashboard = lazy(() => import('./pages/real-estate/Dashboard'));
const PropertyList = lazy(() => import('./pages/real-estate/property/List'));
const PropertyDetails = lazy(() => import('./pages/real-estate/property/Details'));
const PropertyCreate = lazy(() => import('./pages/real-estate/property/Create'));
const PropertyEdit = lazy(() => import('./pages/real-estate/property/Edit'));
const ListingList = lazy(() => import('./pages/real-estate/listing/List'));
const ListingDetails = lazy(() => import('./pages/real-estate/listing/Details'));
const ListingCreate = lazy(() => import('./pages/real-estate/listing/Create'));
const ListingEdit = lazy(() => import('./pages/real-estate/listing/Edit'));
const ClientList = lazy(() => import('./pages/real-estate/client/List'));
const ClientDetails = lazy(() => import('./pages/real-estate/client/Details'));
const ClientCreate = lazy(() => import('./pages/real-estate/client/Create'));
const ClientEdit = lazy(() => import('./pages/real-estate/client/Edit'));
const ShowingList = lazy(() => import('./pages/real-estate/showing/List'));
const ShowingDetails = lazy(() => import('./pages/real-estate/showing/Details'));
const ShowingCreate = lazy(() => import('./pages/real-estate/showing/Create'));
const ShowingEdit = lazy(() => import('./pages/real-estate/showing/Edit'));
const OfferList = lazy(() => import('./pages/real-estate/offer/List'));
const OfferDetails = lazy(() => import('./pages/real-estate/offer/Details'));
const OfferCreate = lazy(() => import('./pages/real-estate/offer/Create'));
const OfferEdit = lazy(() => import('./pages/real-estate/offer/Edit'));
const TransactionList = lazy(() => import('./pages/real-estate/transaction/List'));
const TransactionDetails = lazy(() => import('./pages/real-estate/transaction/Details'));
const TransactionCreate = lazy(() => import('./pages/real-estate/transaction/Create'));
const TransactionEdit = lazy(() => import('./pages/real-estate/transaction/Edit'));

// Mortgage Module
const MortgageDashboard = lazy(() => import('./pages/mortgage/Dashboard'));
const LoanApplicationList = lazy(() => import('./pages/mortgage/loan-application/List'));
const LoanApplicationDetails = lazy(() => import('./pages/mortgage/loan-application/Details'));
const LoanApplicationCreate = lazy(() => import('./pages/mortgage/loan-application/Create'));
const LoanApplicationEdit = lazy(() => import('./pages/mortgage/loan-application/Edit'));

// Maintenance Module
const WorkOrderList = lazy(() => import('./pages/maintenance/work-order/List'));
const WorkOrderDetails = lazy(() => import('./pages/maintenance/work-order/Details'));
const WorkOrderCreate = lazy(() => import('./pages/maintenance/work-order/Create'));
const WorkOrderEdit = lazy(() => import('./pages/maintenance/work-order/Edit'));

// Document Management
const DocumentList = lazy(() => import('./pages/core/document/List'));
const DocumentDetails = lazy(() => import('./pages/core/document/Details'));
const DocumentCreate = lazy(() => import('./pages/core/document/Create'));

// Loading component for suspense fallback
const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

const App = () => {
  const { isAuthenticated, loading, checkAuth } = useContext(AuthContext);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <>
      <Notification />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
          <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/" />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route element={<Layout />}>
              {/* Core routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Document routes */}
              <Route path="/documents" element={<DocumentList />} />
              <Route path="/documents/:id" element={<DocumentDetails />} />
              <Route path="/documents/create" element={<DocumentCreate />} />
              
              {/* Real Estate routes */}
              <Route path="/real-estate" element={<RealEstateDashboard />} />
              <Route path="/real-estate/properties" element={<PropertyList />} />
              <Route path="/real-estate/properties/:id" element={<PropertyDetails />} />
              <Route path="/real-estate/properties/create" element={<PropertyCreate />} />
              <Route path="/real-estate/properties/:id/edit" element={<PropertyEdit />} />
              <Route path="/real-estate/listings" element={<ListingList />} />
              <Route path="/real-estate/listings/:id" element={<ListingDetails />} />
              <Route path="/real-estate/listings/create" element={<ListingCreate />} />
              <Route path="/real-estate/listings/:id/edit" element={<ListingEdit />} />
              <Route path="/real-estate/clients" element={<ClientList />} />
              <Route path="/real-estate/clients/:id" element={<ClientDetails />} />
              <Route path="/real-estate/clients/create" element={<ClientCreate />} />
              <Route path="/real-estate/clients/:id/edit" element={<ClientEdit />} />
              <Route path="/real-estate/showings" element={<ShowingList />} />
              <Route path="/real-estate/showings/:id" element={<ShowingDetails />} />
              <Route path="/real-estate/showings/create" element={<ShowingCreate />} />
              <Route path="/real-estate/showings/:id/edit" element={<ShowingEdit />} />
              <Route path="/real-estate/offers" element={<OfferList />} />
              <Route path="/real-estate/offers/:id" element={<OfferDetails />} />
              <Route path="/real-estate/offers/create" element={<OfferCreate />} />
              <Route path="/real-estate/offers/:id/edit" element={<OfferEdit />} />
              <Route path="/real-estate/transactions" element={<TransactionList />} />
              <Route path="/real-estate/transactions/:id" element={<TransactionDetails />} />
              <Route path="/real-estate/transactions/create" element={<TransactionCreate />} />
              <Route path="/real-estate/transactions/:id/edit" element={<TransactionEdit />} />
              
              {/* Mortgage routes */}
              <Route path="/mortgage" element={<MortgageDashboard />} />
              <Route path="/mortgage/loan-applications" element={<LoanApplicationList />} />
              <Route path="/mortgage/loan-applications/:id" element={<LoanApplicationDetails />} />
              <Route path="/mortgage/loan-applications/create" element={<LoanApplicationCreate />} />
              <Route path="/mortgage/loan-applications/:id/edit" element={<LoanApplicationEdit />} />
              
              {/* Maintenance routes */}
              <Route path="/maintenance" element={<MaintenanceDashboard />} />
              <Route path="/maintenance/work-orders" element={<WorkOrderList />} />
              <Route path="/maintenance/work-orders/:id" element={<WorkOrderDetails />} />
              <Route path="/maintenance/work-orders/create" element={<WorkOrderCreate />} />
              <Route path="/maintenance/work-orders/:id/edit" element={<WorkOrderEdit />} />
            </Route>
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
