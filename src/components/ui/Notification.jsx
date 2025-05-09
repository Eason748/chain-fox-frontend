import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Global notification system
 */
const notificationSystem = {
  notifications: [],
  listeners: [],

  // Add a notification
  add(notification) {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type: notification.type || 'info',
      message: notification.message,
      duration: notification.duration || 5000,
      timestamp: Date.now()
    };

    this.notifications.push(newNotification);
    this.notifyListeners();

    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newNotification.duration);
    }

    return id;
  },

  // Remove a notification by ID
  remove(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
    }
  },

  // Add a listener
  addListener(listener) {
    this.listeners.push(listener);
    // Immediately notify with current state
    listener([...this.notifications]);
  },

  // Remove a listener
  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  },

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(listener => {
      listener([...this.notifications]);
    });
  }
};

// Helper functions to add different types of notifications
const notify = {
  info: (message, duration = 5000) => notificationSystem.add({ type: 'info', message, duration }),
  success: (message, duration = 5000) => notificationSystem.add({ type: 'success', message, duration }),
  warning: (message, duration = 5000) => notificationSystem.add({ type: 'warning', message, duration }),
  error: (message, duration = 5000) => notificationSystem.add({ type: 'error', message, duration })
};

/**
 * NotificationContainer component - Displays notifications
 */
const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Add listener for notifications
    notificationSystem.addListener(setNotifications);

    // Clean up
    return () => {
      notificationSystem.removeListener(setNotifications);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            id={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={() => notificationSystem.remove(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Individual Notification component
 */
const Notification = ({ id, type, message, onClose }) => {
  // Styles based on notification type
  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/90 border-green-400';
      case 'error':
        return 'bg-red-500/90 border-red-400';
      case 'warning':
        return 'bg-yellow-500/90 border-yellow-400';
      case 'info':
      default:
        return 'bg-blue-500/90 border-blue-400';
    }
  };

  // Icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`${getStyles()} backdrop-blur-md text-white p-4 rounded-lg shadow-lg border flex items-start`}
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-1 mr-2">
        <div className="text-sm">{message}</div>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

// Only export NotificationContainer as default
// and keep notify as a named export
export { notify };
export default NotificationContainer;
