import React, { useState } from 'react';
import { CheckCheck, Check, Edit2, Trash2, Copy, CornerUpLeft, Image, Smile, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '😂', '😮', '🚀'];

const MessageBubble = ({ 
  message, 
  isMe, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onReply,
  searchTerm,
  onContextMenu,
  isContextMenuActive,
  onAddReaction
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showHoverReactions, setShowHoverReactions] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

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
        <mark key={i} className="bg-blue-500/40 text-blue-200 rounded px-1">{part}</mark> : part
    );
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 1500);
    }
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-900/80 border border-white/5 px-4 py-1 rounded-full shadow-md backdrop-blur-md">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`message-wrapper flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-2.5 px-4 relative group`}
      onMouseEnter={() => setShowHoverReactions(true)}
      onMouseLeave={() => setShowHoverReactions(false)}
      onContextMenu={(e) => onContextMenu(e, message.id)}
    >
      {/* ── Hover Quick Action & Reaction Bar ── */}
      <AnimatePresence>
        {showHoverReactions && (
          <motion.div 
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute -top-9 ${isMe ? 'right-6' : 'left-6'} bg-slate-900/95 border border-white/10 backdrop-blur-xl rounded-2xl px-2 py-1 shadow-2xl flex items-center gap-1 z-30`}
          >
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onAddReaction && onAddReaction(message.id, emoji)}
                className="hover:scale-130 hover:bg-white/10 p-1 rounded-lg text-sm transition-transform active:scale-95"
                title={`React ${emoji}`}
              >
                {emoji}
              </button>
            ))}

            <div className="w-[1px] h-3.5 bg-white/10 mx-1" />

            {onReply && (
              <button
                onClick={() => onReply(message)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Reply"
              >
                <CornerUpLeft size={13} />
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Copy text"
            >
              <Copy size={13} />
            </button>

            {isMe && onEdit && (
              <button
                onClick={() => onEdit(message)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Edit message"
              >
                <Edit2 size={13} />
              </button>
            )}

            {(isMe || isAdmin) && onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete message"
              >
                <Trash2 size={13} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Message Bubble ── */}
      <div 
        className={`message-bubble relative ${
          isMe ? 'sent' : 'received'
        }`}
      >
        {/* Reply Quote preview if attached */}
        {message.replyTo && (
          <div className="reply-quote bg-black/25 border-l-2 border-cyan-400 rounded-r-lg px-2.5 py-1 mb-1.5 text-xs text-slate-300">
            <span className="font-bold text-cyan-300 block text-[10.5px]">
              {message.replyTo.senderName || "Operative"}
            </span>
            <span className="truncate block opacity-85">{message.replyTo.text}</span>
          </div>
        )}

        {/* Media / Image Display */}
        {message.type === 'image' || message.fileUrl ? (
          <div className="message-image max-w-[320px] rounded-xl overflow-hidden my-1 cursor-pointer border border-white/10 relative group/img">
            {!imageLoaded && (
              <div className="w-56 h-36 bg-slate-800 animate-pulse rounded-xl flex items-center justify-center">
                <Image size={24} className="text-slate-600 animate-bounce" />
              </div>
            )}
            <img 
              src={message.fileUrl || message.text} 
              alt="Transmitted Media" 
              className={`w-full h-auto object-cover rounded-xl transition-all duration-300 group-hover/img:scale-102 ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
              onClick={() => setShowLightbox(true)}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        ) : (
          <div className="message-text text-[14px] leading-relaxed break-words font-normal">
            {highlightText(message.text, searchTerm)}
            {message.isEdited && (
              <span className="text-[10px] ml-1.5 opacity-60 italic font-medium">(edited)</span>
            )}
          </div>
        )}
        
        {/* Message Meta: Timestamp & Read Status */}
        <div className="message-meta flex items-center justify-end gap-1.5 mt-1 opacity-75">
          <span className="message-time text-[10px] font-medium tracking-tight">
            {formatTime(message.timestamp)}
          </span>
          {isMe && (
            <span className={`message-status ${message.isRead ? 'text-cyan-300' : 'text-slate-400'}`}>
              {message.isRead ? (
                <CheckCheck size={13} strokeWidth={2.5} />
              ) : (
                <Check size={13} strokeWidth={2.5} />
              )}
            </span>
          )}
        </div>

        {/* Attached Reactions List */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5 -mb-0.5">
            {Object.entries(message.reactions).map(([emoji, count]) => (
              <span key={emoji} className="reaction-badge">
                <span>{emoji}</span>
                <span>{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Copy Toast Notification */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-[10px] text-blue-400 font-bold bg-slate-900/90 border border-blue-500/30 px-2 py-0.5 rounded-full mt-1 shadow-lg"
          >
            Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal for Shared Images */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img 
              src={message.fileUrl || message.text} 
              alt="Fullscreen Media" 
              className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl border border-white/10 object-contain"
            />
            <span className="text-xs text-slate-400 mt-3 font-medium">Click anywhere to close</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;