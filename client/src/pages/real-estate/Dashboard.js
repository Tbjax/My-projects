import React from 'react';
import { Box } from '@mui/material';
import RealEstateDashboard from '../../components/real-estate/Dashboard';

/**
 * Real Estate Dashboard page component
 * This is a wrapper around the RealEstateDashboard component
 * 
 * @returns {JSX.Element} - The real estate dashboard page component
 */
const Dashboard = () => {
  return (
    <Box>
      <RealEstateDashboard />
    </Box>
  );
};

export default Dashboard;
