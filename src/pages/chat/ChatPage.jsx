import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { chatService } from "../../services/chatService";
import { presenceService } from "../../services/presenceService";
import { db } from "../../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
    Search,
    Plus,
    MessageCircle,
    Users,
    Phone,
    Video,
    MoreVertical,
    Send,
    ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { getArmyRank, ARMY_RANKS } from "../../config/armyRanks";
import ZegoCall from "../../components/calling/ZegoCall";
import "../../styles/messenger-ui.css";

export default function ChatPage() {
    const { user, isAdmin } = useAuth();
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
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
    const messagesEndRef = useRef(null);

    // Subscriptions
    useEffect(() => {
        if (!user) return;
        const unsubscribe = chatService.subscribeToUserChats(user.uid, (updatedChats) => {
            setChats(updatedChats);
            setError(null);
        }, (err) => {
            if (err.code === "permission-denied") {
                setError("Firestore rules need review. Click for details.");
            }
        });
        return unsubscribe;
    }, [user]);

    useEffect(() => {
        if (!activeChat) return;
        const unsubscribeStatuses = chatService.subscribeToStatuses(activeChat.id, (statuses) => {
            const others = {};
            Object.entries(statuses).forEach(([uid, status]) => {
                if (uid !== user.uid) others[uid] = status;
            });
            setUserStatuses(others);
        });

        return () => {
            unsubscribe();
            unsubscribeStatuses();
        };
    }, [activeChat, user]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, userStatuses]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const q = query(collection(db, "users"), where("uid", "!=", user?.uid));
                const querySnapshot = await getDocs(q);
                const userList = querySnapshot.docs.map(doc => doc.data());
                setUsers(userList);

                // Listen to presence for all these users (for a large app, scale this differently)
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
            await chatService.sendMessage(activeChat.id, user.uid, inputText);
            setInputText("");
            chatService.setStatus(activeChat.id, user.uid, "none");
            if (typingTimeout) clearTimeout(typingTimeout);
        } catch (err) {
            console.error("Send message error:", err);
            setError("Failed to send message.");
        }
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
            if (otherUser) {
                return {
                    ...chat,
                    displayName: otherUser.displayName || "Unknown User",
                    photoURL: otherUser.photoURL,
                    rank: otherUser.rank || 0,
                    otherUser
                };
            }
        }
        return chat;
    });

    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm("Abort this transmission?")) return;
        try {
            await chatService.deleteMessage(activeChat.id, msgId);
        } catch (err) {
            console.error(err);
            alert("Failed to delete message.");
        }
    };

    return (
        <div className="messenger-wrapper">
            {/* Sidebar */}
            <div className={`messenger-sidebar ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="sidebar-header">
                    <div className="sidebar-top">
                        <div className="flex items-center gap-2">
                            <img src="/GlobixTech-logo.png" alt="Logo" className="sidebar-logo" />
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <MessageCircle size={20} className="text-msger-primary" />
                                Chats
                            </h1>
                        </div>
                        <button
                            className="w-10 h-10 rounded-full bg-msger-hover flex items-center justify-center text-msger-text hover:bg-msger-active transition-all"
                            onClick={() => setShowNewChat(true)}
                        >
                            <Plus size={22} />
                        </button>
                    </div>
                    <div className="sidebar-search">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search Messenger"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="chat-list">
                    {error && (
                        <div className="p-4 m-2 bg-red-900/20 text-red-400 rounded-lg text-xs font-medium border border-red-900/40">
                            ⚠️ {error}
                            <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
                        </div>
                    )}

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
                                <Link to={chat.type === 'direct' ? `/profile/${chat.otherUser?.uid}` : '#'} onClick={(e) => chat.type === 'direct' && e.stopPropagation()}>
                                    {chat.photoURL ? (
                                        <img src={chat.photoURL} className="w-full h-full rounded-full object-cover" alt="User" />
                                    ) : (
                                        <div className="w-full h-full rounded-full flex items-center justify-center bg-msger-primary-gradient text-white text-lg">
                                            {chat.groupName ? <Users size={24} /> : (chat.displayName || "U")[0]}
                                        </div>
                                    )}
                                </Link>
                                {chat.type === "direct" && chat.otherUser && onlineUsers[chat.otherUser.uid] && (
                                    <div className="status-indicator" style={{ backgroundColor: '#2ecc71', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid white', position: 'absolute', bottom: '0', right: '0' }}></div>
                                )}
                            </div>
                            <div className="chat-info">
                                <div className="chat-info-top">
                                    <span className="chat-name flex items-center gap-2">
                                        {chat.groupName || chat.displayName || "Direct Chat"}
                                        {chat.type === 'direct' && chat.rank > 0 && (
                                            <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-gray-300 font-bold uppercase tracking-wider">
                                                {getArmyRank(chat.rank).title}
                                            </span>
                                        )}
                                    </span>
                                    <span className="chat-time">
                                        {chat.lastMessageAt && format(chat.lastMessageAt.toDate(), "HH:mm")}
                                    </span>
                                </div>
                                <div className="chat-preview">
                                    {chat.lastMessage || "No messages yet"}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Global People Search */}
                    {searchTerm.length > 2 && (
                        <div className="mt-4">
                            <h3 className="px-4 py-2 text-xs font-bold text-msger-text-dim uppercase tracking-wider">People</h3>
                            {users
                                .filter(u =>
                                    (u.displayName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .filter(u => !chats.some(c => c.participants?.includes(u.uid))) // Don't show if already in chats
                                .map(u => (
                                    <div
                                        key={u.uid}
                                        onClick={() => startDirectChat(u)}
                                        className="chat-item"
                                    >
                                        <div className="chat-avatar">
                                            <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName || u.email}`} className="w-full h-full rounded-full object-cover" alt="User" />
                                        </div>
                                        <div className="chat-info">
                                            <span className="chat-name block font-semibold">{u.displayName || u.email.split('@')[0]}</span>
                                            <span className="chat-preview text-xs text-msger-text-dim">New chat</span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>
            </div>

            {/* Main Messenger Area */}
            <div className={`messenger-main ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                {activeChat ? (
                    <>
                        <div className="chat-header">
                            <div className="header-user">
                                <button onClick={() => setActiveChat(null)} className="md:hidden text-msger-primary p-2">
                                    <ArrowLeft size={24} />
                                </button>
                                <div className="chat-avatar !w-10 !h-10 relative">
                                    <Link to={activeChat.type === 'direct' ? `/profile/${activeChat.otherUser?.uid}` : '#'}>
                                        <img
                                            src={activeChat.photoURL || "https://ui-avatars.com/api/?name=" + (activeChat.groupName || activeChat.displayName || "C")}
                                            className="w-full h-full rounded-full object-cover"
                                            alt="Chat"
                                        />
                                    </Link>
                                    {activeChat.type === "direct" && activeChat.otherUser && onlineUsers[activeChat.otherUser.uid] && (
                                        <div className="status-indicator" style={{ backgroundColor: '#2ecc71', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid white', position: 'absolute', bottom: '0', right: '0' }}></div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="flex items-center gap-2">
                                        {activeChat.groupName || activeChat.displayName || "Chat"}
                                        {activeChat.type === "direct" && activeChat.otherUser && onlineUsers[activeChat.otherUser.uid] && (
                                            <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                        )}
                                    </h2>
                                    <span className="text-xs text-msger-text-dim">
                                        {Object.values(userStatuses).some(s => s === 'typing') ? "typing..." : 
                                         Object.values(userStatuses).some(s => s === 'recording') ? "recording audio..." : 
                                         (activeChat.type === "direct" && activeChat.otherUser && onlineUsers[activeChat.otherUser.uid] ? "Online" : "Last seen recently")}
                                    </span>
                                </div>
                            </div>
                            <div className="header-actions">
                                <Phone size={20} className="hidden sm:block" onClick={() => setActiveCall({ id: activeChat.id, type: 'voice' })} />
                                <Video size={20} className="hidden sm:block" onClick={() => setActiveCall({ id: activeChat.id, type: 'video' })} />
                                <MoreVertical size={20} />
                            </div>
                        </div>

                        <div className="messages-container no-scrollbar">
                            {messages.map((msg, idx) => (
                                <div
                                    key={msg.id}
                                    className={`message-wrapper ${msg.senderId === user.uid ? 'sent' : 'received'}`}
                                >
                                    <div className="message-bubble relative group/msg">
                                        {msg.text}
                                        {(msg.senderId === user.uid || isAdmin) && (
                                            <button 
                                                onClick={() => handleDeleteMessage(msg.id)}
                                                className="absolute -top-2 -right-2 bg-red-900 border border-red-500 text-white p-1 rounded-full opacity-0 group-hover/msg:opacity-100 transition-opacity z-10 hover:bg-red-600 scale-75"
                                                title="Delete for everyone"
                                            >
                                                <X size={10} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="message-time">
                                            {msg.timestamp && format(msg.timestamp.toDate(), "HH:mm")}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {Object.entries(userStatuses).map(([uid, status]) => (
                                <div key={uid} className="message-wrapper received">
                                    <div className="message-bubble bg-msger-hover text-msger-text-dim italic text-xs flex items-center gap-2">
                                        {status === 'typing' ? (
                                            <>
                                                <motion.span animate={{ opacity: [0,1,0] }} transition={{ repeat: Infinity, duration: 1 }}>•</motion.span>
                                                <motion.span animate={{ opacity: [0,1,0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>•</motion.span>
                                                <motion.span animate={{ opacity: [0,1,0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>•</motion.span>
                                                typing
                                            </>
                                        ) : (
                                            <>🎤 recording audio...</>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="chat-input-area">
                            <button 
                                type="button" 
                                onClick={toggleRecording}
                                className={`transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-msger-primary hover:opacity-70'}`}
                            >
                                {isRecording ? <div className="w-6 h-6 rounded-full bg-red-500" /> : <Plus size={24} />}
                            </button>
                            <div className="input-container">
                                <input
                                    type="text"
                                    placeholder="Aa"
                                    value={inputText}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="send-btn text-msger-primary disabled:opacity-30"
                            >
                                <Send size={24} fill="currentColor" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="messenger-placeholder flex flex-col items-center justify-center w-full h-full p-4 overflow-y-auto no-scrollbar">
                        <div className="placeholder-illustration mt-10">
                            <img src="/GlobixTech-logo.png" alt="Globix Tech" className="opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500 w-32 h-auto" />
                        </div>
                        <h2 className="text-2xl font-bold mt-6 text-msger-text">Your Messages</h2>
                        <p className="text-msger-text-dim text-center mt-2 max-w-md">Send private photos and messages to a friend or group. Connect with your peers in real-time.</p>
                        <button
                            className="mt-6 px-8 py-2.5 bg-msger-primary-gradient text-white rounded-full font-bold shadow-lg hover:scale-105 transition-all"
                            onClick={() => setShowNewChat(true)}
                        >
                            Send Message
                        </button>

                        {/* Suggested Users Section */}
                        {users.filter(u => !chats.some(c => c.participants?.includes(u.uid))).length > 0 && (
                            <div className="suggested-users-section mt-16 w-full max-w-2xl px-4 pb-10">
                                <h3 className="text-left font-bold text-msger-text uppercase tracking-widest mb-4 border-b border-msger-border pb-2 flex items-center gap-2">
                                    <Users size={18} className="text-msger-primary" /> Suggestions For You
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {users
                                        .filter(u => !chats.some(c => c.participants?.includes(u.uid)))
                                        .slice(0, 6)
                                        .map(u => (
                                            <div
                                                key={u.uid}
                                                onClick={() => startDirectChat(u)}
                                                className="p-4 bg-msger-hover rounded-xl flex items-center gap-4 cursor-pointer hover:bg-msger-active transition-all border border-msger-border group hover:scale-[1.02] shadow-sm"
                                            >
                                                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-msger-border">
                                                    <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName || u.email}`} alt={u.displayName} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <h4 className="font-semibold text-msger-text truncate">{u.displayName || "Unknown User"}</h4>
                                                    <p className="text-xs text-msger-text-dim truncate">{u.role || "Student"}</p>
                                                </div>
                                                <button className="text-msger-primary p-2 bg-msger-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MessageCircle size={18} />
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}
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
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center"
                        onClick={() => setShowNewChat(false)}
                    >
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            className="bg-msger-bg w-full md:max-w-md h-full md:h-[80vh] flex flex-col border-r border-msger-border shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 bg-msger-primary-gradient text-white flex items-center gap-4">
                                <button onClick={() => { setShowNewChat(false); setShowNewGroup(false); }} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                    <ArrowLeft />
                                </button>
                                <h2 className="font-bold text-xl">{showNewGroup ? "New Group" : "New Message"}</h2>
                            </div>

                            {!showNewGroup ? (
                                <>
                                    <div className="p-3">
                                        <button
                                            onClick={() => setShowNewGroup(true)}
                                            className="w-full p-4 hover:bg-msger-hover flex items-center gap-4 transition-all rounded-xl border border-msger-border"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-msger-primary-gradient text-white flex items-center justify-center shadow-lg">
                                                <Users size={24} />
                                            </div>
                                            <span className="font-semibold text-msger-text">Create a Group</span>
                                        </button>
                                    </div>

                                    <div className="px-6 py-4 text-msger-text-dim font-bold uppercase text-xs tracking-widest">
                                        Suggested
                                    </div>

                                    <div className="flex-1 overflow-y-auto no-scrollbar">
                                        {users.map(u => (
                                            <div
                                                key={u.uid}
                                                onClick={() => startDirectChat(u)}
                                                className="px-6 py-4 flex items-center gap-4 hover:bg-msger-hover cursor-pointer transition-all border-b border-msger-border"
                                            >
                                                <div className="chat-avatar shrink-0">
                                                    <img src={u.photoURL || "https://ui-avatars.com/api/?name=" + (u.displayName || "User")} className="w-full h-full rounded-full object-cover" alt="U" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-msger-text">{u.displayName || "Unnamed User"}</h4>
                                                    <p className="text-sm text-msger-text-dim truncate">{u.email}</p>
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

            {/* Call Overlay */}
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
        <div className="flex-1 flex flex-col overflow-hidden bg-msger-bg">
            <div className="p-6 border-b border-msger-border">
                <input
                    type="text"
                    placeholder="Group Name"
                    className="w-full bg-msger-hover rounded-xl px-4 py-3 outline-none text-lg text-msger-text placeholder:text-msger-text-dim transition-all focus:ring-2 focus:ring-msger-primary"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                />
            </div>
            <div className="p-4 text-xs font-bold text-msger-text-dim uppercase tracking-widest">
                Select Participants ({selectedUsers.length})
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {users.map(u => (
                    <div
                        key={u.uid}
                        onClick={() => toggleUser(u.uid)}
                        className={`p-4 flex items-center justify-between hover:bg-msger-hover cursor-pointer transition-colors border-b border-msger-border ${selectedUsers.includes(u.uid) ? 'bg-msger-active' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="chat-avatar shrink-0 border border-msger-border">
                                <img src={u.photoURL || "https://ui-avatars.com/api/?name=" + (u.displayName || "User")} className="w-full h-full rounded-full object-cover" alt="U" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-msger-text">{u.displayName || "Unnamed User"}</h4>
                                <p className="text-sm text-msger-text-dim">{u.email}</p>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedUsers.includes(u.uid) ? 'bg-msger-primary border-msger-primary' : 'border-msger-text-dim'}`}>
                            {selectedUsers.includes(u.uid) && <Plus size={16} className="text-white" />}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-6 border-t border-msger-border bg-msger-sidebar flex justify-center">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    disabled={!groupName.trim() || selectedUsers.length === 0}
                    onClick={() => onCreate(groupName, selectedUsers)}
                    className="w-full py-4 bg-msger-primary-gradient text-white rounded-xl shadow-xl font-bold disabled:opacity-50 transition-all"
                >
                    Create Group
                </motion.button>
            </div>
        </div>
    );
}
