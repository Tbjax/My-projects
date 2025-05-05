import React, { useState, useContext } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Typography,
  Avatar,
  IconButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  MonetizationOn as MonetizationOnIcon,
  Receipt as ReceiptIcon,
  Description as DescriptionIcon,
  Announcement as AnnouncementIcon,
  Event as EventIcon,
  Task as TaskIcon,
  AccountBalance as AccountBalanceIcon,
  Build as BuildIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../contexts/AuthContext';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Sidebar = ({ drawerWidth, open, handleDrawerToggle, variant = 'persistent' }) => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [openMenus, setOpenMenus] = useState({
    realEstate: true,
    mortgage: false,
    maintenance: false,
    core: false
  });

  const handleMenuToggle = (menu) => {
    setOpenMenus({
      ...openMenus,
      [menu]: !openMenus[menu]
    });
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      exact: true
    },
    {
      title: 'Real Estate',
      icon: <HomeIcon />,
      submenu: [
        {
          title: 'Dashboard',
          icon: <DashboardIcon />,
          path: '/real-estate'
        },
        {
          title: 'Properties',
          icon: <HomeIcon />,
          path: '/real-estate/properties'
        },
        {
          title: 'Listings',
          icon: <BusinessIcon />,
          path: '/real-estate/listings'
        },
        {
          title: 'Clients',
          icon: <PersonIcon />,
          path: '/real-estate/clients'
        },
        {
          title: 'Showings',
          icon: <VisibilityIcon />,
          path: '/real-estate/showings'
        },
        {
          title: 'Offers',
          icon: <MonetizationOnIcon />,
          path: '/real-estate/offers'
        },
        {
          title: 'Transactions',
          icon: <ReceiptIcon />,
          path: '/real-estate/transactions'
        }
      ]
    },
    {
      title: 'Mortgage',
      icon: <AccountBalanceIcon />,
      submenu: [
        {
          title: 'Dashboard',
          icon: <DashboardIcon />,
          path: '/mortgage'
        },
        {
          title: 'Loan Applications',
          icon: <DescriptionIcon />,
          path: '/mortgage/loan-applications'
        },
        {
          title: 'Rates',
          icon: <MonetizationOnIcon />,
          path: '/mortgage/rates'
        },
        {
          title: 'Lenders',
          icon: <BusinessIcon />,
          path: '/mortgage/lenders'
        }
      ]
    },
    {
      title: 'Maintenance',
      icon: <BuildIcon />,
      submenu: [
        {
          title: 'Dashboard',
          icon: <DashboardIcon />,
          path: '/maintenance'
        },
        {
          title: 'Work Orders',
          icon: <TaskIcon />,
          path: '/maintenance/work-orders'
        },
        {
          title: 'Contractors',
          icon: <PersonIcon />,
          path: '/maintenance/contractors'
        },
        {
          title: 'Inventory',
          icon: <HomeIcon />,
          path: '/maintenance/inventory'
        }
      ]
    },
    {
      title: 'Core',
      icon: <DashboardIcon />,
      submenu: [
        {
          title: 'Documents',
          icon: <DescriptionIcon />,
          path: '/documents'
        },
        {
          title: 'Announcements',
          icon: <AnnouncementIcon />,
          path: '/announcements'
        },
        {
          title: 'Calendar',
          icon: <EventIcon />,
          path: '/calendar'
        },
        {
          title: 'Tasks',
          icon: <TaskIcon />,
          path: '/tasks'
        }
      ]
    }
  ];

  const drawer = (
    <>
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', px: 2 }}>
          <Avatar 
            alt={user?.name || 'User'} 
            src={user?.avatar} 
            sx={{ width: 40, height: 40, mr: 2 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" noWrap>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user?.role || 'Role'}
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item) => (
          item.submenu ? (
            <React.Fragment key={item.title}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleMenuToggle(item.title.toLowerCase().replace(' ', ''))}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                  {openMenus[item.title.toLowerCase().replace(' ', '')] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>
              <Collapse in={openMenus[item.title.toLowerCase().replace(' ', '')]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((subitem) => (
                    <ListItem key={subitem.path} disablePadding>
                      <ListItemButton
                        component={RouterLink}
                        to={subitem.path}
                        selected={isActive(subitem.path)}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>
                          {subitem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subitem.title} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ) : (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={isActive(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
    </>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={handleDrawerToggle}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
