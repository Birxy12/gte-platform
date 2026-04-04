import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import './ChatComponents.css';

/**
 * ChatWindow Component
 * @param {object} activeContact - Currently chat with user info
 * @param {Array} messages - List of messages
 * @param {string} currentUserId - The ID of the current user
 * @param {function} onSendMessage - Callback for sending messages
 * @param {function} onAttach - Callback for attachments
 * @param {function} onInfo - Action for info button
 * @param {function} onCall - Action for call button
 * @param {function} onVideo - Action for video button
 */
const ChatWindow = ({ 
  activeContact = {}, 
  messages = [], 
  currentUserId = '', 
  onSendMessage, 
  onAttach, 
  onInfo, 
  onCall,
  onVideo 
}) => {
  return (
    <main className="chat-window relative flex flex-col h-full bg-slate-900">
      <ChatHeader 
        contact={activeContact} 
        onInfo={onInfo} 
        onCall={onCall} 
        onVideo={onVideo} 
      />
      
      <MessageList 
        messages={messages} 
        currentUserId={currentUserId} 
      />
      
      <ChatInput 
        onSendMessage={onSendMessage} 
        onAttach={onAttach} 
      />
    </main>
  );
};

export default ChatWindow;
