import React from 'react';

const Avatar = ({ src, name, size = 'medium', isOnline = false, className = '' }) => {
  const initial = name?.charAt(0).toUpperCase() || '?';
  
  const sizeClasses = {
    small: 'w-10 h-10 text-sm',
    medium: 'w-12 h-12 text-base',
    large: 'w-16 h-16 text-xl'
  };

  return (
    <div className={`avatar-container ${sizeClasses[size]} ${className}`}>
      <div className="avatar-wrapper">
        {src ? (
          <img src={src} alt={name} className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">{initial}</div>
        )}
        {isOnline && <span className="online-indicator" />}
      </div>
    </div>
  );
};

export default Avatar;