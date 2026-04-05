import React, { useState } from 'react';
import { CheckCheck, Edit2, X } from 'lucide-react';
import { format } from 'date-fns';

const MessageBubble = ({ 
  message, 
  isMe, 
  isAdmin, 
  onEdit, 
  onDelete, 
  searchTerm,
  onContextMenu,
  isContextMenuActive
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isSystem = message.type === 'system';

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "HH:mm");
  };

  const highlightText = (text, term) => {
    if (!term || !text) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === term.toLowerCase() ? 
        <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">{part}</mark> : part
    );
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-[11px] text-msger-text-dim bg-msger-header/50 px-3 py-1 rounded-full">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`message-wrapper ${isMe ? 'sent' : 'received'} mb-1`}
      onContextMenu={(e) => onContextMenu(e, message.id)}
    >
      <div className={`message-bubble relative max-w-[65%] px-3 py-2 rounded-lg ${isMe ? 'bg-[#005c4b] rounded-tr-none' : 'bg-[#202c33] rounded-tl-none'}`}>
        {message.type === 'image' ? (
          <div className="message-image max-w-[300px] rounded-lg overflow-hidden my-1">
            {!imageLoaded && (
              <div className="w-48 h-32 bg-msger-header animate-pulse rounded-lg" />
            )}
            <img 
              src={message.fileUrl || message.text} 
              alt="Shared" 
              className={`w-full h-auto cursor-pointer hover:opacity-90 transition-all ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onClick={() => window.open(message.fileUrl || message.text, '_blank')}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        ) : (
          <p className="message-text text-sm leading-relaxed text-white">
            {highlightText(message.text, searchTerm)}
            {message.isEdited && (
              <span className="text-[10px] ml-1 opacity-50 italic">(edited)</span>
            )}
          </p>
        )}
        
        <div className="message-meta flex items-center justify-end gap-1 mt-1">
          <span className="message-time text-[11px] text-[#99beb7]">
            {formatTime(message.timestamp)}
          </span>
          {isMe && (
            <span className={`message-status ${message.isRead ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`}>
              <CheckCheck size={14} />
            </span>
          )}
        </div>

        {(isMe || isAdmin) && isContextMenuActive && (
          <div className="absolute -top-8 right-0 flex gap-1 bg-msger-secondary p-1.5 rounded-lg shadow-xl border border-msger-border animate-in fade-in zoom-in-95 z-10">
            {isMe && (
              <button 
                onClick={() => onEdit(message)}
                className="p-1.5 text-msger-text-dim hover:text-blue-400 hover:bg-white/5 rounded transition-colors"
                title="Edit"
              >
                <Edit2 size={14} />
              </button>
            )}
            <button 
              onClick={() => onDelete(message.id)}
              className="p-1.5 text-msger-text-dim hover:text-red-400 hover:bg-white/5 rounded transition-colors"
              title="Delete"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;