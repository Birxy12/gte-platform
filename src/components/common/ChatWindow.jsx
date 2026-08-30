import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, ShieldCheck, Zap, Image, Video, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthProvider';

const ChatWindow = ({ 
  chat, 
  onBack, 
  wallpaper, 
  onWallpaperChange,
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
  const [replyingToMessage, setReplyingToMessage] = useState(null);
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

  const handleSendMessage = async (text, file = null, replyTo = null) => {
    if (!chat?.id) return;
    
    try {
      if (editingMessageId) {
        await chatService.editMessage(chat.id, editingMessageId, text);
        setEditingMessageId(null);
        setEditingText("");
      } else {
        await chatService.sendMessage(chat.id, user.uid, text, file ? 'image' : 'text', file);
      }
      setReplyingToMessage(null);
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

  const handleReplyMessage = (msg) => {
    setReplyingToMessage(msg);
  };

  const handleAddReaction = async (msgId, emoji) => {
    if (!chat?.id) return;
    await chatService.addReaction(chat.id, msgId, emoji);
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("Purge this transmission from records?")) return;
    try {
      await chatService.deleteMessage(chat.id, msgId);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Clear entire conversation history?")) return;
    try {
      await chatService.clearChatMessages(chat.id);
      setMessages([]);
    } catch (error) {
      console.error('Clear error:', error);
    }
  };

  const handleBlockUser = async () => {
    if (!chat?.otherUser) return;
    if (!window.confirm(`Block operative ${chat.displayName}?`)) return;
    try {
      await chatService.blockUser(user.uid, chat.otherUser.uid || chat.otherUser.id);
      onBack();
    } catch (error) {
      console.error('Block error:', error);
    }
  };

  // Empty State - No active conversation selected
  if (!chat) {
    return (
      <div className={`messenger-main flex-1 hidden md:flex flex-col items-center justify-center relative overflow-hidden ${wallpaper || 'wp-default'}`}>
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />

        <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-md">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl">
            <Sparkles size={44} className="text-blue-400 animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-black text-white tracking-tight">
            GlobixTech Enterprise Comms
          </h2>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Ultra-fast, encrypted messaging channels for tactical collaboration, squad debriefs, and direct operative comms.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-8 w-full">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center gap-3 backdrop-blur-md">
              <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Encrypted</span>
                <span className="text-[10px] text-slate-500">End-to-end security</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center gap-3 backdrop-blur-md">
              <Zap size={20} className="text-blue-400 shrink-0" />
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Low Latency</span>
                <span className="text-[10px] text-slate-500">Real-time sync</span>
              </div>
            </div>
          </div>

          <div className="mt-12 text-[11px] font-semibold text-slate-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            STITCH PROTOCOL V2.4 ACTIVE
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`messenger-main flex-1 flex flex-col relative overflow-hidden ${wallpaper || 'wp-default'}`}>
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
        onWallpaperChange={onWallpaperChange}
        onClearChat={handleClearChat}
        onBlockUser={handleBlockUser}
      />

      {/* Message Search Drawer */}
      <AnimatePresence>
        {isSearchingMessages && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-3 bg-slate-900/90 border-b border-white/10 flex items-center gap-3 backdrop-blur-xl z-20 overflow-hidden"
          >
            <input 
              type="text" 
              placeholder="Search in transmission transcript..."
              className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-slate-500 font-medium"
              value={msgSearchTerm}
              onChange={(e) => setMsgSearchTerm(e.target.value)}
              autoFocus
            />
            <button 
              onClick={() => { setIsSearchingMessages(false); setMsgSearchTerm(""); }}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Stream */}
      <MessageList 
        messages={messages}
        isAdmin={isAdmin}
        currentUserId={user?.uid}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onReplyMessage={handleReplyMessage}
        onAddReaction={handleAddReaction}
        searchTerm={msgSearchTerm}
        userStatuses={userStatuses}
      />

      {/* Input Bar */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        editingMessageId={editingMessageId}
        editingText={editingText}
        onCancelEdit={() => { setEditingMessageId(null); setEditingText(""); }}
        replyingToMessage={replyingToMessage}
        onCancelReply={() => setReplyingToMessage(null)}
        chatId={chat.id}
      />
    </div>
  );
};

export default ChatWindow;