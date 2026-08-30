import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";
import { notificationService } from "../../services/notificationService";
import {
  Bell, Users, MessageCircle, FileText, Heart, X,
  Menu, ChevronDown, LogOut, LayoutDashboard,
  BookOpen, Info, DollarSign, Rss, Mail, Compass,
  Film, Trophy, MessageSquare, Home
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { presenceService } from "../../services/presenceService";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../common/Avatar";

const NAV_LINKS = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/pricing", label: "Pricing", icon: DollarSign },
  { to: "/blog", label: "Blog", icon: Rss },
  { to: "/about", label: "About", icon: Info },
  { to: "/contact", label: "Contact", icon: Mail },
];

const AUTH_LINKS = [
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/chat", label: "Live Comms", icon: MessageSquare },
];

export default function Navbar() {
  const { user, role, isAdmin, isInstructor, siteSettings } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const notifiedIdsRef = useRef(new Set());

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Notifications subscription
  useEffect(() => {
    if (!user) return;
    notificationService.requestPermission();
    const unsub = notificationService.subscribeToNotifications(user.uid, (notifs, count) => {
      setNotifications(notifs);
      setUnreadCount(count);
      for (const notif of notifs) {
        if (!notif.read && !notifiedIdsRef.current.has(notif.id)) {
          notifiedIdsRef.current.add(notif.id);
          notificationService.showNotification("GlobixTech", {
            body: notif.message || `New ${notif.type} notification`
          });
        }
      }
    });
    return () => unsub();
  }, [user]);

  // Hidden on auth/dashboard pages
  const hiddenPaths = ["/login", "/register", "/forgot-password", "/chat", "/reels"];
  if (
    hiddenPaths.includes(location.pathname) ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/instructor")
  ) return null;

  const handleLogout = async () => {
    try {
      if (user) await presenceService.setOffline(user.uid);
      await signOut(auth);
      navigate("/login");
    } catch (e) { console.error(e); }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) await notificationService.markAsRead(notif.id);
    setShowNotifications(false);
    if (notif.link) navigate(notif.link);
  };

  const getNotifIcon = (type) => {
    const map = {
      message: <MessageCircle size={14} style={{ color: '#60a5fa' }} />,
      follow: <Users size={14} style={{ color: '#a78bfa' }} />,
      friend_request: <Users size={14} style={{ color: '#34d399' }} />,
      blog: <FileText size={14} style={{ color: '#fb923c' }} />,
      like: <Heart size={14} style={{ color: '#f87171' }} />,
    };
    return map[type] || <Bell size={14} style={{ color: '#94a3b8' }} />;
  };

  const getDashConfig = () => {
    if (isAdmin) return { label: "Command Center", path: "/admin", badge: "ADMIN", color: "#f43f5e" };
    if (isInstructor) return { label: "Instructor Hub", path: "/instructor", badge: "INSTRUCTOR", color: "#818cf8" };
    if (role === "student") return { label: "Cadet Dashboard", path: "/dashboard", badge: "CADET", color: "#34d399" };
    return { label: "Dashboard", path: "/dashboard", badge: "OPERATIVE", color: "#60a5fa" };
  };

  const dash = getDashConfig();

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: isActive(path) ? 600 : 500,
    color: isActive(path) ? '#ffffff' : '#94a3b8',
    textDecoration: 'none',
    padding: '6px 2px',
    position: 'relative',
    transition: 'color 0.2s',
    borderBottom: isActive(path) ? '2px solid #3b82f6' : '2px solid transparent',
  });

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? 'rgba(8,12,20,0.97)' : 'rgba(8,12,20,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
      }}>
        <div style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '0 20px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>

          {/* ── Logo ── */}
          <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <img
              src="/GlobixTech-logo.png"
              alt="GTE"
              style={{ height: '32px', width: '32px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)' }}
            />
            <span style={{ fontWeight: 700, fontSize: '16px', color: '#fff', letterSpacing: '-0.3px' }}>
              {siteSettings?.siteName || "GTE Platform"}
            </span>
          </Link>

          {/* ── Desktop Nav Links (center) ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center' }} className="navbar-desktop-links">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} style={linkStyle(to)}
                onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.color = '#94a3b8'; }}
              >
                <span style={{ padding: '4px 10px', borderRadius: '8px' }}>{label}</span>
              </Link>
            ))}
            {user && AUTH_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} style={linkStyle(to)}
                onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.color = '#94a3b8'; }}
              >
                <span style={{ padding: '4px 10px', borderRadius: '8px' }}>{label}</span>
              </Link>
            ))}
          </div>

          {/* ── Right: Actions ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {user ? (
              <>
                {/* Dashboard pill */}
                <Link
                  to={dash.path}
                  className="navbar-desktop-links"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '5px 12px', borderRadius: '20px',
                    background: `${dash.color}18`, border: `1px solid ${dash.color}40`,
                    color: dash.color, fontSize: '12px', fontWeight: 700,
                    textDecoration: 'none', letterSpacing: '0.03em',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${dash.color}30`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${dash.color}18`; }}
                >
                  <LayoutDashboard size={13} /> {dash.badge}
                </Link>

                {/* Bell notification */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    style={{
                      position: 'relative', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                      color: '#94a3b8', cursor: 'pointer', padding: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                        color: '#fff', fontSize: '10px', fontWeight: 800,
                        width: '17px', height: '17px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid #080c14',
                      }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                          width: '340px', background: 'rgba(15,20,35,0.98)',
                          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden',
                          backdropFilter: 'blur(24px)',
                        }}
                      >
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Bell size={14} style={{ color: '#60a5fa' }} /> Notifications
                          </span>
                          {notifications.length > 0 && (
                            <button onClick={() => notificationService.clearAll(user.uid, notifications)}
                              style={{ fontSize: '11px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                              Clear All
                            </button>
                          )}
                        </div>
                        <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                          {notifications.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                              <Bell size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                              <p style={{ fontSize: '12px', margin: 0 }}>No new notifications</p>
                            </div>
                          ) : notifications.map(n => (
                            <div key={n.id} onClick={() => handleNotifClick(n)}
                              style={{
                                padding: '12px 16px', cursor: 'pointer',
                                background: !n.read ? 'rgba(59,130,246,0.08)' : 'transparent',
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                display: 'flex', gap: '10px', alignItems: 'flex-start',
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = !n.read ? 'rgba(59,130,246,0.08)' : 'transparent'; }}
                            >
                              <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', flexShrink: 0 }}>
                                {getNotifIcon(n.type)}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontSize: '12px', color: n.read ? '#94a3b8' : '#e2e8f0', fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                                <span style={{ fontSize: '10px', color: '#475569' }}>
                                  {n.timestamp ? formatDistanceToNow(n.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                          <Link to="/dashboard/inbox" onClick={() => setShowNotifications(false)}
                            style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
                            View All →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Avatar */}
                <Link to={`/profile/${user.uid}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '4px', borderRadius: '12px' }}>
                  <Avatar src={user.photoURL} name={user.displayName || user.email} size="small" />
                  <span className="navbar-desktop-links" style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                </Link>

                {/* Sign out */}
                <button
                  onClick={handleLogout}
                  className="navbar-desktop-links"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px', color: '#94a3b8', fontSize: '13px',
                    fontWeight: 500, cursor: 'pointer', padding: '6px 12px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', textDecoration: 'none', padding: '6px 12px', transition: 'color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; }}
                >
                  Sign In
                </Link>
                <Link to="/register" style={{
                  fontSize: '13px', fontWeight: 700, color: '#fff', textDecoration: 'none',
                  padding: '7px 18px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  boxShadow: '0 2px 12px rgba(59,130,246,0.35)',
                  transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  Get Started
                </Link>
              </>
            )}

            {/* ── Hamburger ── */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="navbar-hamburger"
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', color: '#fff', cursor: 'pointer',
                padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 998,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              }}
            />
            {/* Drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 999,
                width: 'min(300px, 85vw)',
                background: 'rgba(8,12,20,0.98)',
                backdropFilter: 'blur(24px)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto',
              }}
            >
              {/* Drawer header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/home" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <img src="/GlobixTech-logo.png" alt="GTE" style={{ height: '28px', width: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>{siteSettings?.siteName || "GTE Platform"}</span>
                </Link>
                <button onClick={() => setMenuOpen(false)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer', padding: '6px', display: 'flex' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Nav links */}
              <div style={{ padding: '12px 16px', flex: 1 }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px 4px' }}>Navigation</p>
                {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '11px 14px', borderRadius: '10px', textDecoration: 'none',
                      marginBottom: '2px',
                      background: isActive(to) ? 'rgba(59,130,246,0.15)' : 'transparent',
                      color: isActive(to) ? '#60a5fa' : '#94a3b8',
                      fontWeight: isActive(to) ? 600 : 500,
                      fontSize: '14px',
                      transition: 'all 0.15s',
                      borderLeft: isActive(to) ? '3px solid #3b82f6' : '3px solid transparent',
                    }}
                  >
                    <Icon size={16} /> {label}
                  </Link>
                ))}

                {user && (
                  <>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '16px 0 8px 4px' }}>Community</p>
                    {AUTH_LINKS.map(({ to, label, icon: Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '11px 14px', borderRadius: '10px', textDecoration: 'none',
                          marginBottom: '2px',
                          background: isActive(to) ? 'rgba(59,130,246,0.15)' : 'transparent',
                          color: isActive(to) ? '#60a5fa' : '#94a3b8',
                          fontWeight: isActive(to) ? 600 : 500,
                          fontSize: '14px',
                          transition: 'all 0.15s',
                          borderLeft: isActive(to) ? '3px solid #3b82f6' : '3px solid transparent',
                        }}
                      >
                        <Icon size={16} /> {label}
                      </Link>
                    ))}

                    {/* Dashboard link */}
                    <Link
                      to={dash.path}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '11px 14px', borderRadius: '10px', textDecoration: 'none',
                        marginTop: '8px',
                        background: `${dash.color}15`,
                        color: dash.color,
                        fontWeight: 700, fontSize: '14px',
                        border: `1px solid ${dash.color}30`,
                      }}
                    >
                      <LayoutDashboard size={16} /> {dash.label}
                      <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: `${dash.color}20`, border: `1px solid ${dash.color}40` }}>
                        {dash.badge}
                      </span>
                    </Link>
                  </>
                )}
              </div>

              {/* Drawer footer */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {user ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Link to={`/profile/${user.uid}`} onClick={() => setMenuOpen(false)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                      <Avatar src={user.photoURL} name={user.displayName || user.email} size="small" />
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{user.displayName || user.email?.split("@")[0]}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{user.email}</p>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link to="/login" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Navbar CSS */}
      <style>{`
        .navbar-desktop-links { display: flex !important; }
        .navbar-hamburger { display: none !important; }
        @media (max-width: 900px) {
          .navbar-desktop-links { display: none !important; }
          .navbar-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
