import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';

const MessageList = ({ 
  messages, 
  isAdmin, 
  currentUserId,
  onEditMessage, 
  onDeleteMessage,
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
      const date = msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp);
      const dateKey = date.toLocaleDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });
    return groups;
  }, [messages]);

  const handleContextMenu = (e, msgId) => {
    e.preventDefault();
    setActiveContextMenu(activeContextMenu === msgId ? null : msgId);
  };

  const isSomeoneTyping = Object.entries(userStatuses).some(([uid, status]) => 
    uid !== currentUserId && (status === 'typing' || status === 'recording')
  );

  return (
    <div 
      className="messages-container flex-1 overflow-y-auto p-5 custom-scrollbar bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-[#0b141a]"
      ref={containerRef}
      onClick={() => setActiveContextMenu(null)}
    >
      <AnimatePresence>
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <motion.div 
            key={date} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="message-group mb-4"
          >
            <div className="flex justify-center my-4">
              <span className="text-[11px] text-msger-text-dim bg-[#1e2a30] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {date === new Date().toLocaleDateString() ? 'Today' : date}
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
                searchTerm={searchTerm}
                onContextMenu={handleContextMenu}
                isContextMenuActive={activeContextMenu === message.id}
              />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>

      {isSomeoneTyping && (
        <div className="message-wrapper received mb-1">
          <div className="message-bubble received bg-[#202c33] flex items-center gap-1 py-3 px-4 rounded-lg rounded-tl-none max-w-[100px]">
            <div className="w-2 h-2 bg-msger-text-dim/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-msger-text-dim/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-msger-text-dim/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;