import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { ThemeContext } from '../../contexts/ThemeContext';
import Header from './Header';
import Sidebar from './Sidebar';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const Layout = () => {
  const theme = useTheme();
  const { darkMode } = useContext(ThemeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: darkMode ? 'background.default' : 'background.paper', minHeight: '100vh' }}>
      <CssBaseline />
      <Header 
        drawerWidth={drawerWidth} 
        open={sidebarOpen} 
        handleDrawerToggle={handleDrawerToggle} 
      />
      <Sidebar 
        drawerWidth={drawerWidth} 
        open={sidebarOpen} 
        handleDrawerToggle={handleDrawerToggle}
        variant={isMobile ? 'temporary' : 'persistent'}
      />
      <Main open={sidebarOpen && !isMobile}>
        <Box component="div" sx={{ mt: 8, p: 1 }}>
          <Outlet />
        </Box>
      </Main>
    </Box>
  );
};

export default Layout;
