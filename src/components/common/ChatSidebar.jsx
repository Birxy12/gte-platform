import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Users, MessageSquarePlus, Sparkles, Pin, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../../context/AuthProvider';
import Avatar from './Avatar';

const filters = ['All', 'Direct', 'Squads', 'Unread'];

const formatChatTime = (ts) => {
  if (!ts) return '';
  const date = typeof ts?.toDate === 'function' ? ts.toDate() : new Date(ts);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
};

const ChatSidebar = ({
  selectedChat,
  onSelectChat,
  onShowNewChat,
  onShowNewGroup,
  searchTerm,
  setSearchTerm,
  hydratedChats
}) => {
  const { user } = useAuth();
  const [localSearch, setLocalSearch] = useState(searchTerm || '');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const timeout = setTimeout(() => setSearchTerm(localSearch), 250);
    return () => clearTimeout(timeout);
  }, [localSearch, setSearchTerm]);

  // Filter logic
  const filteredChats = hydratedChats.filter(chat => {
    const name = (chat.groupName || chat.displayName || '').toLowerCase();
    const matchSearch = name.includes(localSearch.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilter === 'Squads') return chat.type === 'group';
    if (activeFilter === 'Direct') return chat.type === 'direct';
    if (activeFilter === 'Unread') return (chat.unreadCount || 0) > 0;
    return true;
  });

  const unreadCount = hydratedChats.filter(c => (c.unreadCount || 0) > 0).length;
  const groupCount = hydratedChats.filter(c => c.type === 'group').length;
  const directCount = hydratedChats.filter(c => c.type === 'direct').length;

  return (
    <div
      className={`messenger-sidebar flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}
      style={{ width: '380px', minWidth: '320px', maxWidth: '100vw', height: '100%', flexShrink: 0 }}
    >
      {/* ── Stitch Top Bar ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-slate-950/40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar
              src={user?.photoURL || '/GlobixTech-logo.png'}
              name={user?.displayName || 'Me'}
              size="small"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-white tracking-tight">Comms Hub</h1>
              <Sparkles size={13} className="text-blue-400" />
            </div>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {onShowNewGroup && (
            <button
              onClick={onShowNewGroup}
              title="Create Squad Channel"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            >
              <Users size={18} />
            </button>
          )}
          <button
            onClick={onShowNewChat}
            title="New Direct Message"
            className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* ── Stitch Search Capsule ── */}
      <div className="px-4 py-3 bg-slate-950/20">
        <div className="flex items-center gap-2.5 bg-slate-900/80 border border-white/5 rounded-2xl px-3.5 py-2 focus-within:border-blue-500/50 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search operatives & channels..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="flex-1 bg-transparent text-white text-xs placeholder:text-slate-500 outline-none"
          />
          {localSearch && (
            <button onClick={() => setLocalSearch('')} className="text-slate-400 hover:text-white p-0.5">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Stitch Filter Chips ── */}
      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
        {filters.map(f => {
          const count = f === 'Unread' ? unreadCount : f === 'Squads' ? groupCount : f === 'Direct' ? directCount : null;
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-white/5'
              }`}
            >
              {f}
              {count != null && count > 0 && (
                <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.2 ${isActive ? 'bg-white/25 text-white' : 'bg-slate-800 text-slate-300'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Chat List ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1">
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
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                onClick={() => onSelectChat(chat)}
                className={`chat-item w-full flex items-center gap-3.5 text-left ${
                  isActive ? 'active' : ''
                }`}
              >
                {/* Avatar with Presence Ring */}
                <div className="relative shrink-0">
                  {isGroup ? (
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-950 to-blue-900 border border-indigo-500/30 flex items-center justify-center shadow-md">
                      <Users size={20} className="text-indigo-300" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 relative">
                      <Avatar
                        src={chat.photoURL}
                        name={name}
                        size="chat"
                      />
                    </div>
                  )}
                  {chat.isOnline && !isGroup && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-900 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  )}
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`font-semibold text-[13.5px] truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                        {name}
                      </span>
                      {isGroup && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                          SQUAD
                        </span>
                      )}
                    </div>
                    <span className="text-[10.5px] font-medium text-slate-400 shrink-0 ml-2">
                      {formatChatTime(chat.lastMessageAt || chat.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className={`text-xs truncate max-w-[200px] ${unread > 0 ? 'text-white font-medium' : 'text-slate-400'}`}>
                      {preview}
                    </p>
                    {unread > 0 && (
                      <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10.5px] font-bold rounded-full flex items-center justify-center shadow-md shadow-blue-600/30">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center shadow-xl">
              <MessageSquarePlus size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">No conversations</p>
              <p className="text-slate-400 text-xs mt-0.5">Start communicating with operatives</p>
            </div>
            <button
              onClick={onShowNewChat}
              className="mt-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all"
            >
              Start New Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;