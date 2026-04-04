import React from 'react';
import Avatar from './Avatar';
import { Phone, Video, Info, MoreVertical } from 'lucide-react';
import './ChatComponents.css';

/**
 * ChatHeader Component
 * @param {object} contact - Active user info
 * @param {function} onInfo - Action for info button
 * @param {function} onCall - Action for call button
 */
const ChatHeader = ({ contact = {}, onInfo, onCall, onVideo }) => {
  return (
    <header className="chat-header">
      <div className="contact-info flex items-center gap-3">
        <Avatar 
          src={contact.photoURL} 
          name={contact.displayName} 
          status={contact.status} 
        />
        <div className="flex flex-col">
          <h3 className="font-bold text-white text-sm">@{contact.displayName || 'Unnamed User'}</h3>
          <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">
            {contact.status === 'online' ? 'Active Intel' : 'Standby Mode'}
          </span>
        </div>
      </div>

      <div className="chat-actions flex items-center gap-4 text-slate-400">
        <button onClick={onCall} className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-all"><Phone size={18} /></button>
        <button onClick={onVideo} className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-all"><Video size={18} /></button>
        <button onClick={onInfo} className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-all"><Info size={18} /></button>
        <button className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-all"><MoreVertical size={18} /></button>
      </div>
    </header>
  );
};

export default ChatHeader;
