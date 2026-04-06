import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { auth, db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { notificationService } from "../../services/notificationService";
import { Bell, Check, Users, MessageCircle, FileText, Heart, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { presenceService } from "../../services/presenceService";
import { motion, AnimatePresence } from "framer-motion";
import "./Navbar.css";

export default function Navbar() {
    const { user, isAdmin, isInstructor, siteSettings } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifiedIds, setNotifiedIds] = useState(new Set());

    useEffect(() => {
        if (!user) return;

        notificationService.requestPermission();

        const unsubscribe = notificationService.subscribeToNotifications(user.uid, async (notifs, count, newUnreadIds) => {
            setNotifications(notifs);
            setUnreadCount(count);

            // Trigger Desktop Notification for new unread notifications
            for (const notif of notifs) {
                if (!notif.read && !notifiedIds.has(notif.id)) {
                    // Fetch user info for the notification if needed
                    let senderName = "Someone";
                    if (notif.fromUserId) {
                        try {
                            const userDoc = await getDoc(doc(db, "users", notif.fromUserId));
                            if (userDoc.exists()) senderName = userDoc.data().displayName || "Someone";
                        } catch (e) { }
                    }

                    notificationService.showNotification(`GlobixTech Notification`, {
                        body: notif.message || `New ${notif.type} notification`
                    });
                    
                    setNotifiedIds(prev => {
                        const next = new Set(prev);
                        next.add(notif.id);
                        return next;
                    });
                }
            }
        });

        return () => unsubscribe();
    }, [user, notifiedIds]);

    const handleNotificationClick = async (notif) => {
        if (!notif.read) {
            await notificationService.markAsRead(notif.id);
        }
        setShowNotifications(false);
        if (notif.link) {
            navigate(notif.link);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'message': return <MessageCircle size={16} className="text-blue-500" />;
            case 'follow': return <Users size={16} className="text-purple-500" />;
            case 'friend_request': return <Users size={16} className="text-green-500" />;
            case 'blog': return <FileText size={16} className="text-orange-500" />;
            case 'like': return <Heart size={16} className="text-red-500" />;
            default: return <Bell size={16} className="text-gray-500" />;
        }
    };

    // Hide navbar on auth pages, Chat, Reels, and Dashboards
    const hiddenPaths = ["/login", "/register", "/forgot-password", "/chat", "/reels"];
    if (hiddenPaths.includes(location.pathname) || location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin") || location.pathname.startsWith("/instructor")) return null;

    const handleLogout = async () => {
        try {
            if (user) await presenceService.setOffline(user.uid);
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/home" className="navbar-logo">
                    <img src="/GlobixTech-logo.png" alt="Globix Tech" />
                    <h5>{siteSettings?.siteName || "GTE Portal"}</h5>
                </Link>

                <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? "✕" : "☰"}
                </button>

                <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
                    <Link to="/home" className={isActive("/home")} onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/courses" className={isActive("/courses")} onClick={() => setMenuOpen(false)}>Courses</Link>
                    <Link to="/pricing" className={isActive("/pricing")} onClick={() => setMenuOpen(false)}>Pricing</Link>
                    <Link to="/blog" className={isActive("/blog")} onClick={() => setMenuOpen(false)}>Blog</Link>
                    <Link to="/about" className={isActive("/about")} onClick={() => setMenuOpen(false)}>About</Link>
                    <Link to="/contact" className={isActive("/contact")} onClick={() => setMenuOpen(false)}>Contact</Link>
                    {user && (
                        <>
                            <Link to="/discover" className={isActive("/discover")} onClick={() => setMenuOpen(false)}>Discover</Link>
                            <Link to="/reels" className={isActive("/reels")} onClick={() => setMenuOpen(false)}>Reels</Link>
                            <Link to="/leaderboard" className={isActive("/leaderboard")} onClick={() => setMenuOpen(false)}>Leaderboard</Link>
                            <Link to="/dashboard" className={isActive("/dashboard")} onClick={() => setMenuOpen(false)}>Dashboard</Link>
                        </>
                    )}
                    {isAdmin && (
                        <Link to="/admin" className={isActive("/admin")} onClick={() => setMenuOpen(false)}>Admin</Link>
                    )}
                    {(isInstructor || isAdmin) && (
                        <Link to="/instructor" className={isActive("/instructor")} onClick={() => setMenuOpen(false)}>Instructor</Link>
                    )}
                </div>

                <div className="navbar-actions">
                    {user ? (
                        <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
                            <div 
                                className="relative mr-2 cursor-pointer text-gray-300 hover:text-white transition-colors" 
                                title="Notifications"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-slate-900 animate-pulse">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </div>

                            {/* WhatsApp Style Notification Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="notification-dropdown absolute top-full right-0 mt-3 w-80 sm:w-96 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50 shadow-blue-500/10"
                                    >
                                        <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                                <Bell size={18} className="text-blue-400" /> Notifications
                                            </h3>
                                            {notifications.length > 0 && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        notificationService.clearAll(user.uid, notifications);
                                                    }}
                                                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 font-bold underline underline-offset-4"
                                                >
                                                    <X size={14} /> Empty Tray
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto no-scrollbar bg-slate-800/80">
                                            {notifications.length === 0 ? (
                                                <div className="p-10 text-center text-slate-400 flex flex-col items-center">
                                                    <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                                                        <Bell size={32} className="opacity-20" />
                                                    </div>
                                                    <p className="font-medium">All quiet on the front</p>
                                                    <span className="text-xs opacity-50">No new intel received.</span>
                                                </div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div 
                                                        key={notif.id} 
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className={`p-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/50 transition-all flex gap-3 items-start ${!notif.read ? 'bg-blue-500/5 relative group' : 'opacity-70 hover:opacity-100'}`}
                                                    >
                                                        {!notif.read && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full"></div>}
                                                        <div className={`p-2 rounded-lg shrink-0 ${!notif.read ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-900 text-slate-500'}`}>
                                                            {getNotificationIcon(notif.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm ${!notif.read ? 'text-white font-semibold' : 'text-slate-300'} line-clamp-2`}>
                                                                {notif.message}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                                    {notif.timestamp ? formatDistanceToNow(notif.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                                                                </span>
                                                                {!notif.read && <span className="w-1 h-1 rounded-full bg-blue-500"></span>}
                                                            </div>
                                                        </div>
                                                        {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 group-hover:scale-125 transition-transform"></div>}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {notifications.length > 0 && (
                                            <div className="p-3 bg-slate-900/50 border-t border-slate-700 text-center">
                                                <Link to="/dashboard" className="text-xs text-slate-400 hover:text-white font-bold uppercase tracking-widest transition-colors">
                                                    View All Intel
                                                </Link>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Link to={`/profile/${user.uid}`} className="flex items-center gap-2 group">
                                <img
                                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email.split('@')[0]}&background=0D8ABC&color=fff`}
                                    alt="User Avatar"
                                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }}
                                    className="navbar-avatar group-hover:border-blue-500 transition-all shadow-lg"
                                />
                                <span className="user-email hidden sm:block font-bold text-gray-300 group-hover:text-white transition-colors">
                                    {user.displayName || user.email.split("@")[0]}
                                </span>
                            </Link>
                            <button onClick={handleLogout} className="btn-nav-outline ml-2">Sign Out</button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-nav-primary">Sign In</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
