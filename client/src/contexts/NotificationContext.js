import React, { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'info', // 'success', 'info', 'warning', 'error'
    duration: 6000
  });

  const showNotification = useCallback((message, type = 'info', duration = 6000) => {
    setNotification({
      open: true,
      message,
      type,
      duration
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notification,
        showNotification,
        hideNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
