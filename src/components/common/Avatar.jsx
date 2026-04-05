import React from 'react';
import { Users } from 'lucide-react';

const Avatar = ({ src, name, size = 'medium', isOnline = false, className = '' }) => {
  const initial = name?.charAt(0).toUpperCase() || '?';
  const isGroup = name?.toLowerCase().includes('group') || !name; // Heuristic for group icons
  
  const sizeClasses = {
    small: 'w-8 h-8 text-[10px]',
    medium: 'w-10 h-10 text-xs',
    large: 'w-14 h-14 text-lg'
  };

  return (
    <div className={`avatar-container relative rounded-full overflow-visible ${sizeClasses[size]} ${className}`}>
      <div className="avatar-wrapper w-full h-full rounded-full overflow-hidden border border-white/10 bg-[#2a3942] flex items-center justify-center">
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-msger-primary-gradient text-white font-bold">
            {isGroup ? <Users size={size === 'small' ? 14 : 18} /> : initial}
          </div>
        )}
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] border-2 border-[#111b21] rounded-full z-10" />
      )}
    </div>
  );
};

export default Avatar;