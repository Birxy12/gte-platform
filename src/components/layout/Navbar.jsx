import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";
import { notificationService } from "../../services/notificationService";
import { Bell } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
    const { user, isAdmin } = useAuth();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifiedMessages, setNotifiedMessages] = useState(new Set());

    useEffect(() => {
        if (!user) return;

        notificationService.requestPermission();

        const unsubscribe = notificationService.subscribeToUnread(user.uid, (count, latestMessageMap) => {
            setUnreadCount(count);

            // Trigger Desktop Notification for new unique messages
            latestMessageMap.forEach((msgInfo, chatId) => {
                const uniqueKey = `${chatId}_${msgInfo.time}`;
                if (!notifiedMessages.has(uniqueKey)) {
                    notificationService.showNotification(`New message from ${msgInfo.sender}`, {
                        body: msgInfo.text
                    });
                    setNotifiedMessages(prev => new Set(prev).add(uniqueKey));
                }
            });
        });

        return () => unsubscribe();
    }, [user, notifiedMessages]);

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
                    <h5>GTE Portal</h5>
                </Link>

                <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? "✕" : "☰"}
                </button>

                <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
                    <Link to="/home" className={isActive("/home")} onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/courses" className={isActive("/courses")} onClick={() => setMenuOpen(false)}>Courses</Link>
                    <Link to="/blog" className={isActive("/blog")} onClick={() => setMenuOpen(false)}>Blog</Link>
                    <Link to="/about" className={isActive("/about")} onClick={() => setMenuOpen(false)}>About</Link>
                    <Link to="/contact" className={isActive("/contact")} onClick={() => setMenuOpen(false)}>Contact</Link>
                    {user && (
                        <>
                            <Link to="/discover" className={isActive("/discover")} onClick={() => setMenuOpen(false)}>Discover</Link>
                            <Link to="/dashboard" className={isActive("/dashboard")} onClick={() => setMenuOpen(false)}>Dashboard</Link>
                        </>
                    )}
                    {isAdmin && (
                        <Link to="/admin" className={isActive("/admin")} onClick={() => setMenuOpen(false)}>Admin</Link>
                    )}
                </div>

                <div className="navbar-actions">
                    {user ? (
                        <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="relative mr-2 cursor-pointer text-gray-300 hover:text-white transition-colors" title="Notifications">
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-slate-900">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
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
