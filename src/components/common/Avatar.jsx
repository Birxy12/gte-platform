import React from 'react';
import StatusIndicator from './StatusIndicator';
import './ChatComponents.css';

/**
 * Avatar Component
 * @param {string} src - Image source (optional)
 * @param {string} name - User's name for fallback initials
 * @param {string} status - User's online status
 * @param {number} size - Size in pixels
 * @param {boolean} showStatus - Whether to show the status indicator
 */
const Avatar = ({ src, name = 'U', status = 'offline', size = 40, showStatus = true }) => {
  const initials = name
    .split(' ')
    .map(n => n?.[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size * 0.4}px`
  };

  return (
    <div className="chat-avatar-wrapper" style={{ width: size, height: size }}>
      {src ? (
        <img 
          src={src} 
          alt={name} 
          className="chat-avatar" 
          style={avatarStyle}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      
      <div 
        className="chat-avatar initials-fallback" 
        style={{ ...avatarStyle, display: src ? 'none' : 'flex' }}
      >
        {initials}
      </div>

      {showStatus && <StatusIndicator status={status} />}
    </div>
  );
};

export default Avatar;
