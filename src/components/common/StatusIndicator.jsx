import React from 'react';

const StatusIndicator = ({ status, userName }) => {
  if (!status || status === 'none') return null;

  const statusText = {
    typing: `${userName} is typing...`,
    recording: `${userName} is recording...`,
    online: 'online'
  };

  return (
    <div className="status-indicator">
      {status === 'typing' && (
        <span className="typing-animation">
          <span></span><span></span><span></span>
        </span>
      )}
      <span className="status-text">{statusText[status]}</span>
    </div>
  );
};

export default StatusIndicator;