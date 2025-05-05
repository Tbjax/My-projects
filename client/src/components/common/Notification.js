import React, { useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { NotificationContext } from '../../contexts/NotificationContext';

/**
 * Global notification component that displays messages to the user
 * Uses the NotificationContext to manage state
 * 
 * @returns {JSX.Element} - The notification component
 */
const Notification = () => {
  const { notification, hideNotification } = useContext(NotificationContext);
  const { open, message, type, duration } = notification;

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    hideNotification();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity={type}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
