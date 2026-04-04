import React, { useState } from 'react';
import Avatar from './Avatar';
import { Search, Plus } from 'lucide-react';
import './ChatComponents.css';

/**
 * ChatSidebar Component
 * @param {Array} conversations - List of active chats
 * @param {string} activeConversationId - The current ID
 * @param {function} onSelect - Select conversation
 * @param {function} onNewChat - Create new chat
 */
const ChatSidebar = ({ conversations = [], activeConversationId = '', onSelect, onNewChat }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header p-4 border-b border-white/5 bg-slate-900/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold tracking-widest text-sm uppercase">Secure Channel</h2>
          <button 
            onClick={onNewChat}
            className="p-2 bg-orange-500 rounded-lg text-white hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/10"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="search-bar relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Identify contact..." 
            className="w-full bg-slate-800 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:border-orange-500/50 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="conversation-list overflow-y-auto no-scrollbar flex-1">
        {filteredConversations.length === 0 ? (
            <div className="p-10 text-center opacity-30 text-[10px] font-bold uppercase tracking-tighter">No tactical links found</div>
        ) : (
            filteredConversations.map(c => (
                <div 
                  key={c.id} 
                  className={`conversation-item ${activeConversationId === c.id ? 'active' : ''}`}
                  onClick={() => onSelect(c.id)}
                >
                  <Avatar src={c.photoURL} name={c.name} status={c.status} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-white truncate">@{c.name}</span>
                      <span className="text-[10px] opacity-40">{c.lastMessageDate}</span>
                    </div>
                    <p className="text-xs opacity-50 truncate transition-all group-hover:opacity-100">{c.lastMessage}</p>
                  </div>
                  {c.unreadCount > 0 && (
                    <div className="unread-badge w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </div>
              ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
