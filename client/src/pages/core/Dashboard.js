import React, { useState, useEffect, useContext } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Divider, 
  Chip, 
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import { 
  Home as HomeIcon, 
  Person as PersonIcon, 
  Assignment as AssignmentIcon, 
  Visibility as VisibilityIcon,
  MonetizationOn as MonetizationOnIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarTodayIcon,
  Announcement as AnnouncementIcon,
  Description as DescriptionIcon,
  Task as TaskIcon,
  Build as BuildIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import StatsCard from '../../components/common/StatsCard';
import api from '../../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [moduleStats, setModuleStats] = useState({
    realEstate: {
      properties: 0,
      listings: 0,
      clients: 0,
      pendingOffers: 0
    },
    mortgage: {
      applications: 0,
      approved: 0,
      pending: 0,
      rejected: 0
    },
    maintenance: {
      workOrders: 0,
      pending: 0,
      inProgress: 0,
      completed: 0
    }
  });
  const [announcements, setAnnouncements] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  const { user } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real app, these would be API calls
        // Mock data for development
        
        // Module stats
        setModuleStats({
          realEstate: {
            properties: 124,
            listings: 87,
            clients: 56,
            pendingOffers: 12
          },
          mortgage: {
            applications: 43,
            approved: 28,
            pending: 10,
            rejected: 5
          },
          maintenance: {
            workOrders: 67,
            pending: 15,
            inProgress: 22,
            completed: 30
          }
        });
        
        // Announcements
        setAnnouncements([
          {
            id: 1,
            title: 'New CRM Features Released',
            content: 'We have released new features for the CRM system. Check out the documentation for more details.',
            date: '2025-05-01T10:00:00',
            author: 'System Admin'
          },
          {
            id: 2,
            title: 'Office Meeting - Friday',
            content: 'There will be an office meeting this Friday at 2:00 PM in the conference room.',
            date: '2025-05-03T14:00:00',
            author: 'HR Department'
          },
          {
            id: 3,
            title: 'System Maintenance',
            content: 'The system will be down for maintenance on Sunday from 2:00 AM to 4:00 AM.',
            date: '2025-05-07T02:00:00',
            author: 'IT Department'
          }
        ]);
        
        // Tasks
        setTasks([
          {
            id: 1,
            title: 'Review new property listings',
            dueDate: '2025-05-06T17:00:00',
            priority: 'high',
            status: 'pending'
          },
          {
            id: 2,
            title: 'Follow up with client John Smith',
            dueDate: '2025-05-07T12:00:00',
            priority: 'medium',
            status: 'pending'
          },
          {
            id: 3,
            title: 'Prepare monthly sales report',
            dueDate: '2025-05-10T17:00:00',
            priority: 'high',
            status: 'in-progress'
          },
          {
            id: 4,
            title: 'Schedule property showing for 123 Main St',
            dueDate: '2025-05-08T10:00:00',
            priority: 'medium',
            status: 'pending'
          }
        ]);
        
        // Recent documents
        setRecentDocuments([
          {
            id: 1,
            title: 'Purchase Agreement - 123 Main St',
            type: 'contract',
            updatedAt: '2025-05-04T14:30:00',
            updatedBy: 'Jane Doe'
          },
          {
            id: 2,
            title: 'Loan Application - John Smith',
            type: 'application',
            updatedAt: '2025-05-03T11:15:00',
            updatedBy: 'Mike Johnson'
          },
          {
            id: 3,
            title: 'Property Inspection Report - 456 Oak Ave',
            type: 'report',
            updatedAt: '2025-05-02T16:45:00',
            updatedBy: 'Sarah Williams'
          }
        ]);
        
        // Upcoming events
        setUpcomingEvents([
          {
            id: 1,
            title: 'Property Showing - 123 Main St',
            start: '2025-05-06T10:00:00',
            end: '2025-05-06T11:00:00',
            type: 'showing'
          },
          {
            id: 2,
            title: 'Client Meeting - John Smith',
            start: '2025-05-07T14:00:00',
            end: '2025-05-07T15:00:00',
            type: 'meeting'
          },
          {
            id: 3,
            title: 'Closing - 789 Pine St',
            start: '2025-05-10T10:00:00',
            end: '2025-05-10T12:00:00',
            type: 'closing'
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        showNotification('Error loading dashboard data', 'error');
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [showNotification]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'contract':
        return <AssignmentIcon />;
      case 'application':
        return <DescriptionIcon />;
      case 'report':
        return <AssignmentIcon />;
      default:
        return <DescriptionIcon />;
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'showing':
        return <VisibilityIcon />;
      case 'meeting':
        return <PersonIcon />;
      case 'closing':
        return <MonetizationOnIcon />;
      default:
        return <CalendarTodayIcon />;
    }
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
        Dashboard
      </Typography>
      
      {/* Welcome Card */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h5" gutterBottom>
          Welcome back, {user?.firstName || 'User'}!
        </Typography>
        <Typography variant="body1">
          Here's an overview of your intranet platform. You can access different modules using the sidebar navigation.
        </Typography>
      </Paper>
      
      {/* Module Stats */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Module Overview
      </Typography>
      
      {/* Real Estate Stats */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Real Estate</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => navigate('/real-estate')}
          >
            Go to Module
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <StatsCard 
              title="Properties" 
              value={moduleStats.realEstate.properties} 
              icon={<HomeIcon />} 
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard 
              title="Listings" 
              value={moduleStats.realEstate.listings} 
              icon={<AssignmentIcon />} 
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard 
              title="Clients" 
              value={moduleStats.realEstate.clients} 
              icon={<PersonIcon />} 
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard 
              title="Pending Offers" 
              value={moduleStats.realEstate.pendingOffers} 
              icon={<MonetizationOnIcon />} 
              color="#f44336"
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Mortgage Stats */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Mortgage</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => navigate('/mortgage')}
          >
            Go to Module
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <StatsCard 
              title="Applications" 
              value={moduleStats.mortgage.applications} 
              icon={<DescriptionIcon />} 
              color="#9c27b0"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard 
              title="Approved" 
              value={moduleStats.mortgage.approved} 
              icon={<TrendingUpIcon />} 
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard 
              title="Pending" 
              value={moduleStats.mortgage.pending} 
              icon={<AssignmentIcon />} 
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard 
              title="Rejected" 
              value={moduleStats.mortgage.rejected} 
              icon={<AssignmentIcon />} 
              color="#f44336"
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Maintenance Stats */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Maintenance</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => navigate('/maintenance')}
          >
            Go to Module
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <StatsCard 
              title="Work Orders" 
              value={moduleStats.maintenance.workOrders} 
              icon={<AssignmentIcon />} 
              color="#607d8b"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard 
              title="Pending" 
              value={moduleStats.maintenance.pending} 
              icon={<AssignmentIcon />} 
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard 
              title="In Progress" 
              value={moduleStats.maintenance.inProgress} 
              icon={<BuildIcon />} 
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard 
              title="Completed" 
              value={moduleStats.maintenance.completed} 
              icon={<AssignmentIcon />} 
              color="#4caf50"
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tasks and Announcements */}
      <Grid container spacing={3}>
        {/* Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div">
                My Tasks
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/tasks')}
              >
                View All
              </Button>
            </Box>
            <List>
              {tasks.map((task) => (
                <React.Fragment key={task.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <TaskIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" component="span" color="text.primary">
                            Due: {formatDate(task.dueDate)}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Chip 
                              label={task.priority} 
                              size="small" 
                              color={getPriorityColor(task.priority)} 
                            />
                            <Chip 
                              label={task.status.replace('-', ' ')} 
                              size="small" 
                              color={getStatusColor(task.status)} 
                            />
                          </Box>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Announcements */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div">
                Announcements
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/announcements')}
              >
                View All
              </Button>
            </Box>
            <List>
              {announcements.map((announcement) => (
                <React.Fragment key={announcement.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <AnnouncementIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={announcement.title}
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" component="span" color="text.primary">
                            {announcement.content}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(announcement.date)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              By: {announcement.author}
                            </Typography>
                          </Box>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Documents and Upcoming Events */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Recent Documents */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div">
                Recent Documents
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/documents')}
              >
                View All
              </Button>
            </Box>
            <List>
              {recentDocuments.map((document) => (
                <React.Fragment key={document.id}>
                  <ListItem 
                    alignItems="flex-start"
                    button
                    onClick={() => navigate(`/documents/${document.id}`)}
                  >
                    <ListItemIcon>
                      {getDocumentIcon(document.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={document.title}
                      secondary={
                        <React.Fragment>
                          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                              Updated: {formatDate(document.updatedAt)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              By: {document.updatedBy}
                            </Typography>
                          </Box>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div">
                Upcoming Events
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate('/calendar')}
              >
                View Calendar
              </Button>
            </Box>
            <List>
              {upcomingEvents.map((event) => (
                <React.Fragment key={event.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      {getEventIcon(event.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" component="span" color="text.primary">
                            {formatDate(event.start)} - {new Date(event.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip 
                              label={event.type} 
                              size="small" 
                              color="primary" 
                            />
                          </Box>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
