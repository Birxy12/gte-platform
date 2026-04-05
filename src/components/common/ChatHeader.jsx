import React from 'react';
import { ArrowLeft, Search, Video, Phone, MoreVertical } from 'lucide-react';
import Avatar from './Avatar';
import StatusIndicator from './StatusIndicator';

const ChatHeader = ({ 
  chat, 
  onBack, 
  onSearchMessages, 
  isSearchingMessages,
  onShowUserInfo,
  onShowOptions,
  showOptions,
  userStatuses,
  onlineUsers,
  onWallpaperChange,
  onClearChat,
  onBlockUser
}) => {
  if (!chat) {
    return (
      <div className="chat-header empty bg-msger-header h-[60px] flex items-center justify-center border-l border-msger-border">
        <h3 className="text-msger-text-dim">Select a chat to start messaging</h3>
      </div>
    );
  }

  const otherUser = chat.type === 'direct' ? chat.otherUser : null;
  const otherUserId = otherUser?.uid || otherUser?.id;
  const isOnline = otherUserId ? onlineUsers[otherUserId] : false;
  
  const getOtherUserStatus = () => {
    if (chat.type === 'group') return null;
    const status = Object.entries(userStatuses).find(([uid]) => uid !== chat.currentUserId);
    return status ? status[1] : isOnline ? 'online' : null;
  };

  const displayName = chat.groupName || chat.displayName || "Chat";
  const status = getOtherUserStatus();

  return (
    <div className="chat-header bg-msger-header h-[60px] flex items-center justify-between px-4 border-l border-msger-border">
      <div className="flex items-center gap-2">
        <button 
          className="md:hidden text-msger-text-dim p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors" 
          onClick={onBack}
        >
          <ArrowLeft size={24} />
        </button>
        
        <div 
          className="header-user cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors flex items-center gap-3" 
          onClick={onShowUserInfo}
        >
          <Avatar 
            src={chat.photoURL} 
            name={displayName} 
            size="small"
            isOnline={isOnline && chat.type === 'direct'}
            className="!w-10 !h-10 border-2 border-msger-primary"
          />
          <div className="flex-1">
            <h2 className="leading-tight font-semibold text-white text-base">
              {displayName}
            </h2>
            <StatusIndicator 
              status={status} 
              userName={chat.displayName?.split(' ')[0] || 'User'} 
            />
          </div>
        </div>
      </div>

      <div className="header-actions flex items-center gap-1">
        <button 
          className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isSearchingMessages ? 'text-msger-primary' : 'text-msger-text-dim'}`}
          onClick={onSearchMessages}
          title="Search messages"
        >
          <Search size={20} />
        </button>
        
        <button 
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-msger-text-dim"
          title="Video call"
        >
          <Video size={20} />
        </button>
        
        <button 
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-msger-text-dim"
          title="Voice call"
        >
          <Phone size={20} />
        </button>

        <div className="relative">
          <button 
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-msger-text-dim"
            onClick={(e) => { e.stopPropagation(); onShowOptions(!showOptions); }}
          >
            <MoreVertical size={20} />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-msger-header border border-msger-border rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div 
                onClick={(e) => { e.stopPropagation(); onShowUserInfo(); onShowOptions(false); }} 
                className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-white"
              >
                Contact Info
              </div>
              
              <div className="px-4 py-2 text-[10px] uppercase font-bold text-msger-text-dim border-y border-msger-border bg-black/20">
                Wallpapers
              </div>
              
              {['default', 'midnight', 'starry'].map((wp) => (
                <div 
                  key={wp}
                  className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-white flex items-center gap-2 capitalize"
                  onClick={(e) => { e.stopPropagation(); onWallpaperChange(`wp-${wp}`); onShowOptions(false); }}
                >
                  <div className={`w-3 h-3 rounded ${wp === 'default' ? 'bg-[#0b141a]' : wp === 'midnight' ? 'bg-black' : 'bg-blue-900'}`} />
                  {wp}
                </div>
              ))}
              
              <div className="border-t border-msger-border"></div>
              
              <div 
                onClick={(e) => { e.stopPropagation(); onClearChat(); onShowOptions(false); }} 
                className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-white"
              >
                Clear Chat
              </div>
              
              {!chat.groupName && (
                <div 
                  onClick={(e) => { e.stopPropagation(); onBlockUser(); onShowOptions(false); }} 
                  className="px-4 py-3 hover:bg-red-500/20 text-red-400 cursor-pointer text-sm"
                >
                  Block
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;