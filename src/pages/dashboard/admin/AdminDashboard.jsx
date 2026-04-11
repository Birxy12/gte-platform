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
  const [postsCount, setPostsCount] = useState(0); // Corrected state for posts count
  const [error, setError] = useState(null);
  
  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
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
        setPostsCount(postsSnapshot.size); // Corrected this line
      } catch (err) {
        console.error("Error fetching analytics:", err);
        if (err.code === "permission-denied") {
          setError("Permission denied. Ensure Firestore rules from [implementation_plan.md] are applied.");
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
    return `${baseClass}${activeClass}`;
  };

  const isOverview = location.pathname === "/admin";

  // Close sidebar on mobile when clicking nav link
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // List of admin pages to be added
  const adminPages = [
    "AdminDashboard.css",
    "AdminDashboard.jsx",
    "AdminSettings.jsx",
    "CreateCourse.jsx",
    "CreatePost.jsx",
    "CreateQuiz.jsx",
    "EditCourse.jsx",
    "ManageCertificates.jsx",
    "ManageCourses.jsx",
    "ManageEconomy.jsx",
    "ManageInstructors.jsx",
    "ManageLeadership.jsx",
    "ManageMails.jsx",
    "ManagePosts.jsx",
    "ManageQuizzes.jsx",
    "ManageReels.jsx",
    "ManageReports.jsx",
    "ManageTasks.jsx",
    "ManageTestimonies.jsx",
    "ManageUsers.jsx",
  ];

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

        <Link to="/home" className="ad-brand">
          <span className="ad-nav-icon">🛡️</span>
          {sidebarOpen && <span>Admin <b>Panel</b></span>}
        </Link>

        <nav className="ad-nav">
          {/* Admin Pages List */}
          <div className="ad-nav-section">
            <h3 className="ad-nav-heading">Admin Pages</h3>
            {adminPages.map((page, index) => (
              <Link 
                key={index} 
                to={`/admin/${page.replace(".jsx", "").toLowerCase()}`} 
                className={isActive(`/admin/${page.replace(".jsx", "").toLowerCase()}`)} 
                onClick={handleNavClick}
              >
                <span className="ad-nav-icon">📄</span>
                {sidebarOpen && <span>{page}</span>}
              </Link>
            ))}
          </div>

          <Link to="/admin" className={isActive("/admin")} onClick={handleNavClick}>
            <span className="ad-nav-icon">📊</span>
            {sidebarOpen && <span>Analytics</span>}
          </Link>
          <Link to="/admin/users" className={isActive("/admin/users")} onClick={handleNavClick}>
            <span className="ad-nav-icon">👥</span>
            {sidebarOpen && <span>Manage Users</span>}
          </Link>
          <Link to="/admin/manage-courses" className={isActive("/admin/manage-courses")} onClick={handleNavClick}>
            <span className="ad-nav-icon">📚</span>
            {sidebarOpen && <span>Manage Courses</span>}
          </Link>

          {/* Additional Navigation Links */}
          <Link to="/admin/settings" className={isActive("/admin/settings")} onClick={handleNavClick}>
            <span className="ad-nav-icon">⚙️</span>
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </nav>

        <button onClick={handleLogout} className="ad-logout">
          <span className="ad-nav-icon">🚪</span>
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="ad-main">
        {isOverview ? (
          <>
            <div className="ad-page-header">
              <div className="ad-header-title">
                <h1>Dashboard Overview</h1>
                <p>Real-time analytics and platform performance</p>
              </div>
            </div>

            {/* Analytics Stats */}
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
          </>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}