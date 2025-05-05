import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * A wrapper around routes that require authentication
 * If the user is not authenticated, they will be redirected to the login page
 * 
 * @param {boolean} isAuthenticated - Whether the user is authenticated
 * @param {string} redirectPath - Path to redirect to if not authenticated
 * @returns {JSX.Element} - The protected route or a redirect
 */
const ProtectedRoute = ({ 
  isAuthenticated, 
  redirectPath = '/login', 
  children 
}) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
