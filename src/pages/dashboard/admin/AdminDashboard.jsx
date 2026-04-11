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
  const [instructorsCount, setInstructorsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [reelsCount, setReelsCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [certificatesCount, setCertificatesCount] = useState(0);
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
        const [
          usersSnapshot,
          coursesSnapshot,
          postsSnapshot,
          instructorsSnapshot,
          quizzesSnapshot,
          reelsSnapshot,
          tasksSnapshot,
          certificatesSnapshot
        ] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "courses")),
          getDocs(collection(db, "posts")),
          getDocs(collection(db, "instructors")),
          getDocs(collection(db, "quizzes")),
          getDocs(collection(db, "reels")),
          getDocs(collection(db, "tasks")),
          getDocs(collection(db, "certificates"))
        ]);

        setUsersCount(usersSnapshot.size);
        setCoursesCount(coursesSnapshot.size);
        setPostsCount(postsSnapshot.size);
        setInstructorsCount(instructorsSnapshot.size);
        setQuizzesCount(quizzesSnapshot.size);
        setReelsCount(reelsSnapshot.size);
        setTasksCount(tasksSnapshot.size);
        setCertificatesCount(certificatesSnapshot.size);
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
    const activeClass = location.pathname === path || location.pathname.startsWith(`${path}/`) ? " active" : "";
    return `${baseClass}${activeClass}`;
  };

  const isOverview = location.pathname === "/admin";

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

        <Link to="/home" className="ad-brand">
          <span className="ad-nav-icon">🛡️</span>
          {sidebarOpen && <span>Admin <b>Panel</b></span>}
        </Link>

        <nav className="ad-nav">
          {/* Overview */}
          <Link to="/admin" className={isActive("/admin")} onClick={handleNavClick}>
            <span className="ad-nav-icon">📊</span>
            {sidebarOpen && <span>Analytics</span>}
          </Link>

          {sidebarOpen && <div className="ad-nav-divider" />}

          {/* Management - All Features with CORRECT ROUTES */}
          <Link to="/admin/users" className={isActive("/admin/users")} onClick={handleNavClick}>
            <span className="ad-nav-icon">👥</span>
            {sidebarOpen && <span>Manage Users</span>}
          </Link>
          <Link to="/admin/instructors" className={isActive("/admin/instructors")} onClick={handleNavClick}>
            <span className="ad-nav-icon">🎓</span>
            {sidebarOpen && <span>Manage Instructors</span>}
          </Link>
          <Link to="/admin/manage-courses" className={isActive("/admin/manage-courses")} onClick={handleNavClick}>
            <span className="ad-nav-icon">📚</span>
            {sidebarOpen && <span>Manage Courses</span>}
          </Link>
          <Link to="/admin/manage-posts" className={isActive("/admin/manage-posts")} onClick={handleNavClick}>
            <span className="ad-nav-icon">📰</span>
            {sidebarOpen && <span>Manage Posts</span>}
          </Link>
          <Link to="/admin/manage-reels" className={isActive("/admin/manage-reels")} onClick={handleNavClick}>
            <span className="ad-nav-icon">🎬</span>
            {sidebarOpen && <span>Manage Reels</span>}
          </Link>
          <Link to="/admin/manage-quizzes" className={isActive("/admin/manage-quizzes")} onClick={handleNavClick}>
            <span className="ad-nav-icon">❓</span>
            {sidebarOpen && <span>Manage Quizzes</span>}
          </Link>
          <Link to="/admin/certificates" className={isActive("/admin/certificates")} onClick={handleNavClick}>
            <span className="ad-nav-icon">🏆</span>
            {sidebarOpen && <span>Manage Certificates</span>}
          </Link>
          <Link to="/admin/manage-tasks" className={isActive("/admin/manage-tasks")} onClick={handleNavClick}>
            <span className="ad-nav-icon">✅</span>
            {sidebarOpen && <span>Manage Tasks</span>}
          </Link>
          <Link to="/admin/mails" className={isActive("/admin/mails")} onClick={handleNavClick}>
            <span className="ad-nav-icon">📧</span>
            {sidebarOpen && <span>Manage Mails</span>}
          </Link>
          <Link to="/admin/economy" className={isActive("/admin/economy")} onClick={handleNavClick}>
            <span className="ad-nav-icon">💰</span>
            {sidebarOpen && <span>Manage Economy</span>}
          </Link>
          <Link to="/admin/manage-leadership" className={isActive("/admin/manage-leadership")} onClick={handleNavClick}>
            <span className="ad-nav-icon">👑</span>
            {sidebarOpen && <span>Manage Leadership</span>}
          </Link>
          <Link to="/admin/testimonies" className={isActive("/admin/testimonies")} onClick={handleNavClick}>
            <span className="ad-nav-icon">💬</span>
            {sidebarOpen && <span>Manage Testimonies</span>}
          </Link>
          <Link to="/admin/reports" className={isActive("/admin/reports")} onClick={handleNavClick}>
            <span className="ad-nav-icon">🛡️</span>
            {sidebarOpen && <span>Moderation</span>}
          </Link>

          {sidebarOpen && <div className="ad-nav-divider" />}

          {/* Create New */}
          <Link to="/admin/create-course" className={isActive("/admin/create-course")} onClick={handleNavClick}>
            <span className="ad-nav-icon">✨</span>
            {sidebarOpen && <span>New Course</span>}
          </Link>
          <Link to="/admin/create-post" className={isActive("/admin/create-post")} onClick={handleNavClick}>
            <span className="ad-nav-icon">🖋️</span>
            {sidebarOpen && <span>New Post</span>}
          </Link>
          <Link to="/admin/create-quiz" className={isActive("/admin/create-quiz")} onClick={handleNavClick}>
            <span className="ad-nav-icon">📝</span>
            {sidebarOpen && <span>New Quiz</span>}
          </Link>

          {sidebarOpen && <div className="ad-nav-divider" />}

          {/* Settings */}
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
                <div className="ad-stat-icon">🎓</div>
                <div>
                  <p className="ad-stat-value">{instructorsCount}</p>
                  <p className="ad-stat-label">Instructors</p>
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
              <div className="ad-stat">
                <div className="ad-stat-icon">🎬</div>
                <div>
                  <p className="ad-stat-value">{reelsCount}</p>
                  <p className="ad-stat-label">Reels</p>
                </div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-icon">❓</div>
                <div>
                  <p className="ad-stat-value">{quizzesCount}</p>
                  <p className="ad-stat-label">Quizzes</p>
                </div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-icon">🏆</div>
                <div>
                  <p className="ad-stat-value">{certificatesCount}</p>
                  <p className="ad-stat-label">Certificates</p>
                </div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-icon">✅</div>
                <div>
                  <p className="ad-stat-value">{tasksCount}</p>
                  <p className="ad-stat-label">Tasks</p>
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
                <Link to="/admin/create-quiz" className="ad-btn-primary" style={{ textDecoration: 'none' }}>
                  📝 Create New Quiz
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
