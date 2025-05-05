import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import authService from '../../services/authService';

const Profile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    bio: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        jobTitle: user.jobTitle || '',
        department: user.department || '',
        bio: user.bio || ''
      });
    }
  }, [user]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      // Reset form if canceling edit
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        jobTitle: user.jobTitle || '',
        department: user.department || '',
        bio: user.bio || ''
      });
    }
  };
  
  const validateProfileForm = () => {
    if (!profileData.firstName) return 'First name is required';
    if (!profileData.lastName) return 'Last name is required';
    if (!profileData.email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(profileData.email)) return 'Email is invalid';
    return '';
  };
  
  const validatePasswordForm = () => {
    if (!passwordData.currentPassword) return 'Current password is required';
    if (!passwordData.newPassword) return 'New password is required';
    if (passwordData.newPassword.length < 8) return 'Password must be at least 8 characters';
    if (!passwordData.confirmPassword) return 'Please confirm your new password';
    if (passwordData.newPassword !== passwordData.confirmPassword) return 'Passwords do not match';
    return '';
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateProfileForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await updateUserProfile(profileData);
      setSuccess('Profile updated successfully');
      showNotification('Profile updated successfully', 'success');
      setEditMode(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validatePasswordForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setSuccess('Password changed successfully');
      showNotification('Password changed successfully', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '3rem',
                mr: { xs: 0, sm: 3 },
                mb: { xs: 2, sm: 0 }
              }}
            >
              {user.firstName?.charAt(0) || user.email?.charAt(0) || <PersonIcon fontSize="large" />}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.jobTitle} {user.department ? `• ${user.department}` : ''}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ p: 0 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Profile Information" />
              <Tab label="Change Password" />
            </Tabs>
            
            {/* Profile Information Tab */}
            {tabValue === 0 && (
              <Box sx={{ p: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                    onClick={toggleEditMode}
                    color={editMode ? 'error' : 'primary'}
                    variant="outlined"
                  >
                    {editMode ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Box>
                
                <form onSubmit={handleProfileSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        disabled={!editMode || loading}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        disabled={!editMode || loading}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        disabled={!editMode || loading}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        disabled={!editMode || loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Job Title"
                        name="jobTitle"
                        value={profileData.jobTitle}
                        onChange={handleProfileChange}
                        disabled={!editMode || loading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Department"
                        name="department"
                        value={profileData.department}
                        onChange={handleProfileChange}
                        disabled={!editMode || loading}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        disabled={!editMode || loading}
                        multiline
                        rows={4}
                      />
                    </Grid>
                    
                    {editMode && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            disabled={loading}
                          >
                            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                          </Button>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </form>
              </Box>
            )}
            
            {/* Change Password Tab */}
            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
                
                <form onSubmit={handlePasswordSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={toggleShowPassword}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle new password visibility"
                                onClick={toggleShowNewPassword}
                                edge="end"
                              >
                                {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle confirm password visibility"
                                onClick={toggleShowConfirmPassword}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Change Password'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
