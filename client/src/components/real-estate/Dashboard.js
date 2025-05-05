import React, { useState, useEffect, useContext } from 'react';
import { Grid, Paper, Typography, Box, Button, Card, CardContent, CardActions, Divider, Chip, Avatar, CircularProgress } from '@mui/material';
import { 
  Home as HomeIcon, 
  Person as PersonIcon, 
  Assignment as AssignmentIcon, 
  Visibility as VisibilityIcon,
  MonetizationOn as MonetizationOnIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import PropertyChart from './charts/PropertyChart';
import SalesChart from './charts/SalesChart';
import RecentActivities from './common/RecentActivities';
import StatsCard from '../common/StatsCard';
import api from '../../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    properties: 0,
    listings: 0,
    showings: 0,
    pendingOffers: 0,
    closedDeals: 0,
    revenue: 0
  });
  const [recentListings, setRecentListings] = useState([]);
  const [upcomingShowings, setUpcomingShowings] = useState([]);
  const [activities, setActivities] = useState([]);
  
  const { user } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const statsResponse = await api.get('/api/real-estate/dashboard/stats');
        setStats(statsResponse.data);
        
        // Fetch recent listings
        const listingsResponse = await api.get('/api/real-estate/dashboard/recent-listings');
        setRecentListings(listingsResponse.data);
        
        // Fetch upcoming showings
        const showingsResponse = await api.get('/api/real-estate/dashboard/upcoming-showings');
        setUpcomingShowings(showingsResponse.data);
        
        // Fetch recent activities
        const activitiesResponse = await api.get('/api/real-estate/dashboard/activities');
        setActivities(activitiesResponse.data);
        
        setLoading(false);
      } catch (error) {
        showNotification('Error loading dashboard data', 'error');
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [showNotification]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom component="div" sx={{ fontWeight: 'bold', mb: 4 }}>
        Real Estate Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <StatsCard 
            title="Properties" 
            value={stats.properties} 
            icon={<HomeIcon />} 
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatsCard 
            title="Active Listings" 
            value={stats.listings} 
            icon={<AssignmentIcon />} 
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatsCard 
            title="Showings" 
            value={stats.showings} 
            icon={<VisibilityIcon />} 
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatsCard 
            title="Pending Offers" 
            value={stats.pendingOffers} 
            icon={<MonetizationOnIcon />} 
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatsCard 
            title="Closed Deals" 
            value={stats.closedDeals} 
            icon={<TrendingUpIcon />} 
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatsCard 
            title="Revenue" 
            value={formatCurrency(stats.revenue)} 
            icon={<MonetizationOnIcon />} 
            color="#009688"
          />
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography variant="h6" gutterBottom component="div">
              Property Types
            </Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PropertyChart />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography variant="h6" gutterBottom component="div">
              Sales Performance
            </Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SalesChart />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Listings */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Recent Listings
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => navigate('/real-estate/listings')}
          >
            View All
          </Button>
        </Box>
        <Grid container spacing={3}>
          {recentListings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <Card>
                <Box 
                  sx={{ 
                    height: 140, 
                    backgroundImage: `url(${listing.property.images[0] || '/images/property-placeholder.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  <Chip 
                    label={listing.status} 
                    color={
                      listing.status === 'Active' ? 'success' : 
                      listing.status === 'Pending' ? 'warning' : 
                      listing.status === 'Sold' ? 'error' : 'default'
                    }
                    sx={{ position: 'absolute', top: 10, right: 10 }}
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6" component="div" noWrap>
                    {listing.property.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {listing.property.city}, {listing.property.state} {listing.property.zip}
                  </Typography>
                  <Typography variant="h6" component="div" color="primary">
                    {formatCurrency(listing.listPrice)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      {listing.property.bedrooms} beds
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      {listing.property.bathrooms} baths
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {listing.property.squareFeet} sqft
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate(`/real-estate/listings/${listing.id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Upcoming Showings and Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom component="div">
              Upcoming Showings
            </Typography>
            {upcomingShowings.length > 0 ? (
              upcomingShowings.map((showing) => (
                <Box key={showing.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1" component="div">
                      {formatDate(showing.startTime)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1" component="div">
                      {showing.listing.property.address}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1" component="div">
                      {showing.client.firstName} {showing.client.lastName}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="text.secondary">
                No upcoming showings scheduled.
              </Typography>
            )}
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/real-estate/showings')}
              >
                View All Showings
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom component="div">
              Recent Activities
            </Typography>
            <RecentActivities activities={activities} />
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/real-estate/activities')}
              >
                View All Activities
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
