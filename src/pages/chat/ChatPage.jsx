import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { chatService } from "../../services/chatService";
import { presenceService } from "../../services/presenceService";
import { db } from "../../config/firebase";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import {
    Search,
    Plus,
    MessageCircle,
    Users,
    Phone,
    Video,
    MoreVertical,
    Send,
    ArrowLeft,
    Check,
    CheckCheck,
    Settings,
    Image,
    X,
    Smile,
    Mic,
    Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { getArmyRank, ARMY_RANKS } from "../../config/armyRanks";
import ZegoCall from "../../components/calling/ZegoCall";
import "../../styles/messenger-ui.css";

export default function ChatPage() {
    const { user, isAdmin, role } = useAuth();
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [showNewChat, setShowNewChat] = useState(false);
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [activeCall, setActiveCall] = useState(null);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [onlineUsers, setOnlineUsers] = useState({});
    const [userStatuses, setUserStatuses] = useState({}); // {uid: 'typing' | 'recording'}
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [wallpaper, setWallpaper] = useState(localStorage.getItem("chatWallpaper") || "wp-default");
    const [showProfileSettings, setShowProfileSettings] = useState(false);
    const [showChatOptionsDropdown, setShowChatOptionsDropdown] = useState(false);
    const [activeContextMenuMsgId, setActiveContextMenuMsgId] = useState(null);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [currentUserData, setCurrentUserData] = useState(null);
    const [editPhone, setEditPhone] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editPrivacy, setEditPrivacy] = useState(true);
    const messagesEndRef = useRef(null);

    // Subscriptions
    useEffect(() => {
        if (!user) return;
        const unsubChats = chatService.subscribeToUserChats(user.uid, (updatedChats) => {
            setChats(updatedChats);
            setError(null);
        }, (err) => {
            if (err.code === "permission-denied") {
                setError("Firebase Permission Issue: Rules sync required.");
            }
        });
        return () => unsubChats();
    }, [user]);

    useEffect(() => {
        if (!activeChat) return;
        
        // 1. Subscribe to Messages
        const unsubMessages = chatService.subscribeToMessages(activeChat.id, (msgs) => {
            setMessages(msgs);
        });

        // 2. Subscribe to Statuses (Typing/Recording)
        const unsubStatuses = chatService.subscribeToStatuses(activeChat.id, (statuses) => {
            const others = {};
            Object.entries(statuses).forEach(([uid, status]) => {
                if (uid !== user.uid) others[uid] = status;
            });
            setUserStatuses(others);
        });

        return () => {
            unsubMessages();
            unsubStatuses();
        };
    }, [activeChat, user]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, userStatuses]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const q = query(collection(db, "users"));
                const querySnapshot = await getDocs(q);
                const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Exclude current user and set other users
                setUsers(userList.filter(u => u.id !== user?.uid));

                // Find current user data for settings
                const me = userList.find(u => u.id === user?.uid);
                if (me) {
                    setCurrentUserData(me);
                    setEditPhone(me.phoneNumber || "");
                    setEditBio(me.bio || "");
                    setEditPrivacy(me.isPublic !== false);
                }

                // Listen to presence for all these users
                userList.forEach(u => {
                    presenceService.subscribeToPresence(u.uid, (presence) => {
                        setOnlineUsers(prev => ({ ...prev, [u.uid]: presence?.isOnline || false }));
                    });
                });
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };
        if (user) fetchUsers();
    }, [user]);

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

    const handleClearChat = async () => {
        if (!activeChat || !window.confirm("Clear all messages in this chat?")) return;
        try {
            await chatService.clearChatMessages(activeChat.id);
            setMessages([]);
            setShowUserInfo(false);
        } catch (err) {
            setError("Failed to clear chat.");
        }
    };

    const handleBlockUser = async () => {
        if (!activeChat?.otherUser || !window.confirm("Block this contact?")) return;
        try {
            await chatService.blockUser(user.uid, activeChat.otherUser.uid);
            setActiveChat(null);
            setShowUserInfo(false);
        } catch (err) {
            setError("Failed to block user.");
        }
    };

    const handleSuspendUser = async (days) => {
        if (!activeChat?.otherUser || !isAdmin) return;
        try {
            await chatService.suspendUser(activeChat.otherUser.uid, days);
            alert(`User suspended for ${days} days.`);
            setShowUserInfo(false);
        } catch (err) {
            setError("Failed to suspend user.");
        }
    };

    const handleInputChange = (e) => {
        setInputText(e.target.value);
        if (!activeChat) return;

        chatService.setStatus(activeChat.id, user.uid, "typing");

        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            chatService.setStatus(activeChat.id, user.uid, "none");
        }, 2000);
        setTypingTimeout(timeout);
    };

    const toggleRecording = () => {
        const newRecording = !isRecording;
        setIsRecording(newRecording);
        if (activeChat) {
            chatService.setStatus(activeChat.id, user.uid, newRecording ? "recording" : "none");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !activeChat) return;
        try {
            if (editingMessageId) {
                await chatService.editMessage(activeChat.id, editingMessageId, inputText);
                setEditingMessageId(null);
            } else {
                await chatService.sendMessage(activeChat.id, user.uid, inputText);
            }
            setInputText("");
            chatService.setStatus(activeChat.id, user.uid, "none");
            if (typingTimeout) clearTimeout(typingTimeout);
        } catch (err) {
            console.error("Send message error:", err);
            setError("Failed to send message.");
        }
    };

    const handleEditMessageClick = (msg) => {
        setEditingMessageId(msg.id);
        setInputText(msg.text);
    };

    const startDirectChat = async (targetUser) => {
        try {
            const chatId = await chatService.getOrCreateDirectChat(user.uid, targetUser.uid);
            setActiveChat({ id: chatId, ...targetUser, type: "direct" });
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

    // Hydrate chats to include other user's details for direct chats
    const hydratedChats = chats.map(chat => {
        if (chat.type === "direct") {
            const otherUserId = chat.participants?.find(p => p !== user?.uid);
            const otherUser = users.find(u => u.uid === otherUserId || u.id === otherUserId);
            return {
                ...chat,
                displayName: otherUser?.username || otherUser?.displayName || "Unknown User",
                photoURL: otherUser?.photoURL || null,
                rank: otherUser?.rank || 0,
                otherUser: otherUser || { uid: otherUserId, email: "Unknown" }
            };
        }
        return chat;
    });
    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm("Abort this transmission?")) return;
        try {
            await chatService.deleteMessage(activeChat.id, msgId);
        } catch (err) {
            console.error(err);
            setError("Failed to delete message.");
        }
    };

    const changeWallpaper = (style) => {
      setWallpaper(style);
      localStorage.setItem("chatWallpaper", style);
      setShowProfileSettings(false);
      setShowChatOptionsDropdown(false);
    };

    const handleContextMenu = (e, msgId) => {
        e.preventDefault();
        setActiveContextMenuMsgId(activeContextMenuMsgId === msgId ? null : msgId);
    };

    const longPressTimerRef = useRef(null);
    const handleTouchStart = (msgId) => {
        longPressTimerRef.current = setTimeout(() => {
            setActiveContextMenuMsgId(msgId);
        }, 600);
    };
    const handleTouchEnd = () => {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };

    return (
        <div className="messenger-wrapper" onClick={() => { if(showChatOptionsDropdown) setShowChatOptionsDropdown(false); }}>
            {/* Sidebar */}
            <div className={`messenger-sidebar ${activeChat ? 'hidden' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-top">
                        <div className="flex items-center gap-3">
                            <img src={user?.photoURL || "/GlobixTech-logo.png"} alt="User" className="sidebar-logo cursor-pointer" onClick={() => setShowProfileSettings(true)} />
                            <h1 className="text-xl font-bold">BirxyChat</h1>
                        </div>
                        <div className="flex gap-4 text-msger-text-dim">
                            <Users size={20} className="cursor-pointer hover:text-white" onClick={() => setShowNewChat(true)} />
                            <MessageCircle size={20} className="cursor-pointer hover:text-white" onClick={() => setShowNewChat(true)} />
                            <MoreVertical size={20} className="cursor-pointer hover:text-white" />
                        </div>
                    </div>
                    <div className="sidebar-search">
                        <div className="search-container">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search or start new chat"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="chat-list no-scrollbar">
                    {/* Filtered Chats */}
                    {hydratedChats.filter(chat =>
                        (chat.groupName || chat.displayName || "").toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setActiveChat(chat)}
                            className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
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
                                    <span className="chat-name block truncate">
                                        {chat.groupName || chat.displayName || "Direct Chat"}
                                    </span>
                                    <span className="chat-time">
                                        {chat.lastMessageAt && format(chat.lastMessageAt.toDate(), "HH:mm")}
                                    </span>
                                </div>
                                <div className="chat-preview truncate">
                                    {chat.lastMessage || "No messages yet"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Messenger Area */}
            <div className={`messenger-main ${!activeChat ? 'hidden md:flex' : 'flex'} ${wallpaper}`}>
                {activeChat ? (
                    <>
                        <div className="chat-header">
                            <div className="flex items-center gap-2">
                                <button className="md:hidden text-msger-text-dim p-2 -ml-2" onClick={() => setActiveChat(null)}>
                                    <ArrowLeft size={24} />
                                </button>
                                <div className="header-user cursor-pointer" onClick={() => !activeChat.groupName && setShowUserInfo(true)}>
                                    <div className="chat-avatar !w-10 !h-10 border-2 border-msger-primary rounded-full overflow-hidden">
                                        <img
                                            src={activeChat.photoURL || "https://ui-avatars.com/api/?name=" + (activeChat.groupName || activeChat.displayName || "C")}
                                            alt="Chat"
                                        />
                                    </div>
                                    <div className="ml-2 flex-1">
                                        <h2 className="leading-tight font-semibold text-white">
                                            {activeChat.groupName || activeChat.displayName || "Chat"}
                                        </h2>
                                        <span className="text-[12px] text-msger-primary font-medium tracking-wide">
                                            {Object.values(userStatuses).some(s => s === 'typing') ? "typing..." : 
                                            Object.values(userStatuses).some(s => s === 'recording') ? "recording audio..." : 
                                            (activeChat.type === "direct" && activeChat.otherUser && onlineUsers[activeChat.otherUser?.uid] ? "Online" : "last seen recently")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="header-actions">
                                <Video size={20} onClick={() => setActiveCall({ id: activeChat.id, type: 'video' })} />
                                <Phone size={20} onClick={() => setActiveCall({ id: activeChat.id, type: 'voice' })} />
                                <div className="relative">
                                    <MoreVertical size={20} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowChatOptionsDropdown(!showChatOptionsDropdown); }} />
                                    {showChatOptionsDropdown && (
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-msger-header border border-msger-border rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                                            <div onClick={(e) => { e.stopPropagation(); setShowUserInfo(true); setShowChatOptionsDropdown(false); }} className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm">
                                                Contact Info
                                            </div>
                                            <div className="px-4 py-2 text-[10px] uppercase font-bold text-msger-text-dim border-y border-msger-border bg-black/20">
                                                Wallpapers
                                            </div>
                                            <div className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm flex items-center gap-2" onClick={(e) => { e.stopPropagation(); changeWallpaper('wp-default'); }}>
                                                <Image size={14} /> Default
                                            </div>
                                            <div className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm flex items-center gap-2" onClick={(e) => { e.stopPropagation(); changeWallpaper('wp-midnight'); }}>
                                                <div className="w-3 h-3 bg-black rounded" /> Midnight
                                            </div>
                                            <div className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm flex items-center gap-2" onClick={(e) => { e.stopPropagation(); changeWallpaper('wp-starry'); }}>
                                                <Image size={14} /> Starry Night
                                            </div>
                                            <div className="border-t border-msger-border"></div>
                                            <div onClick={(e) => { e.stopPropagation(); handleClearChat(); setShowChatOptionsDropdown(false); }} className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm">
                                                Clear Chat
                                            </div>
                                            <div onClick={(e) => { e.stopPropagation(); handleBlockUser(); setShowChatOptionsDropdown(false); }} className="px-4 py-3 hover:bg-red-500/20 text-red-400 cursor-pointer text-sm">
                                                Block
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="messages-container no-scrollbar" onClick={() => setActiveContextMenuMsgId(null)}>
                            {messages.map((msg, idx) => (
                                <div
                                    key={msg.id}
                                    className={`message-wrapper ${msg.senderId === user.uid ? 'sent' : 'received'}`}
                                >
                                    <div 
                                        className="message-bubble relative"
                                        onContextMenu={(e) => handleContextMenu(e, msg.id)}
                                        onTouchStart={() => handleTouchStart(msg.id)}
                                        onTouchEnd={handleTouchEnd}
                                        onTouchMove={handleTouchEnd}
                                    >
                                        {msg.text}
                                        {msg.isEdited && <span className="text-[10px] ml-1 opacity-50 italic">(edited)</span>}
                                        <div className="message-meta">
                                            <span className="message-time">
                                                {msg.timestamp && format(msg.timestamp.toDate(), "HH:mm")}
                                            </span>
                                            {msg.senderId === user.uid && (
                                                <div className="message-status">
                                                    <CheckCheck size={14} />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {(msg.senderId === user.uid || isAdmin) && activeContextMenuMsgId === msg.id && (
                                            <div className="absolute -top-3 -right-2 flex gap-2 bg-msger-secondary p-2 rounded-lg shadow-xl z-50 border border-msger-border animate-in fade-in zoom-in-95">
                                                {msg.senderId === user.uid && (
                                                    <button 
                                                        onClick={() => handleEditMessageClick(msg)}
                                                        className="text-msger-text-dim hover:text-blue-400"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                    className="text-msger-text-dim hover:text-red-400"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="chat-input-area">
                            <Plus size={24} className="text-msger-text-dim cursor-pointer" />
                            <div className="input-container flex-1 bg-msger-header px-4 py-2 rounded-full border border-msger-border focus-within:border-msger-primary transition-colors flex items-center relative">
                                {editingMessageId && (
                                    <div className="absolute -top-8 left-4 text-[11px] bg-msger-secondary px-2 py-1 rounded-t-lg text-msger-text-dim border border-b-0 border-msger-border flex gap-2">
                                        Editing message... 
                                        <button type="button" onClick={() => { setEditingMessageId(null); setInputText(""); }} className="hover:text-red-400"><X size={12}/></button>
                                    </div>
                                )}
                                <Smile size={22} className="text-msger-text-dim mr-3 hover:text-white cursor-pointer transition-colors" />
                                <input
                                    type="text"
                                    placeholder={editingMessageId ? "Update your message..." : "Type a message"}
                                    value={inputText}
                                    onChange={handleInputChange}
                                    className="w-full bg-transparent border-none outline-none text-white placeholder:text-msger-text-dim"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="send-btn"
                            >
                                {inputText.trim() ? <Send size={20} fill="currentColor" /> : <Mic size={20} />}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="placeholder-screen flex flex-col items-center justify-center w-full h-full p-4">
                        <div className="w-24 h-24 bg-msger-header rounded-full flex items-center justify-center mb-6">
                            <MessageCircle size={48} className="text-msger-text-dim" />
                        </div>
                        <h2 className="text-2xl font-light text-msger-text">BirxyChat</h2>
                        <p className="text-msger-text-dim mt-2 max-w-sm text-center">Modern, end-to-end encrypted messaging for the GTE Platform.</p>
                        <div className="mt-auto py-8 text-msger-text-dim text-xs flex items-center gap-2">
                             🔒 Powered by Birxy Premium
                        </div>
                    </div>
                )}
            </div>


            {/* New Chat Modal */}
            <AnimatePresence>
                {showNewChat && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                        onClick={() => setShowNewChat(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#233138] w-full max-w-md h-[80vh] flex flex-col border border-msger-border shadow-2xl rounded-lg overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 bg-msger-header text-white flex items-center gap-4">
                                <button onClick={() => { setShowNewChat(false); setShowNewGroup(false); }} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                                <h2 className="font-medium text-lg">{showNewGroup ? "New group" : "New chat"}</h2>
                            </div>

                            {!showNewGroup ? (
                                <>
                                    <div className="p-2">
                                        <button
                                            onClick={() => setShowNewGroup(true)}
                                            className="w-full p-3 hover:bg-[#182229] flex items-center gap-4 transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-msger-primary text-white flex items-center justify-center">
                                                <Users size={20} />
                                            </div>
                                            <span className="font-medium">New group</span>
                                        </button>
                                    </div>

                                    <div className="p-4 text-msger-primary font-medium text-sm flex items-center gap-4 cursor-pointer hover:bg-[#182229]">
                                       <div className="w-10 h-10 rounded-full bg-msger-primary text-white flex items-center justify-center">
                                           <Plus size={20} />
                                       </div>
                                       <span>New contact</span>
                                    </div>

                                    <div className="px-4 py-4 text-msger-text-dim text-sm uppercase">
                                        Contacts on BirxyChat
                                    </div>

                                    <div className="flex-1 overflow-y-auto no-scrollbar">
                                        {users.map(u => (
                                            <div
                                                key={u.uid}
                                                onClick={() => startDirectChat(u)}
                                                className="px-4 py-3 flex items-center gap-4 hover:bg-[#182229] cursor-pointer"
                                            >
                                                <div className="chat-avatar !w-10 !h-10">
                                                    <img src={u.photoURL || "https://ui-avatars.com/api/?name=" + (u.username || u.displayName || "User")} alt="U" />
                                                </div>
                                                <div className="flex-1 border-b border-msger-border pb-3">
                                                    <h4 className="font-medium text-[#e9edef]">{u.username || u.displayName || "User"}</h4>
                                                    <p className="text-xs text-msger-text-dim truncate">{u.bio || "Available"}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <GroupCreationView
                                    users={users}
                                    onCreate={handleCreateGroup}
                                    onBack={() => setShowNewGroup(false)}
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

                {/* Settings Overlay */}
                <AnimatePresence>
                    {showProfileSettings && (
                        <motion.div 
                          className="bc-drawer settings-drawer"
                          initial={{ x: "-100%" }}
                          animate={{ x: 0 }}
                          exit={{ x: "-100%" }}
                        >
                            <div className="drawer-header">
                                <ArrowLeft onClick={() => setShowProfileSettings(false)} className="cursor-pointer" />
                                <h3>Settings</h3>
                            </div>
                            
                            <div className="drawer-content no-scrollbar">
                                <div className="drawer-section">
                                    <div className="drawer-avatar-edit">
                                        <img src={user?.photoURL || "/GlobixTech-logo.png"} alt="me" />
                                        <p className="text-sm text-msger-text-dim mt-2">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="drawer-section">
                                    <h4>Account</h4>
                                    <div className="drawer-field">
                                        <label>Phone Number</label>
                                        <input 
                                          type="tel" 
                                          value={editPhone} 
                                          onChange={(e) => setEditPhone(e.target.value)}
                                          placeholder="+234..."
                                        />
                                    </div>
                                    <div className="drawer-field">
                                        <label>About / Bio</label>
                                        <textarea 
                                          value={editBio} 
                                          onChange={(e) => setEditBio(e.target.value)}
                                          placeholder="Hi! I'm using BirxyChat."
                                        />
                                    </div>
                                    <button className="drawer-save-btn" onClick={handleUpdateAccount}>Update Profile</button>
                                </div>

                                <div className="drawer-section">
                                    <h4>Privacy</h4>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm">Profile Visibility</span>
                                        <button 
                                            className={`toggle-btn ${editPrivacy ? 'active' : ''}`}
                                            onClick={() => setEditPrivacy(!editPrivacy)}
                                        >
                                            {editPrivacy ? "Public" : "Private"}
                                        </button>
                                    </div>
                                </div>

                                <div className="drawer-section">
                                    <h4>Themes</h4>
                                    <div className="wallpaper-picker">
                                        <div className={`wp-swatch default ${wallpaper === 'wp-default' ? 'active' : ''}`} onClick={() => changeWallpaper('wp-default')} />
                                        <div className={`wp-swatch midnight ${wallpaper === 'wp-midnight' ? 'active' : ''}`} onClick={() => changeWallpaper('wp-midnight')} />
                                        <div className={`wp-swatch starry ${wallpaper === 'wp-starry' ? 'active' : ''}`} onClick={() => changeWallpaper('wp-starry')} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* User Info Overlay */}
                <AnimatePresence>
                    {showUserInfo && activeChat && activeChat.otherUser && (
                        <motion.div 
                          className="bc-drawer info-drawer"
                          initial={{ x: "100%" }}
                          animate={{ x: 0 }}
                          exit={{ x: "100%" }}
                        >
                            <div className="drawer-header">
                                <X onClick={() => setShowUserInfo(false)} className="cursor-pointer" />
                                <h3>Contact Info</h3>
                            </div>
                            
                            <div className="drawer-content no-scrollbar">
                                <div className="info-profile-card">
                                    <img src={activeChat.photoURL || "https://ui-avatars.com/api/?name=" + activeChat.displayName} alt="contact" />
                                    <h2>{activeChat.displayName}</h2>
                                    <p className="text-msger-text-dim">{activeChat.otherUser.phoneNumber || "No phone number listed"}</p>
                                </div>

                                <div className="drawer-section">
                                    <h4>About</h4>
                                    <p className="text-sm text-msger-text">{activeChat.otherUser.bio || "Available"}</p>
                                </div>

                                <div className="drawer-section">
                                    <h4>Moderation</h4>
                                    <button className="moderation-btn clear" onClick={handleClearChat}>
                                        Clear Chat History
                                    </button>
                                    <button className="moderation-btn block" onClick={handleBlockUser}>
                                        Block {activeChat.displayName}
                                    </button>
                                    
                                    {isAdmin && (
                                        <div className="admin-actions mt-4 p-3 bg-red-900/20 rounded">
                                            <h5 className="text-[10px] uppercase font-bold text-red-400 mb-2">Admin: Suspend User</h5>
                                            <div className="flex gap-2">
                                                <button className="suspend-btn" onClick={() => handleSuspendUser(1)}>1d</button>
                                                <button className="suspend-btn" onClick={() => handleSuspendUser(5)}>5d</button>
                                                <button className="suspend-btn" onClick={() => handleSuspendUser(7)}>7d</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {role === "suspended" && (
                    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                             <X size={40} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">BirxyChat Access Suspended</h2>
                        <p className="text-gray-400 max-w-sm">
                            Your account has been temporarily restricted due to community guidelines violations. 
                            Please contact support if you believe this is a mistake.
                        </p>
                        <button className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold" onClick={() => window.location.reload()}>Refresh</button>
                    </div>
                )}
                {activeCall && (
                    <ZegoCall
                        callID={activeCall.id}
                        type={activeCall.type}
                        onEnd={() => setActiveCall(null)}
                    />
                )}
        </div>
    );
}

function GroupCreationView({ users, onCreate, onBack }) {
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);

    const toggleUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#111b21]">
            <div className="p-4 bg-[#202c33] flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Provide a group subject"
                    className="w-full bg-transparent border-b border-msger-primary py-2 outline-none text-msger-text placeholder:text-msger-text-dim"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    autoFocus
                />
            </div>
            <div className="px-4 py-3 text-xs font-bold text-msger-text-dim uppercase">
                Select Participants ({selectedUsers.length})
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {users.map(u => (
                    <div
                        key={u.uid}
                        onClick={() => toggleUser(u.uid)}
                        className={`px-4 py-3 flex items-center justify-between hover:bg-[#182229] cursor-pointer border-b border-msger-border`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="chat-avatar !w-10 !h-10">
                                <img src={u.photoURL || "https://ui-avatars.com/api/?name=" + (u.username || u.displayName || "User")} alt="U" />
                            </div>
                            <div>
                                <h4 className="font-medium text-[#e9edef]">{u.username || u.displayName || "User"}</h4>
                                <p className="text-xs text-msger-text-dim">{u.email}</p>
                            </div>
                        </div>
                        <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-all ${selectedUsers.includes(u.uid) ? 'bg-msger-primary border-msger-primary' : 'border-[#8696a0]'}`}>
                            {selectedUsers.includes(u.uid) && <Check size={14} className="text-white" />}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-[#202c33] flex justify-center">
                <button
                    disabled={!groupName.trim() || selectedUsers.length === 0}
                    onClick={() => onCreate(groupName, selectedUsers)}
                    className="w-14 h-14 bg-msger-primary text-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105"
                >
                    <Check size={32} />
                </button>
            </div>
        </div>
    );
}
