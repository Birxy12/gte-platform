import React, { useState } from 'react';
import { Send, Image, Smile, Mic } from 'lucide-react';
import './ChatComponents.css';

/**
 * ChatInput Component
 * @param {function} onSendMessage - Callback for sending messages
 * @param {function} onAttach - Callback for attachments
 */
const ChatInput = ({ onSendMessage, onAttach }) => {
  const [message, setMessage] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e);
    }
  };

  return (
    <div className="chat-input-area">
      <div className="input-extras flex items-center gap-2 pr-2 border-r border-white/5 mr-2">
        <button onClick={onAttach} className="p-2 text-slate-400 hover:text-white transition-all"><Image size={20} /></button>
        <button className="p-2 text-slate-400 hover:text-white transition-all"><Smile size={20} /></button>
        <button className="p-2 text-slate-400 hover:text-white transition-all"><Mic size={20} /></button>
      </div>

      <input 
        type="text" 
        className="chat-input-field" 
        placeholder="Type to transmit intel..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button 
        onClick={handleSend}
        disabled={!message.trim()}
        className={`p-3 rounded-full flex items-center justify-center transition-all ${!message.trim() ? 'bg-slate-800 text-slate-600' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'}`}
      >
        <Send size={20} />
      </button>
    </div>
  );
};

export default ChatInput;
