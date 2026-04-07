import React, { useState, useEffect } from 'react';
import { Search, X, Camera, Plus, MoreVertical, Archive, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../../context/AuthProvider';
import Avatar from './Avatar';

const filters = ['All', 'Unread', 'Favourites', 'Groups'];

const formatChatTime = (ts) => {
  if (!ts) return '';
  const date = typeof ts?.toDate === 'function' ? ts.toDate() : new Date(ts);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd/MM/yy');
};

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
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const timeout = setTimeout(() => setSearchTerm(localSearch), 300);
    return () => clearTimeout(timeout);
  }, [localSearch, setSearchTerm]);

  // Filter logic
  const filteredChats = hydratedChats.filter(chat => {
    const name = (chat.groupName || chat.displayName || '').toLowerCase();
    const matchSearch = name.includes(localSearch.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilter === 'Groups') return chat.type === 'group';
    if (activeFilter === 'Unread') return (chat.unreadCount || 0) > 0;
    return true;
  });

  const unreadCount = hydratedChats.filter(c => (c.unreadCount || 0) > 0).length;
  const groupCount = hydratedChats.filter(c => c.type === 'group').length;

  return (
    <div
      className={`messenger-sidebar flex flex-col bg-[#111b21] border-r border-[#2a3942] ${selectedChat ? 'hidden md:flex' : 'flex'}`}
      style={{ width: '380px', minWidth: '320px', maxWidth: '100vw', height: '100%', flexShrink: 0 }}
    >
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#202c33] border-b border-white/5">
        <button onClick={() => {}} className="p-1 rounded-lg hover:bg-white/5 transition-all active:scale-95">
          <Avatar
            src={user?.photoURL || '/GlobixTech-logo.png'}
            name={user?.displayName || 'Me'}
            size="mini"
          />
        </button>
        <h1 className="text-[17px] font-semibold text-white">Chats</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => {}} className="p-2 rounded-full hover:bg-white/10 transition-colors text-[#aebac1]">
            <Camera size={20} />
          </button>
          <button onClick={onShowNewChat} className="p-2 rounded-full bg-[#00a884] hover:bg-[#008f72] transition-colors text-white">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="px-3 py-2 bg-[#111b21]">
        <div className="flex items-center gap-2 bg-[#202c33] rounded-full px-4 py-2">
          <Search size={16} className="text-[#aebac1] shrink-0" />
          <input
            type="text"
            placeholder="Ask Meta AI or Search"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-[#aebac1] outline-none"
          />
          {localSearch && (
            <button onClick={() => setLocalSearch('')}>
              <X size={16} className="text-[#aebac1] hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Pills ── */}
      <div className="flex gap-2 px-3 pb-2 overflow-x-auto no-scrollbar">
        {filters.map(f => {
          const count = f === 'Unread' ? unreadCount : f === 'Groups' ? groupCount : null;
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#00a884] text-white'
                  : 'bg-[#202c33] text-[#aebac1] hover:bg-[#2a3942]'
              }`}
            >
              {f}
              {count != null && count > 0 && (
                <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${isActive ? 'bg-white/20' : 'bg-[#3a4a52]'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Chat List ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* Archived row */}
        <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#182229] transition-colors border-b border-[#2a3942]">
          <div className="w-12 h-12 rounded-full bg-[#2a3942] flex items-center justify-center shrink-0">
            <Archive size={22} className="text-[#00a884]" />
          </div>
          <span className="text-[#00a884] font-semibold text-sm">Archived</span>
          <span className="ml-auto text-[#aebac1] text-sm">10</span>
        </button>

        <AnimatePresence>
          {filteredChats.map((chat) => {
            const name = chat.groupName || chat.displayName || 'Direct Chat';
            const preview = chat.lastMessage || 'No messages yet';
            const unread = chat.unreadCount || 0;
            const isGroup = chat.type === 'group';
            const isActive = selectedChat?.id === chat.id;

            return (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                onClick={() => onSelectChat(chat)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                  isActive ? 'bg-[#2a3942]' : 'hover:bg-[#182229]'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {isGroup ? (
                    <div className="w-8 h-8 rounded-full bg-[#2a3942] flex items-center justify-center">
                      <Users size={16} className="text-[#aebac1]" />
                    </div>
                  ) : (
                    <Avatar
                      src={chat.photoURL}
                      name={name}
                      size="small"
                    />
                  )}
                  {/* Online dot */}
                  {chat.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#111b21]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 border-b border-[#2a3942] py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-[15px] truncate max-w-[240px]">{name}</span>
                    {unread > 0 && (
                      <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-[#00a884] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#202c33] flex items-center justify-center">
              <Search size={28} className="text-[#aebac1]" />
            </div>
            <p className="text-[#aebac1] text-sm">No chats found</p>
            <button
              onClick={onShowNewChat}
              className="px-6 py-2.5 bg-[#00a884] hover:bg-[#008f72] text-white text-sm font-bold rounded-full transition-colors"
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