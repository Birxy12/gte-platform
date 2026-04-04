import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import './ChatComponents.css';

/**
 * MessageList Component
 * @param {Array} messages - List of message objects
 * @param {string} currentUserId - The ID of the current user
 */
const MessageList = ({ messages = [], currentUserId = '' }) => {
  const listEndRef = useRef(null);

  const scrollToBottom = () => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div className="empty-chat text-center opacity-40 italic mt-auto mb-auto">
          No tactical intel transmitted yet. Secure connection active.
        </div>
      ) : (
        messages.map((m, index) => (
          <MessageBubble 
            key={m.id || index}
            text={m.text}
            timestamp={m.timestamp}
            isOwn={m.senderId === currentUserId}
            status={m.status}
          />
        ))
      )}
      <div ref={listEndRef} />
    </div>
  );
};

export default MessageList;
