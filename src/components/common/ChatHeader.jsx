import React from 'react';
import { ArrowLeft, Search, Video, Phone, MoreVertical, Shield, Image, Sparkles, UserCheck, X } from 'lucide-react';
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
      <div className="h-[70px] flex items-center justify-center bg-slate-950/40 border-b border-white/5 backdrop-blur-xl">
        <h3 className="text-slate-400 text-sm font-medium">Select a conversation to start messaging</h3>
      </div>
    );
  }

  const otherUser = chat.type === 'direct' ? chat.otherUser : null;
  const otherUserId = otherUser?.uid || otherUser?.id;
  const isOnline = otherUserId ? (onlineUsers[otherUserId] || chat.isOnline) : false;
  const isGroup = chat.type === 'group';
  
  const getOtherUserStatus = () => {
    if (isGroup) return `${chat.participants?.length || 2} operatives`;
    const status = Object.entries(userStatuses || {}).find(([uid]) => uid !== chat.currentUserId);
    return status ? status[1] : isOnline ? 'online' : null;
  };

  const displayName = chat.groupName || chat.displayName || "Operative Comms";
  const status = getOtherUserStatus();

  return (
    <div className="h-[72px] flex items-center justify-between px-6 bg-slate-950/60 border-b border-white/5 backdrop-blur-2xl shadow-lg relative z-30">
      {/* Operative Info */}
      <div className="flex items-center gap-3.5">
        <button 
          className="md:hidden text-slate-400 p-2 -ml-2 hover:bg-white/10 rounded-xl transition-colors" 
          onClick={onBack}
        >
          <ArrowLeft size={20} />
        </button>
        
        <div 
          className="cursor-pointer hover:bg-white/5 p-1.5 rounded-2xl transition-all flex items-center gap-3" 
          onClick={onShowUserInfo}
          title="View profile & media"
        >
          <div className="relative">
            <Avatar 
              src={chat.photoURL} 
              name={displayName} 
              size="chat"
            />
            {isOnline && !isGroup && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-900 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="leading-tight font-bold text-white text-base tracking-tight">
                {displayName}
              </h2>
              {isGroup ? (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.2 rounded border border-indigo-500/30">
                  SQUAD
                </span>
              ) : (
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.2 rounded border border-blue-500/30">
                  VERIFIED
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 mt-0.5">
              {isGroup ? (
                <span className="text-xs text-slate-400 font-medium">
                  {status}
                </span>
              ) : (
                <StatusIndicator 
                  status={status} 
                  userName={chat.displayName?.split(' ')[0] || 'Operative'} 
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-1">
        <button 
          className={`p-2.5 rounded-xl transition-all ${
            isSearchingMessages 
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.25)]' 
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
          onClick={onSearchMessages}
          title="Search conversation"
        >
          <Search size={19} />
        </button>
        
        <button 
          className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          onClick={() => alert(`Launching secure video channel with ${displayName}...`)}
          title="Start video meeting"
        >
          <Video size={19} />
        </button>
        
        <button 
          className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          onClick={() => alert(`Calling ${displayName}...`)}
          title="Voice frequency call"
        >
          <Phone size={19} />
        </button>

        {/* Options Dropdown */}
        <div className="relative">
          <button 
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            onClick={(e) => { e.stopPropagation(); onShowOptions(!showOptions); }}
            title="Channel options"
          >
            <MoreVertical size={19} />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 top-full mt-2.5 w-64 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 backdrop-blur-2xl divide-y divide-white/5">
              <div 
                onClick={(e) => { e.stopPropagation(); onShowUserInfo(); onShowOptions(false); }} 
                className="px-4 py-3 hover:bg-white/5 cursor-pointer text-xs font-semibold text-slate-200 flex items-center gap-3 transition-colors"
              >
                <UserCheck size={16} className="text-blue-400" />
                <span>Operative & Media Info</span>
              </div>
              
              <div className="px-4 py-2.5 bg-black/20">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Atmospheric Wallpaper
                </span>
                <div className="flex gap-2 mt-2">
                  {[
                    { id: 'default', label: 'Cyber', color: 'bg-slate-900 border-blue-500' },
                    { id: 'midnight', label: 'Midnight', color: 'bg-black border-slate-700' },
                    { id: 'starry', label: 'Nebula', color: 'bg-indigo-950 border-indigo-500' }
                  ].map((wp) => (
                    <button
                      key={wp.id}
                      onClick={(e) => { e.stopPropagation(); onWallpaperChange(`wp-${wp.id}`); onShowOptions(false); }}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all ${wp.color} text-slate-300 hover:text-white hover:scale-105`}
                    >
                      {wp.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div 
                onClick={(e) => { e.stopPropagation(); onClearChat(); onShowOptions(false); }} 
                className="px-4 py-3 hover:bg-white/5 cursor-pointer text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-2"
              >
                <span>Clear Mission Transcripts</span>
              </div>
              
              {!isGroup && (
                <div 
                  onClick={(e) => { e.stopPropagation(); onBlockUser(); onShowOptions(false); }} 
                  className="px-4 py-3 hover:bg-rose-500/10 text-rose-400 cursor-pointer text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  <Shield size={15} />
                  <span>Block Operative</span>
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