import React from 'react';
import './ChatComponents.css';

/**
 * StatusIndicator Component
 * @param {string} status - 'online', 'offline', 'busy', 'away'
 * @param {string} className - Optional additional classes
 */
const StatusIndicator = ({ status = 'offline', className = '' }) => {
  return (
    <div 
      className={`chat-status-indicator chat-status-${status} ${className}`}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
    />
  );
};

export default StatusIndicator;
