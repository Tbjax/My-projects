import React, { useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import { 
  InputBase, 
  Box, 
  IconButton, 
  Paper, 
  Popper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Typography, 
  Divider,
  ClickAwayListener
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Close as CloseIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const SearchResultsContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 500,
  maxHeight: 400,
  overflow: 'auto',
  zIndex: theme.zIndex.modal,
}));

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setAnchorEl(event.currentTarget);

    if (value.length >= 2) {
      // Mock search results - in a real app, this would be an API call
      const mockResults = [
        { 
          id: 1, 
          type: 'property', 
          title: '123 Main St', 
          description: 'Single Family Home', 
          icon: <HomeIcon color="primary" />,
          path: '/real-estate/properties/1'
        },
        { 
          id: 2, 
          type: 'client', 
          title: 'John Smith', 
          description: 'Buyer', 
          icon: <PersonIcon color="primary" />,
          path: '/real-estate/clients/2'
        },
        { 
          id: 3, 
          type: 'document', 
          title: 'Purchase Agreement', 
          description: 'Legal document', 
          icon: <DescriptionIcon color="primary" />,
          path: '/documents/3'
        },
        { 
          id: 4, 
          type: 'listing', 
          title: '456 Oak Ave', 
          description: '$350,000 - Active', 
          icon: <BusinessIcon color="primary" />,
          path: '/real-estate/listings/4'
        },
        { 
          id: 5, 
          type: 'transaction', 
          title: 'Smith Property Purchase', 
          description: 'Closing on 6/15/2025', 
          icon: <AssignmentIcon color="primary" />,
          path: '/real-estate/transactions/5'
        }
      ].filter(item => 
        item.title.toLowerCase().includes(value.toLowerCase()) || 
        item.description.toLowerCase().includes(value.toLowerCase())
      );
      
      setSearchResults(mockResults);
    } else {
      setSearchResults([]);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setAnchorEl(null);
  };

  const handleResultClick = (path) => {
    navigate(path);
    handleClearSearch();
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl) && searchResults.length > 0;
  const id = open ? 'search-results-popper' : undefined;

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative' }}>
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
            value={searchTerm}
            onChange={handleSearchChange}
            endAdornment={
              searchTerm ? (
                <IconButton 
                  size="small" 
                  onClick={handleClearSearch}
                  sx={{ color: 'inherit' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              ) : null
            }
          />
        </Search>
        <Popper id={id} open={open} anchorEl={anchorEl} placement="bottom-start">
          <SearchResultsContainer>
            <List>
              {searchResults.length > 0 ? (
                <>
                  <ListItem>
                    <Typography variant="subtitle2" color="text.secondary">
                      Search Results ({searchResults.length})
                    </Typography>
                  </ListItem>
                  <Divider />
                  {searchResults.map((result) => (
                    <ListItem 
                      button 
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result.path)}
                    >
                      <ListItemIcon>
                        {result.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={result.title} 
                        secondary={`${result.type}: ${result.description}`} 
                      />
                    </ListItem>
                  ))}
                </>
              ) : (
                <ListItem>
                  <ListItemText primary="No results found" />
                </ListItem>
              )}
            </List>
          </SearchResultsContainer>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;
