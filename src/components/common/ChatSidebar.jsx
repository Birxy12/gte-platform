import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, MoreVertical, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthProvider';

const ChatSidebar = ({
  selectedChat,
  onSelectChat,
  onShowNewChat,
  searchTerm,
  setSearchTerm,
  hydratedChats
}) => {
  const { user } = useAuth();
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    const timeout = setTimeout(() => setSearchTerm(localSearch), 300);
    return () => clearTimeout(timeout);
  }, [localSearch, setSearchTerm]);

  const filteredChats = hydratedChats.filter(chat =>
    (chat.groupName || chat.displayName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`messenger-sidebar ${selectedChat ? 'hidden' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-top">
          <div className="flex items-center gap-3">
            <img
              src={user?.photoURL || "/GlobixTech-logo.png"}
              alt="User"
              className="sidebar-logo cursor-pointer w-10 h-10 rounded-full object-cover"
              onClick={() => { }}
            />
            <h1 className="text-xl font-bold text-white">BirxyChat</h1>
          </div>
          <div className="flex gap-4 text-msger-text-dim">
            <Users size={20} className="cursor-pointer hover:text-white transition-colors" onClick={onShowNewChat} />
            <MessageCircle size={20} className="cursor-pointer hover:text-white transition-colors" onClick={onShowNewChat} />
            <MoreVertical size={20} className="cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        <div className="sidebar-search">
          <div className="search-container relative">
            <Search size={18} className="search-icon absolute left-3 top-1/2 transform -translate-y-1/2 text-msger-text-dim" />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-transparent text-white placeholder:text-msger-text-dim outline-none"
            />
            {localSearch && (
              <X
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-msger-text-dim hover:text-white"
                onClick={() => setLocalSearch('')}
              />
            )}
          </div>
        </div>
      </div>

      <div className="chat-list overflow-y-auto custom-scrollbar">
        {filteredChats.map((chat) => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => onSelectChat(chat)}
            className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
          >
            <div className="chat-avatar">
              {chat.photoURL ? (
                <img src={chat.photoURL} alt="User" />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-msger-primary-gradient text-white text-lg">
                  {chat.groupName ? <Users size={24} /> : (chat.displayName || "U")[0]}
                </div>
              )}
            </div>
            <div className="chat-info">
              <div className="chat-info-top">
                <span className="chat-name block truncate text-white font-medium">
                  {chat.groupName || chat.displayName || "Direct Chat"}
                </span>
                <span className="chat-time text-xs text-msger-text-dim">
                  {chat.lastMessageAt && format(chat.lastMessageAt.toDate(), "HH:mm")}
                </span>
              </div>
              <div className="chat-preview truncate text-sm text-msger-text-dim">
                {chat.lastMessage || "No messages yet"}
              </div>
            </div>
          </motion.div>
        ))}

        {filteredChats.length === 0 && (
          <div className="p-8 text-center text-msger-text-dim">
            <p>No chats found</p>
            <button
              onClick={onShowNewChat}
              className="mt-4 text-msger-primary hover:underline"
            >
              Start a new chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;