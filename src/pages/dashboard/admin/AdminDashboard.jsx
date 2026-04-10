import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Menu, X } from "lucide-react"; // Uber-style hamburger icons
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [usersCount, setUsersCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [error, setError] = useState(null);
  
  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    const baseClass = "ad-nav-item";
    const activeClass = location.pathname === path ? " active" : "";
    const collapsedClass = sidebarCollapsed ? " collapsed" : "";
    return `${baseClass}${activeClass}${collapsedClass}`;
  };

  const isOverview = location.pathname === "/admin";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="admin-dash">
      {/* Mobile Header with Toggle */}
      <header className="ad-mobile-header">
        <button 
          className="ad-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="ad-mobile-brand">Admin Panel</span>
        <div style={{ width: 40 }} /> {/* Spacer for alignment */}
      </header>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div 
          className="ad-sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`ad-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Collapse Toggle Button (Desktop) */}
        <button
          className="ad-collapse-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>

        <Link to="/home" className={`ad-brand ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <span className="ad-nav-icon">🛡️</span>
          {!sidebarCollapsed && <span>Admin <b>Panel</b></span>}
        </Link>

        <nav className="ad-nav">
          <Link to="/admin" className={isActive("/admin")} title="Analytics">
            <span className="ad-nav-icon">📊</span>
            {!sidebarCollapsed && <span>Analytics</span>}
          </Link>
          <Link to="/admin/users" className={isActive("/admin/users")} title="Manage Users">
            <span className="ad-nav-icon">👥</span>
            {!sidebarCollapsed && <span>Manage Users</span>}
          </Link>
          <Link to="/admin/manage-courses" className={isActive("/admin/manage-courses")} title="Manage Courses">
            <span className="ad-nav-icon">📚</span>
            {!sidebarCollapsed && <span>Manage Courses</span>}
          </Link>
          <Link to="/admin/manage-posts" className={isActive("/admin/manage-posts")} title="Manage Posts">
            <span className="ad-nav-icon">📰</span>
            {!sidebarCollapsed && <span>Manage Posts</span>}
          </Link>
          <Link to="/admin/reports" className={isActive("/admin/reports")} title="Moderation">
            <span className="ad-nav-icon">🛡️</span>
            {!sidebarCollapsed && <span>Moderation</span>}
          </Link>
          
          {!sidebarCollapsed && (
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '1rem 0' }} />
          )}
          
          <Link to="/admin/create-course" className={isActive("/admin/create-course")} title="New Course">
            <span className="ad-nav-icon">✨</span>
            {!sidebarCollapsed && <span>New Course</span>}
          </Link>
          <Link to="/admin/create-post" className={isActive("/admin/create-post")} title="New Post">
            <span className="ad-nav-icon">🖋️</span>
            {!sidebarCollapsed && <span>New Post</span>}
          </Link>
          
          {!sidebarCollapsed && (
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '1rem 0' }} />
          )}
          
          <Link to="/admin/settings" className={isActive("/admin/settings")} title="Settings">
            <span className="ad-nav-icon">⚙️</span>
            {!sidebarCollapsed && <span>Settings</span>}
          </Link>
        </nav>

        <button 
          onClick={handleLogout} 
          className={`ad-logout ${sidebarCollapsed ? 'collapsed' : ''}`}
          title="Sign Out"
        >
          <span className="ad-nav-icon">🚪</span>
          {!sidebarCollapsed && <span>Sign Out</span>}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className={`ad-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {isOverview ? (
          <>
            <div className="ad-page-header">
              <div className="ad-header-title">
                <h1>Dashboard Overview</h1>
                <p>Real-time analytics and platform performance</p>
              </div>
            </div>

            {error && (
              <div className="ad-card" style={{ border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
                <p style={{ color: '#fca5a5', margin: 0, fontSize: '0.9rem' }}>⚠️ {error}</p>
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
                <Link to="/admin/create-course" className="ad-btn-primary" style={{ textDecoration: 'none' }}>
                  ➕ Create New Course
                </Link>
                <Link to="/admin/create-post" className="ad-btn-primary" style={{ textDecoration: 'none' }}>
                  ✍ Write New Blog Post
                </Link>
                <Link to="/admin/users" className="ad-btn-secondary" style={{ textDecoration: 'none' }}>
                  👥 Manage User Roles
                </Link>
              </div>
            </div>

            <div className="ad-card">
              <h3>System Status</h3>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Database: Online</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Storage: Online</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Auth Service: Online</span>
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
