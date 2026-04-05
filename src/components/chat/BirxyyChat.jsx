import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowLeft, Check, Users, Search } from 'lucide-react';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';

import ChatSidebar from '../common/ChatSidebar';
import ChatWindow from '../common/ChatWindow';
import { chatService } from '../../services/chatService';
import { presenceService } from '../../services/presenceService';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthProvider';

const BirxyyChat = () => {
  const { user, isAdmin, role } = useAuth();
  
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
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
        console.error("Error fetching users:", err);
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
          displayName: other?.username || other?.displayName || "Unknown",
          photoURL: other?.photoURL || null,
          otherUser: other || { uid: otherId }
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
        displayName: targetUser.username || targetUser.displayName,
        otherUser: targetUser
      };
      setActiveChat(newChat);
      setShowNewChat(false);
    } catch (err) {
      console.error("Start chat error:", err);
      setError("Failed to start chat.");
    }
  };

  const handleCreateGroup = async (groupName, participantIds) => {
    try {
      const chatId = await chatService.createGroupChat(user.uid, participantIds, groupName);
      setActiveChat({ id: chatId, groupName, type: "group" });
      setShowNewChat(false);
      setShowNewGroup(false);
    } catch (err) {
      console.error("Create group error:", err);
      setError("Failed to create group.");
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
      alert("Account updated! ✅");
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
    if (!activeChat || !window.confirm("Leave this group?")) return;
    try {
      await chatService.leaveGroup(activeChat.id, user.uid);
      setActiveChat(null);
      setShowUserInfo(false);
    } catch (err) {
      setError("Failed to leave group.");
    }
  };

  const handleSuspendUser = async (days) => {
    if (!activeChat?.otherUser || !isAdmin) return;
    try {
      await chatService.suspendUser(activeChat.otherUser.uid || activeChat.otherUser.id, days);
      alert(`User suspended for ${days} days.`);
      setShowUserInfo(false);
    } catch (err) {
      setError("Failed to suspend user.");
    }
  };

  if (role === "suspended") {
    return (
      <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
          <X size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">BirxyChat Access Suspended</h2>
        <p className="text-gray-400 max-w-sm">
          Your account has been temporarily restricted due to community guidelines violations.
        </p>
        <button 
          className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="birxyychat-container flex h-screen w-full bg-[#0b141a] font-sans overflow-hidden">
      <ChatSidebar 
        selectedChat={activeChat}
        onSelectChat={setActiveChat}
        onShowNewChat={() => setShowNewChat(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        hydratedChats={hydratedChats}
      />

      <ChatWindow 
        chat={activeChat}
        onBack={() => setActiveChat(null)}
        wallpaper={wallpaper}
        isAdmin={isAdmin}
        onlineUsers={onlineUsers}
        onShowUserInfo={() => activeChat && setShowUserInfo(true)}
      />

      <AnimatePresence>
        {showNewChat && (
          <NewChatModal 
            showNewGroup={showNewGroup}
            setShowNewGroup={setShowNewGroup}
            users={users}
            contactSearchTerm={contactSearchTerm}
            setContactSearchTerm={setContactSearchTerm}
            onClose={() => { setShowNewChat(false); setShowNewGroup(false); }}
            onStartDirectChat={startDirectChat}
            onCreateGroup={handleCreateGroup}
            currentUser={user}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfileSettings && (
          <SettingsDrawer 
            user={user}
            currentUserData={currentUserData}
            editPhone={editPhone}
            setEditPhone={setEditPhone}
            editBio={editBio}
            setEditBio={setEditBio}
            editPrivacy={editPrivacy}
            setEditPrivacy={setEditPrivacy}
            wallpaper={wallpaper}
            onWallpaperChange={changeWallpaper}
            onUpdate={handleUpdateAccount}
            onClose={() => setShowProfileSettings(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUserInfo && activeChat?.otherUser && (
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

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl z-50">
          {error}
          <button onClick={() => setError(null)} className="ml-4 font-bold">✕</button>
        </div>
      )}
    </div>
  );
};

const NewChatModal = ({ 
  showNewGroup, 
  setShowNewGroup, 
  users, 
  contactSearchTerm, 
  setContactSearchTerm,
  onClose,
  onStartDirectChat,
  onCreateGroup
}) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(u => 
    (u.username || u.displayName || u.email || "").toLowerCase().includes(contactSearchTerm.toLowerCase())
  );

  if (showNewGroup) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#233138] w-full max-w-md h-[80vh] flex flex-col border border-[#2a3942] shadow-2xl rounded-lg overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 bg-[#202c33] text-white flex items-center gap-4">
            <button onClick={() => setShowNewGroup(false)} className="hover:bg-white/10 p-1 rounded-full">
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-medium text-lg">New group</h2>
          </div>

          <div className="p-4">
            <input
              type="text"
              placeholder="Group subject"
              className="w-full bg-black/20 border border-[#2a3942] px-4 py-3 rounded-lg outline-none text-white placeholder:text-[#8696a0]"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="px-4 py-2 text-xs font-bold text-[#00a884] uppercase">
            Select Participants ({selectedUsers.length})
          </div>

          <div className="px-4 pb-2">
            <div className="bg-black/30 border border-[#2a3942] flex items-center px-3 py-2 rounded-lg">
              <Search size={16} className="text-[#8696a0] mr-2"/>
              <input 
                type="text" 
                placeholder="Search users..." 
                className="bg-transparent border-none outline-none w-full text-sm text-white"
                value={contactSearchTerm}
                onChange={(e) => setContactSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredUsers.map(u => (
              <div
                key={u.id}
                onClick={() => toggleUser(u.id)}
                className="px-4 py-3 flex items-center justify-between hover:bg-[#182229] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={u.photoURL || `https://ui-avatars.com/api/?name=${u.username || 'User'}`} 
                    alt="" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-white">{u.username || u.displayName || "User"}</h4>
                    <p className="text-xs text-[#8696a0]">{u.email}</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-all ${selectedUsers.includes(u.id) ? 'bg-[#00a884] border-[#00a884]' : 'border-[#8696a0]'}`}>
                  {selectedUsers.includes(u.id) && <Check size={14} className="text-white" />}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#202c33] border-t border-[#2a3942]">
            <button
              disabled={!groupName.trim() || selectedUsers.length === 0}
              onClick={() => onCreateGroup(groupName, selectedUsers)}
              className="w-full py-3 bg-[#00a884] text-white font-bold rounded-lg disabled:opacity-50 hover:bg-[#008f72] transition-colors"
            >
              Create Group
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#233138] w-full max-w-md h-[80vh] flex flex-col border border-[#2a3942] shadow-2xl rounded-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 bg-[#202c33] text-white flex items-center gap-4">
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full">
            <X size={20} />
          </button>
          <h2 className="font-medium text-lg">New chat</h2>
        </div>

        <div className="p-2">
          <button
            onClick={() => setShowNewGroup(true)}
            className="w-full p-3 hover:bg-[#182229] flex items-center gap-4 transition-all rounded-lg"
          >
            <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="font-medium text-white">New group</span>
          </button>
        </div>

        <div className="px-4 py-2 text-xs font-bold text-[#8696a0] uppercase">
          Contacts on BirxyChat
        </div>

        <div className="px-4 pb-2">
          <div className="bg-black/30 border border-[#2a3942] flex items-center px-3 py-2 rounded-lg">
            <Search size={16} className="text-[#8696a0] mr-2"/>
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="bg-transparent border-none outline-none w-full text-sm text-white"
              value={contactSearchTerm}
              onChange={(e) => setContactSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredUsers.map(u => (
            <div
              key={u.id}
              onClick={() => onStartDirectChat(u)}
              className="px-4 py-3 flex items-center gap-4 hover:bg-[#182229] cursor-pointer"
            >
              <img 
                src={u.photoURL || `https://ui-avatars.com/api/?name=${u.username || 'User'}`} 
                alt="" 
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 border-b border-[#2a3942] pb-3">
                <h4 className="font-medium text-white">{u.username || u.displayName || "User"}</h4>
                <p className="text-xs text-[#8696a0] truncate">{u.bio || "Available"}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const SettingsDrawer = ({ 
  user, 
  editPhone, 
  setEditPhone, 
  editBio, 
  setEditBio, 
  editPrivacy, 
  setEditPrivacy,
  wallpaper,
  onWallpaperChange,
  onUpdate,
  onClose 
}) => (
  <motion.div 
    className="fixed inset-y-0 left-0 w-80 bg-[#111b21] border-r border-[#2a3942] z-50 shadow-2xl"
    initial={{ x: "-100%" }}
    animate={{ x: 0 }}
    exit={{ x: "-100%" }}
  >
    <div className="p-4 bg-[#202c33] flex items-center gap-4 text-white">
      <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full">
        <ArrowLeft size={20} />
      </button>
      <h3 className="font-medium">Settings</h3>
    </div>
    
    <div className="p-4 overflow-y-auto h-full pb-20 custom-scrollbar">
      <div className="flex flex-col items-center mb-6">
        <img 
          src={user?.photoURL || "/GlobixTech-logo.png"} 
          alt="me" 
          className="w-24 h-24 rounded-full mb-2 object-cover"
        />
        <p className="text-sm text-[#8696a0]">{user?.email}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-[#8696a0] uppercase font-bold">Phone</label>
          <input 
            type="tel" 
            value={editPhone} 
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="+234..."
            className="w-full mt-1 bg-black/20 border border-[#2a3942] rounded p-2 text-white text-sm focus:border-[#00a884] outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-[#8696a0] uppercase font-bold">About</label>
          <textarea 
            value={editBio} 
            onChange={(e) => setEditBio(e.target.value)}
            placeholder="Hi! I'm using BirxyChat."
            className="w-full mt-1 bg-black/20 border border-[#2a3942] rounded p-2 text-white text-sm h-20 resize-none focus:border-[#00a884] outline-none"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-white">Profile Visibility</span>
          <button 
            className={`px-3 py-1 rounded text-xs transition-colors ${editPrivacy ? 'bg-[#00a884] text-white' : 'bg-[#2a3942] text-[#8696a0]'}`}
            onClick={() => setEditPrivacy(!editPrivacy)}
          >
            {editPrivacy ? "Public" : "Private"}
          </button>
        </div>

        <div>
          <label className="text-xs text-[#8696a0] uppercase font-bold mb-2 block">Wallpaper</label>
          <div className="flex gap-2">
            {['wp-default', 'wp-midnight', 'wp-starry'].map((wp) => (
              <button
                key={wp}
                onClick={() => onWallpaperChange(wp)}
                className={`w-12 h-12 rounded-lg border-2 transition-all ${wallpaper === wp ? 'border-[#00a884]' : 'border-transparent'}`}
                style={{
                  background: wp === 'wp-default' ? '#0b141a' : wp === 'wp-midnight' ? '#000' : '#1a1a2e'
                }}
              />
            ))}
          </div>
        </div>

        <button 
          onClick={onUpdate}
          className="w-full py-2 bg-[#00a884] text-white rounded font-medium hover:bg-[#008f72] transition-colors"
        >
          Update Profile
        </button>
      </div>
    </div>
  </motion.div>
);

const UserInfoDrawer = ({ 
  activeChat, 
  isAdmin, 
  onClose, 
  onClearChat, 
  onBlockUser, 
  onLeaveGroup,
  onSuspendUser 
}) => (
  <motion.div 
    className="fixed inset-y-0 right-0 w-80 bg-[#111b21] border-l border-[#2a3942] z-50 shadow-2xl"
    initial={{ x: "100%" }}
    animate={{ x: 0 }}
    exit={{ x: "100%" }}
  >
    <div className="p-4 bg-[#202c33] flex items-center gap-4 text-white">
      <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full">
        <X size={20} />
      </button>
      <h3 className="font-medium">Contact Info</h3>
    </div>
    
    <div className="p-4 overflow-y-auto h-full pb-20 custom-scrollbar">
      <div className="flex flex-col items-center mb-6">
        <img 
          src={activeChat.photoURL || `https://ui-avatars.com/api/?name=${activeChat.displayName}`} 
          alt="contact" 
          className="w-32 h-32 rounded-full mb-3 object-cover"
        />
        <h2 className="text-xl font-bold text-white">{activeChat.displayName}</h2>
        <p className="text-sm text-[#8696a0]">
          {activeChat.otherUser?.phoneNumber || "No phone number"}
        </p>
      </div>

      <div className="space-y-3">
        <div className="bg-[#202c33] p-3 rounded-lg">
          <label className="text-xs text-[#8696a0] uppercase font-bold">About</label>
          <p className="text-sm text-white mt-1">{activeChat.otherUser?.bio || "Available"}</p>
        </div>

        <button 
          onClick={onClearChat}
          className="w-full py-3 text-left px-3 text-white hover:bg-[#202c33] rounded-lg transition-colors"
        >
          Clear Chat History
        </button>

        {activeChat.type === "group" ? (
          <button 
            onClick={onLeaveGroup}
            className="w-full py-3 text-left px-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            Leave Group
          </button>
        ) : (
          <button 
            onClick={onBlockUser}
            className="w-full py-3 text-left px-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            Block {activeChat.displayName}
          </button>
        )}

        {isAdmin && activeChat.type !== "group" && (
          <div className="mt-4 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
            <h5 className="text-xs uppercase font-bold text-red-400 mb-2">Admin Actions</h5>
            <p className="text-xs text-[#8696a0] mb-2">Suspend user for:</p>
            <div className="flex gap-2">
              {[1, 5, 7].map(days => (
                <button 
                  key={days}
                  onClick={() => onSuspendUser(days)}
                  className="flex-1 py-2 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors"
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

export default BirxyyChat;