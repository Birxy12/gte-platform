import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowLeft, Check, Users, Search, Sparkles, Shield, User, Phone, Info, Image, Lock, ShieldAlert, LogOut, Settings, MessageSquarePlus } from 'lucide-react';
import { collection, getDocs, query, updateDoc, doc } from 'firebase/firestore';
import Avatar from '../common/Avatar';

import ChatSidebar from '../common/ChatSidebar';
import ChatWindow from '../common/ChatWindow';
import GroupCreationView from './GroupCreationView';
import { chatService } from '../../services/chatService';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthProvider';

const BirxyyChat = () => {
  const { user, isAdmin, role } = useAuth();
  
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [wallpaper, setWallpaper] = useState(localStorage.getItem("chatWallpaper") || "wp-default");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [error, setError] = useState(null);
  
  const [editPhone, setEditPhone] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPrivacy, setEditPrivacy] = useState(true);
  const [currentUserData, setCurrentUserData] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const unsub = chatService.subscribeToUserChats(
      user.uid,
      (updatedChats) => {
        setChats(updatedChats);
        setError(null);
      },
      (err) => {
        if (err.code === "permission-denied") {
          setError("Firebase Permission Issue: Rules sync required.");
        }
      }
    );
    
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        setUsers(list.filter(u => u.id !== user.uid));
        
        const me = list.find(u => u.id === user.uid);
        if (me) {
          setCurrentUserData(me);
          setEditPhone(me.phoneNumber || "");
          setEditBio(me.bio || "");
          setEditPrivacy(me.isPublic !== false);
        }
      } catch (err) {
        console.error("Error fetching operatives:", err);
      }
    };
    
    fetchUsers();
  }, [user]);

  const hydratedChats = useMemo(() => {
    return chats.map(chat => {
      if (chat.type === "direct") {
        const otherId = chat.participants?.find(p => p !== user?.uid);
        const other = users.find(u => u.uid === otherId || u.id === otherId);
        return {
          ...chat,
          displayName: other?.username || other?.displayName || "Operative",
          photoURL: other?.photoURL || null,
          otherUser: other || { uid: otherId, displayName: "Operative" }
        };
      }
      return chat;
    });
  }, [chats, users, user]);

  const startDirectChat = async (targetUser) => {
    try {
      const chatId = await chatService.getOrCreateDirectChat(user.uid, targetUser.uid || targetUser.id);
      const newChat = { 
        id: chatId, 
        ...targetUser, 
        type: "direct",
        displayName: targetUser.username || targetUser.displayName || "Operative",
        otherUser: targetUser
      };
      setActiveChat(newChat);
      setShowNewChat(false);
    } catch (err) {
      console.error("Start chat error:", err);
      setError("Failed to establish comms channel.");
    }
  };

  const handleCreateGroup = async (groupName, participantIds) => {
    try {
      const chatId = await chatService.createGroupChat(user.uid, participantIds, groupName);
      setActiveChat({ id: chatId, groupName, type: "group", participants: [user.uid, ...participantIds] });
      setShowNewChat(false);
      setShowNewGroup(false);
    } catch (err) {
      console.error("Create squad error:", err);
      setError("Failed to create squad channel.");
    }
  };

  const handleUpdateAccount = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        phoneNumber: editPhone,
        bio: editBio,
        isPublic: editPrivacy,
        updatedAt: new Date().toISOString()
      });
      alert("Operative profile updated successfully! ✅");
      setShowProfileSettings(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    }
  };

  const changeWallpaper = (style) => {
    setWallpaper(style);
    localStorage.setItem("chatWallpaper", style);
  };

  const handleLeaveGroup = async () => {
    if (!activeChat || !window.confirm("Leave this squad channel?")) return;
    try {
      await chatService.leaveGroup(activeChat.id, user.uid);
      setActiveChat(null);
      setShowUserInfo(false);
    } catch (err) {
      console.error(err);
      setError("Failed to leave group.");
    }
  };

  const handleSuspendUser = async (days) => {
    if (!activeChat?.otherUser || !isAdmin) return;
    try {
      await chatService.suspendUser(activeChat.otherUser.uid || activeChat.otherUser.id, days);
      alert(`Operative suspended for ${days} days.`);
      setShowUserInfo(false);
    } catch (err) {
      console.error(err);
      setError("Failed to suspend operative.");
    }
  };

  if (role === "suspended") {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-600/20 border border-rose-500/40 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
          <ShieldAlert size={40} className="text-rose-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">Enterprise Access Suspended</h2>
        <p className="text-slate-400 max-w-sm text-sm">
          Your credentials have been temporarily restricted by system administrators.
        </p>
        <button 
          className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:brightness-110 shadow-lg shadow-blue-600/30 transition-all"
          onClick={() => window.location.reload()}
        >
          Re-authenticate
        </button>
      </div>
    );
  }

  return (
    <div className="birxyychat-container flex h-screen w-full bg-slate-950 font-sans overflow-hidden">
      {/* ── Left Sidebar ── */}
      <ChatSidebar 
        selectedChat={activeChat}
        onSelectChat={setActiveChat}
        onShowNewChat={() => setShowNewChat(true)}
        onShowNewGroup={() => setShowNewGroup(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        hydratedChats={hydratedChats}
      />

      {/* ── Center Conversation Canvas ── */}
      <ChatWindow 
        chat={activeChat}
        onBack={() => setActiveChat(null)}
        wallpaper={wallpaper}
        onWallpaperChange={changeWallpaper}
        isAdmin={isAdmin}
        onlineUsers={{}}
        onShowUserInfo={() => activeChat && setShowUserInfo(true)}
      />

      {/* ── New Direct Chat Modal ── */}
      <AnimatePresence>
        {showNewChat && !showNewGroup && (
          <NewChatModal 
            users={users}
            contactSearchTerm={contactSearchTerm}
            setContactSearchTerm={setContactSearchTerm}
            onClose={() => setShowNewChat(false)}
            onStartDirectChat={startDirectChat}
            onOpenGroupCreator={() => setShowNewGroup(true)}
          />
        )}
      </AnimatePresence>

      {/* ── Squad Creation Wizard ── */}
      <AnimatePresence>
        {showNewGroup && (
          <GroupCreationView 
            onClose={() => setShowNewGroup(false)}
            onCreated={(newGroup) => {
              setActiveChat(newGroup);
              setShowNewGroup(false);
              setShowNewChat(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Right-hand Operative & Media Inspector Drawer ── */}
      <AnimatePresence>
        {showUserInfo && activeChat && (
          <UserInfoDrawer 
            activeChat={activeChat}
            isAdmin={isAdmin}
            onClose={() => setShowUserInfo(false)}
            onClearChat={async () => {
              await chatService.clearChatMessages(activeChat.id);
              setShowUserInfo(false);
            }}
            onBlockUser={async () => {
              await chatService.blockUser(user.uid, activeChat.otherUser.uid || activeChat.otherUser.id);
              setActiveChat(null);
              setShowUserInfo(false);
            }}
            onLeaveGroup={handleLeaveGroup}
            onSuspendUser={handleSuspendUser}
          />
        )}
      </AnimatePresence>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-rose-600/90 border border-rose-500 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl z-50 flex items-center gap-3">
          <span className="text-xs font-bold">{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-white/20 rounded-lg">✕</button>
        </div>
      )}
    </div>
  );
};

/* ── New Direct Chat Modal Component ── */
const NewChatModal = ({ 
  users, 
  contactSearchTerm, 
  setContactSearchTerm,
  onClose,
  onStartDirectChat,
  onOpenGroupCreator
}) => {
  const filteredUsers = users.filter(u => 
    (u.username || u.displayName || u.email || "").toLowerCase().includes(contactSearchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-slate-900 border border-white/10 w-full max-w-md h-[80vh] flex flex-col shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <MessageSquarePlus size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">New Transmission</h2>
              <p className="text-xs text-slate-400">Select an operative or squad channel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Create Squad trigger banner */}
        <div className="p-3 bg-slate-950/20">
          <button
            onClick={onOpenGroupCreator}
            className="w-full p-3 bg-gradient-to-r from-blue-600/15 to-indigo-600/15 hover:from-blue-600/25 hover:to-indigo-600/25 border border-blue-500/30 rounded-2xl flex items-center gap-3.5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-105 transition-transform">
              <Users size={20} />
            </div>
            <div>
              <span className="font-bold text-white text-xs block">Create Squad Channel</span>
              <span className="text-[10px] text-blue-300">Launch multi-user frequency channel</span>
            </div>
          </button>
        </div>

        <div className="px-4 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Enlisted Operatives ({filteredUsers.length})
        </div>

        <div className="px-4 pb-2">
          <div className="bg-slate-950/60 border border-white/5 flex items-center px-3.5 py-2.5 rounded-2xl focus-within:border-blue-500/50 transition-all">
            <Search size={16} className="text-slate-500 mr-2 shrink-0"/>
            <input 
              type="text" 
              placeholder="Filter operatives..." 
              className="bg-transparent border-none outline-none w-full text-xs text-white placeholder:text-slate-500"
              value={contactSearchTerm}
              onChange={(e) => setContactSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredUsers.map(u => (
            <div
              key={u.id}
              onClick={() => onStartDirectChat(u)}
              className="p-3 flex items-center gap-3.5 rounded-2xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5"
            >
              <Avatar 
                src={u.photoURL} 
                name={u.username || u.displayName} 
                size="chat"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white text-xs truncate">{u.username || u.displayName || "Operative"}</h4>
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-bold">READY</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{u.email || u.bio || "Available"}</p>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-500">No operatives found matching search.</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Operative & Media Inspector Drawer ── */
const UserInfoDrawer = ({ 
  activeChat, 
  isAdmin, 
  onClose, 
  onClearChat, 
  onBlockUser, 
  onLeaveGroup,
  onSuspendUser 
}) => {
  const isGroup = activeChat.type === "group";
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <motion.div 
      className="fixed inset-y-0 right-0 w-84 bg-slate-900/98 border-l border-white/10 z-50 shadow-2xl backdrop-blur-2xl flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="p-5 bg-slate-950/60 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Info size={18} className="text-blue-400" />
          <h3 className="font-bold text-white text-sm">Channel Dossier</h3>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
      </div>
      
      {/* Tabs Header */}
      <div className="flex border-b border-white/5 bg-slate-950/20 px-4 pt-2">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === "overview" ? "text-blue-400 border-blue-500" : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab("media")}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === "media" ? "text-blue-400 border-blue-500" : "text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          Transmissions
        </button>
      </div>

      <div className="p-5 overflow-y-auto h-full custom-scrollbar space-y-5">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center p-5 rounded-3xl bg-slate-950/60 border border-white/5 shadow-inner">
          <div className="relative mb-3">
            <Avatar 
              src={activeChat.photoURL} 
              name={activeChat.displayName || activeChat.groupName} 
              size="large" 
            />
            {activeChat.isOnline && !isGroup && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-3 ring-slate-950 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            )}
          </div>
          
          <h2 className="text-base font-extrabold text-white tracking-tight">
            {activeChat.displayName || activeChat.groupName}
          </h2>
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-1 bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded-full">
            {isGroup ? "Tactical Squad" : "Verified Operative"}
          </span>
          <p className="text-xs text-slate-400 mt-2">
            {activeChat.otherUser?.phoneNumber || activeChat.otherUser?.email || "Encrypted direct channel"}
          </p>
        </div>

        {activeTab === "overview" ? (
          <div className="space-y-3">
            {/* Bio / Description */}
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                Directive / Bio
              </label>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activeChat.otherUser?.bio || activeChat.description || "Active operative with full clearance."}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button 
                onClick={onClearChat}
                className="w-full py-3 px-4 text-left text-xs font-semibold text-slate-300 hover:text-white bg-slate-950/40 hover:bg-white/5 border border-white/5 rounded-2xl transition-all"
              >
                Clear Transmission History
              </button>

              {isGroup ? (
                <button 
                  onClick={onLeaveGroup}
                  className="w-full py-3 px-4 text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-2xl transition-all flex items-center justify-between"
                >
                  <span>Leave Squad Frequency</span>
                  <LogOut size={15} />
                </button>
              ) : (
                <button 
                  onClick={onBlockUser}
                  className="w-full py-3 px-4 text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-2xl transition-all flex items-center justify-between"
                >
                  <span>Block Operative Comms</span>
                  <Lock size={15} />
                </button>
              )}

              {/* Admin Actions */}
              {isAdmin && !isGroup && (
                <div className="mt-4 p-4 bg-rose-950/20 rounded-2xl border border-rose-500/30">
                  <h5 className="text-[10px] uppercase font-bold text-rose-400 mb-2 flex items-center gap-1.5">
                    <Shield size={12} />
                    <span>Command Override: Suspend Operative</span>
                  </h5>
                  <div className="flex gap-2">
                    {[1, 5, 7].map(days => (
                      <button 
                        key={days}
                        onClick={() => onSuspendUser(days)}
                        className="flex-1 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 rounded-xl text-xs font-bold border border-rose-500/30 transition-colors"
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 text-center">
              <Image size={24} className="text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-300">Shared Transmissions</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Images and attachments exchanged in this channel</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BirxyyChat;