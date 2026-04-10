import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [usersCount, setUsersCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [error, setError] = useState(null);
  
  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      // Auto-collapse on mobile, keep open on desktop
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const coursesSnapshot = await getDocs(collection(db, "courses"));
        const postsSnapshot = await getDocs(collection(db, "posts"));

        setUsersCount(usersSnapshot.size);
        setCoursesCount(coursesSnapshot.size);
        setPostsCount(postsSnapshot.size);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        if (err.code === "permission-denied") {
          setError("Permission denied. Check Firestore rules.");
        }
      }
    };
    fetchAnalytics();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isActive = (path) => {
    const isCurrent = location.pathname === path;
    return `ad-nav-item ${isCurrent ? 'active' : ''}`;
  };

  const isOverview = location.pathname === "/admin";

  // Close sidebar when clicking nav link on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`admin-dash ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Mobile Header */}
      <header className="ad-mobile-header">
        <button 
          className="ad-menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="ad-mobile-brand">Admin Panel</span>
        <div style={{ width: 40 }} />
      </header>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="ad-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`ad-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {/* Desktop Toggle Button */}
        {!isMobile && (
          <button
            className="ad-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        )}

        {/* Brand */}
        <Link 
          to="/home" 
          className="ad-brand"
          onClick={handleNavClick}
        >
          <span className="ad-brand-icon">🛡️</span>
          <span className="ad-brand-text">Admin <b>Panel</b></span>
        </Link>

        {/* Navigation */}
        <nav className="ad-nav">
          <Link to="/admin" className={isActive("/admin")} onClick={handleNavClick}>
            <span className="ad-nav-icon">📊</span>
            <span className="ad-nav-text">Analytics</span>
          </Link>
          <Link to="/admin/users" className={isActive("/admin/users")} onClick={handleNavClick}>
            <span className="ad-nav-icon">👥</span>
            <span className="ad-nav-text">Manage Users</span>
          </Link>
          <Link to="/admin/manage-courses" className={isActive("/admin/manage-courses")} onClick={handleNavClick}>
            <span className="ad-nav-icon">📚</span>
            <span className="ad-nav-text">Manage Courses</span>
          </Link>
          <Link to="/admin/manage-posts" className={isActive("/admin/manage-posts")} onClick={handleNavClick}>
            <span className="ad-nav-icon">📰</span>
            <span className="ad-nav-text">Manage Posts</span>
          </Link>
          <Link to="/admin/reports" className={isActive("/admin/reports")} onClick={handleNavClick}>
            <span className="ad-nav-icon">🛡️</span>
            <span className="ad-nav-text">Moderation</span>
          </Link>
          
          <div className="ad-nav-divider" />
          
          <Link to="/admin/create-course" className={isActive("/admin/create-course")} onClick={handleNavClick}>
            <span className="ad-nav-icon">✨</span>
            <span className="ad-nav-text">New Course</span>
          </Link>
          <Link to="/admin/create-post" className={isActive("/admin/create-post")} onClick={handleNavClick}>
            <span className="ad-nav-icon">🖋️</span>
            <span className="ad-nav-text">New Post</span>
          </Link>
          
          <div className="ad-nav-divider" />
          
          <Link to="/admin/settings" className={isActive("/admin/settings")} onClick={handleNavClick}>
            <span className="ad-nav-icon">⚙️</span>
            <span className="ad-nav-text">Settings</span>
          </Link>
        </nav>

        {/* Logout */}
        <button 
          onClick={handleLogout} 
          className="ad-logout"
        >
          <span className="ad-nav-icon">🚪</span>
          <span className="ad-nav-text">Sign Out</span>
        </button>
      </aside>

      {/* Main Content - Expands to fill screen when sidebar closed */}
      <main className="ad-main">
        {isOverview ? (
          <>
            <div className="ad-page-header">
              <div className="ad-header-title">
                <h1>Dashboard Overview</h1>
                <p>Real-time analytics and platform performance</p>
              </div>
            </div>

            {error && (
              <div className="ad-card ad-error">
                <p>⚠️ {error}</p>
              </div>
            )}
            
            <div className="ad-stats">
              <div className="ad-stat">
                <div className="ad-stat-icon">👥</div>
                <div>
                  <p className="ad-stat-value">{usersCount}</p>
                  <p className="ad-stat-label">Total Users</p>
                </div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-icon">📚</div>
                <div>
                  <p className="ad-stat-value">{coursesCount}</p>
                  <p className="ad-stat-label">Total Courses</p>
                </div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-icon">📰</div>
                <div>
                  <p className="ad-stat-value">{postsCount}</p>
                  <p className="ad-stat-label">Blog Posts</p>
                </div>
              </div>
            </div>

            <div className="ad-card">
              <h3>Quick Actions</h3>
              <div className="ad-btn-row">
                <Link to="/admin/create-course" className="ad-btn-primary">
                  ➕ Create New Course
                </Link>
                <Link to="/admin/create-post" className="ad-btn-primary">
                  ✍ Write New Blog Post
                </Link>
                <Link to="/admin/users" className="ad-btn-secondary">
                  👥 Manage User Roles
                </Link>
              </div>
            </div>

            <div className="ad-card">
              <h3>System Status</h3>
              <div className="ad-status-row">
                <div className="ad-status-item">
                  <div className="ad-status-dot online" />
                  <span>Database: Online</span>
                </div>
                <div className="ad-status-item">
                  <div className="ad-status-dot online" />
                  <span>Storage: Online</span>
                </div>
                <div className="ad-status-item">
                  <div className="ad-status-dot online" />
                  <span>Auth Service: Online</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
