import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  Box
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  MonetizationOn as MonetizationOnIcon,
  Receipt as ReceiptIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

/**
 * Component to display recent activities in the real estate module
 * 
 * @param {Array} activities - Array of activity objects
 * @returns {JSX.Element} - The recent activities component
 */
const RecentActivities = ({ activities = [] }) => {
  // Function to get the appropriate icon for each activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'property':
        return <HomeIcon />;
      case 'client':
        return <PersonIcon />;
      case 'showing':
        return <VisibilityIcon />;
      case 'offer':
        return <MonetizationOnIcon />;
      case 'transaction':
        return <ReceiptIcon />;
      case 'document':
        return <DescriptionIcon />;
      default:
        return <DescriptionIcon />;
    }
  };

  // Function to get the appropriate color for each activity type
  const getActivityColor = (type) => {
    switch (type) {
      case 'property':
        return '#4caf50'; // green
      case 'client':
        return '#2196f3'; // blue
      case 'showing':
        return '#ff9800'; // orange
      case 'offer':
        return '#f44336'; // red
      case 'transaction':
        return '#9c27b0'; // purple
      case 'document':
        return '#795548'; // brown
      default:
        return '#607d8b'; // blue-grey
    }
  };

  // Format the timestamp to a readable format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
      {activities.length > 0 ? (
        activities.map((activity, index) => (
          <React.Fragment key={activity.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: `${getActivityColor(activity.type)}20`, color: getActivityColor(activity.type) }}>
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={activity.title}
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {activity.description}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(activity.timestamp)}
                      </Typography>
                      {activity.user && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          by {activity.user}
                        </Typography>
                      )}
                    </Box>
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < activities.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))
      ) : (
        <ListItem>
          <ListItemText
            primary="No recent activities"
            secondary="Activities will appear here as they occur"
          />
        </ListItem>
      )}
    </List>
  );
};

export default RecentActivities;
