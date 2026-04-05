import React from 'react';
import { Users } from 'lucide-react';

const Avatar = ({ src, name, size = 'medium', isOnline = false, className = '' }) => {
  const initial = name?.charAt(0).toUpperCase() || '?';
  const isGroup = name?.toLowerCase().includes('group') || !name; // Heuristic for group icons
  
  const sizeClasses = {
    small: 'w-8 h-8 text-[10px]',
    chat:  'w-10 h-10 text-sm',
    medium: 'w-12 h-12 text-sm',
    large: 'w-14 h-14 text-lg'
  };

  return (
    <div className={`avatar-container relative rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#2a3942]">
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover block" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-bold"
            style={{ background: 'linear-gradient(135deg, #00a884, #005c4b)' }}
          >
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