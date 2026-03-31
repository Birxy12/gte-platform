import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { auth, db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { notificationService } from "../../services/notificationService";
import { Bell, Check, Users, MessageCircle, FileText, Heart, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import "./Navbar.css";

export default function Navbar() {
    const { user, isAdmin, siteSettings } = useAuth();
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

    // Hide navbar on auth pages, Chat, and Dashboards
    const hiddenPaths = ["/login", "/register", "/forgot-password", "/chat"];
    if (hiddenPaths.includes(location.pathname) || location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin")) return null;

    const handleLogout = async () => {
        try {
            await signOut(auth);
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
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-slate-900">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </div>

                            {/* WhatsApp Style Notification Dropdown */}
                            {showNotifications && (
                                <div className="notification-dropdown absolute top-full right-0 mt-3 w-80 sm:w-96 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50 animate-in slide-in-from-top-2">
                                    <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                                        <h3 className="font-bold text-white text-lg">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    notificationService.markAllAsRead(user.uid, notifications);
                                                }}
                                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                            >
                                                <Check size={14} /> Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto no-scrollbar bg-slate-800/80">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                                                <Bell size={40} className="opacity-20 mb-3" />
                                                <p>No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div 
                                                    key={notif.id} 
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={`p-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700 transition-colors flex gap-3 items-start ${!notif.read ? 'bg-slate-700/30 relative' : 'opacity-80'}`}
                                                >
                                                    {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                                                    <div className="p-2 rounded-full bg-slate-900 shrink-0">
                                                        {getNotificationIcon(notif.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm ${!notif.read ? 'text-white font-medium' : 'text-slate-300'} line-clamp-2`}>
                                                            {notif.message}
                                                        </p>
                                                        <span className="text-[10px] text-slate-500 font-medium mt-1 block uppercase tracking-wider">
                                                            {notif.timestamp ? formatDistanceToNow(notif.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                                                        </span>
                                                    </div>
                                                    {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                            <img
                                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email.split('@')[0]}&background=0D8ABC&color=fff`}
                                alt="User Avatar"
                                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }}
                                className="navbar-avatar"
                            />
                            <span className="user-email hidden sm:block">
                                {user.displayName || user.email.split("@")[0]}
                            </span>
                            <button onClick={handleLogout} className="btn-nav-outline">Sign Out</button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-nav-primary">Sign In</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
