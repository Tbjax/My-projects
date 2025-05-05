import React from 'react';
import { Paper, Box, Typography, Avatar } from '@mui/material';

/**
 * A card component for displaying statistics
 * 
 * @param {string} title - The title of the statistic
 * @param {string|number} value - The value of the statistic
 * @param {JSX.Element} icon - The icon to display
 * @param {string} color - The color of the icon background
 * @param {function} onClick - Optional click handler
 * @returns {JSX.Element} - The stats card component
 */
const StatsCard = ({ title, value, icon, color, onClick }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 3
        } : {}
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: `${color}15`, // Using 15% opacity of the color
            color: color,
            width: 48,
            height: 48
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ ml: 'auto' }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
        {title}
      </Typography>
    </Paper>
  );
};

export default StatsCard;
