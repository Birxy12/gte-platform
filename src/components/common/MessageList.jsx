import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';

const MessageList = ({ 
  messages, 
  isAdmin, 
  currentUserId,
  onEditMessage, 
  onDeleteMessage,
  onReplyMessage,
  onAddReaction,
  searchTerm,
  userStatuses
}) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [activeContextMenu, setActiveContextMenu] = React.useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, userStatuses]);

  const groupedMessages = useMemo(() => {
    const groups = {};
    messages.forEach(msg => {
      const date = msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp || Date.now());
      const dateKey = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });
    return groups;
  }, [messages]);

  const handleContextMenu = (e, msgId) => {
    e.preventDefault();
    setActiveContextMenu(activeContextMenu === msgId ? null : msgId);
  };

  const isSomeoneTyping = Object.entries(userStatuses || {}).some(([uid, status]) => 
    uid !== currentUserId && (status === 'typing' || status === 'recording')
  );

  return (
    <div 
      className="messages-container flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar"
      ref={containerRef}
      onClick={() => setActiveContextMenu(null)}
    >
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-center shadow-xl">
            <Sparkles size={24} className="text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-300">Secure Mission Channel Established</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">Transmissions are end-to-end encrypted across the enterprise network.</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <motion.div 
            key={date} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="message-group mb-5"
          >
            {/* Stitch Date Divider Pill */}
            <div className="flex justify-center my-4">
              <span className="text-[11px] font-bold text-slate-400 bg-slate-900/70 border border-white/5 px-4 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-md">
                {date}
              </span>
            </div>
            
            {dateMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMe={message.senderId === currentUserId}
                isAdmin={isAdmin}
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
                onReply={onReplyMessage}
                onAddReaction={onAddReaction}
                searchTerm={searchTerm}
                onContextMenu={handleContextMenu}
                isContextMenuActive={activeContextMenu === message.id}
              />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Typing Indicator with wave dots */}
      {isSomeoneTyping && (
        <div className="flex items-center gap-2 px-4 mb-2">
          <div className="typing-wave">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
          <span className="text-xs text-slate-400 italic">Operative is typing...</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;