import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthProvider';

const ChatWindow = ({ 
  chat, 
  onBack, 
  wallpaper, 
  isAdmin,
  onlineUsers,
  onShowUserInfo
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [userStatuses, setUserStatuses] = useState({});
  const [isSearchingMessages, setIsSearchingMessages] = useState(false);
  const [msgSearchTerm, setMsgSearchTerm] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (!chat?.id) return;

    const unsubMessages = chatService.subscribeToMessages(chat.id, (msgs) => {
      setMessages(msgs);
      msgs.forEach(msg => {
        if (msg.senderId !== user?.uid && !msg.isRead) {
          chatService.markAsRead(chat.id, msg.id);
        }
      });
    });

    const unsubStatuses = chatService.subscribeToStatuses(chat.id, (statuses) => {
      setUserStatuses(statuses);
    });

    chatService.markAllAsRead(chat.id, user?.uid);

    return () => {
      unsubMessages();
      unsubStatuses();
    };
  }, [chat?.id, user]);

  const handleSendMessage = async (text, file = null) => {
    if (!chat?.id) return;
    
    try {
      if (editingMessageId) {
        await chatService.editMessage(chat.id, editingMessageId, text);
        setEditingMessageId(null);
        setEditingText("");
      } else {
        await chatService.sendMessage(chat.id, user.uid, text, file ? 'image' : 'text', file);
      }
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  const handleTyping = (status) => {
    if (!chat?.id) return;
    chatService.setStatus(chat.id, user.uid, status);
  };

  const handleEditMessage = (msg) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.text);
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await chatService.deleteMessage(chat.id, msgId);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Clear all messages?")) return;
    try {
      await chatService.clearChatMessages(chat.id);
      setMessages([]);
    } catch (error) {
      console.error('Clear error:', error);
    }
  };

  const handleBlockUser = async () => {
    if (!chat?.otherUser) return;
    if (!window.confirm(`Block ${chat.displayName}?`)) return;
    try {
      await chatService.blockUser(user.uid, chat.otherUser.uid || chat.otherUser.id);
      onBack();
    } catch (error) {
      console.error('Block error:', error);
    }
  };

  if (!chat) {
    return (
      <div className={`messenger-main flex-1 hidden md:flex flex-col items-center justify-center bg-[#202c33] ${wallpaper}`}>
        <div className="w-24 h-24 bg-[#2a3942] rounded-full flex items-center justify-center mb-6">
          <MessageCircle size={48} className="text-msger-text-dim" />
        </div>
        <h2 className="text-2xl font-light text-white">BirxyChat</h2>
        <p className="text-msger-text-dim mt-2 max-w-sm text-center">
          Modern, end-to-end encrypted messaging for the GTE Platform.
        </p>
        <div className="mt-auto py-8 text-msger-text-dim text-xs flex items-center gap-2">
          🔒 Powered by Birxy Premium
        </div>
      </div>
    );
  }

  return (
    <div className={`messenger-main flex-1 flex flex-col ${wallpaper}`}>
      <ChatHeader 
        chat={{...chat, currentUserId: user?.uid}}
        onBack={onBack}
        onSearchMessages={() => setIsSearchingMessages(!isSearchingMessages)}
        isSearchingMessages={isSearchingMessages}
        onShowUserInfo={onShowUserInfo}
        onShowOptions={setShowOptions}
        showOptions={showOptions}
        userStatuses={userStatuses}
        onlineUsers={onlineUsers}
        onWallpaperChange={() => {}}
        onClearChat={handleClearChat}
        onBlockUser={handleBlockUser}
      />

      {isSearchingMessages && (
        <div className="px-6 py-3 bg-[#202c33] border-b border-[#2a3942] flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <input 
            type="text" 
            placeholder="Search messages..."
            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-msger-text-dim"
            value={msgSearchTerm}
            onChange={(e) => setMsgSearchTerm(e.target.value)}
            autoFocus
          />
          <button 
            onClick={() => { setIsSearchingMessages(false); setMsgSearchTerm(""); }}
            className="text-msger-text-dim hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      <MessageList 
        messages={messages}
        isAdmin={isAdmin}
        currentUserId={user?.uid}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        searchTerm={msgSearchTerm}
        userStatuses={userStatuses}
      />

      <ChatInput 
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        editingMessageId={editingMessageId}
        editingText={editingText}
        onCancelEdit={() => { setEditingMessageId(null); setEditingText(""); }}
        chatId={chat.id}
      />
    </div>
  );
};

export default ChatWindow;