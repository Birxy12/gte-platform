import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthProvider";
import { notificationService } from "../../../services/notificationService";
import { socialService } from "../../../services/socialService";
import { 
    Bell, 
    Users, 
    MessageCircle, 
    FileText, 
    Video, 
    TrendingUp, 
    Target, 
    Coins, 
    Check, 
    X, 
    Trash2, 
    Clock, 
    ShieldCheck,
    ChevronRight,
    AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import "./Inbox.css";

export default function Inbox() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = notificationService.subscribeToNotifications(user.uid, (notifs) => {
            setNotifications(notifs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleAcceptFriend = async (notif) => {
        try {
            await socialService.acceptFriendRequest(notif.fromUserId, user.uid);
            await notificationService.markAsRead(notif.id);
            // The notification might be deleted by socialService or we just mark it as read
        } catch (err) {
            console.error("Failed to accept friend request:", err);
        }
    };

    const handleMarkRead = async (id) => {
        await notificationService.markAsRead(id);
    };

    const handleClearAll = async () => {
        if (window.confirm("CONFIRM: Clear all intel from tray?")) {
            await notificationService.clearAll(user.uid, notifications);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'friend_request': return <Users size={18} className="text-green-400" />;
            case 'chat': case 'message': return <MessageCircle size={18} className="text-blue-400" />;
            case 'reels': return <Video size={18} className="text-purple-400" />;
            case 'blog': return <FileText size={18} className="text-orange-400" />;
            case 'price_change': return <TrendingUp size={18} className="text-yellow-400" />;
            case 'mission': return <Target size={18} className="text-red-400" />;
            case 'wallet': case 'coins': return <Coins size={18} className="text-emerald-400" />;
            default: return <Bell size={18} className="text-slate-400" />;
        }
    };

    const getCategory = (type) => {
        if (type === 'friend_request') return 'squad';
        if (['chat', 'message'].includes(type)) return 'comms';
        if (['mission', 'course_added', 'blog'].includes(type)) return 'missions';
        if (['wallet', 'coins', 'price_change'].includes(type)) return 'logistics';
        return 'intel';
    };

    const filteredNotifs = notifications.filter(n => {
        if (filter === 'all') return true;
        return getCategory(n.type) === filter;
    });

    return (
        <div className="inbox-container">
            <header className="inbox-header">
                <div className="header-intel">
                    <h1><ShieldCheck className="inline-block mr-2 text-blue-500" /> COMMS CENTER</h1>
                    <p className="text-slate-400 text-sm">Secure Intelligence Briefing & Operational Updates</p>
                </div>
                <button className="clear-tray-btn" onClick={handleClearAll} disabled={notifications.length === 0}>
                    <Trash2 size={16} /> CLEAR TRAY
                </button>
            </header>

            <nav className="inbox-nav">
                <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>ALL INTEL</button>
                <button className={filter === 'squad' ? 'active' : ''} onClick={() => setFilter('squad')}>SQUAD</button>
                <button className={filter === 'comms' ? 'active' : ''} onClick={() => setFilter('comms')}>COMMS</button>
                <button className={filter === 'missions' ? 'active' : ''} onClick={() => setFilter('missions')}>MISSIONS</button>
                <button className={filter === 'logistics' ? 'active' : ''} onClick={() => setFilter('logistics')}>LOGISTICS</button>
            </nav>

            <div className="inbox-content no-scrollbar">
                {loading ? (
                    <div className="inbox-loading">
                        <div className="scanner"></div>
                        <p>SCANNING FOR SECURE SIGNALS...</p>
                    </div>
                ) : filteredNotifs.length === 0 ? (
                    <div className="inbox-empty">
                        <AlertCircle size={48} className="opacity-20 mb-4" />
                        <h3>ALL QUIET ON THE FRONT</h3>
                        <p>No active intel found for this sector.</p>
                    </div>
                ) : (
                    <div className="notif-list">
                        <AnimatePresence mode="popLayout">
                            {filteredNotifs.map((notif) => (
                                <motion.div 
                                    key={notif.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`notif-card ${!notif.read ? 'unread' : ''}`}
                                    onClick={() => !notif.read && handleMarkRead(notif.id)}
                                >
                                    <div className="notif-icon-wrapper">
                                        {getIcon(notif.type)}
                                        {!notif.read && <span className="unread-dot"></span>}
                                    </div>
                                    
                                    <div className="notif-body">
                                        <div className="notif-meta">
                                            <span className="notif-category">{getCategory(notif.type).toUpperCase()}</span>
                                            <span className="notif-time">
                                                <Clock size={10} className="inline mr-1" />
                                                {notif.timestamp ? formatDistanceToNow(notif.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                                            </span>
                                        </div>
                                        <p className="notif-message">{notif.message}</p>
                                        
                                        {notif.type === 'friend_request' && (
                                            <div className="notif-actions" onClick={e => e.stopPropagation()}>
                                                <button className="btn-accept" onClick={() => handleAcceptFriend(notif)}>
                                                    <Check size={14} /> ACCEPT SQUAD
                                                </button>
                                                <button className="btn-dismiss" onClick={() => handleMarkRead(notif.id)}>
                                                    DISMISS
                                                </button>
                                            </div>
                                        )}

                                        {notif.link && (
                                            <a href={notif.link} className="notif-link">
                                                CONTINUE MISSION <ChevronRight size={14} />
                                            </a>
                                        )}
                                    </div>

                                    <div className="notif-status">
                                        {!notif.read && <div className="pulse-indicator"></div>}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
