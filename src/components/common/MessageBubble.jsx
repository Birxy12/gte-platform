import React from 'react';
import './ChatComponents.css';

/**
 * MessageBubble Component
 * @param {string} text - Message content
 * @param {string} timestamp - Message sent time
 * @param {boolean} isOwn - If true, styles a sender bubble
 * @param {string} status - Read receipt status
 */
const MessageBubble = ({ text, timestamp, isOwn = false, status = 'sent' }) => {
  return (
    <div className={`message-bubble ${isOwn ? 'message-bubble-self' : 'message-bubble-other'}`}>
      <div className="message-text">{text}</div>
      <div className="message-meta flex items-center justify-end gap-1 opacity-60">
        <span className="message-time">{timestamp}</span>
        {isOwn && (
          <div className="status-indicator-mini text-[10px]">
             {status === 'read' ? '✓✓' : status === 'delivered' ? '✓' : '•'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
