import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Mail,
  CheckSquare,
  MessageSquare,
  Award,
  DollarSign,
  Crown,
  Flag,
  Film,
  HelpCircle,
  PlusCircle,
  PenTool,
  Settings,
  LogOut
} from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [usersCount, setUsersCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [instructorsCount, setInstructorsCount] = useState(0);
  const [certificatesCount, setCertificatesCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [reelsCount, setReelsCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [mailsCount, setMailsCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
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
          certificatesSnapshot,
          quizzesSnapshot,
          reelsSnapshot,
          tasksSnapshot,
          mailsSnapshot,
          reportsSnapshot
        ] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "courses")),
          getDocs(collection(db, "posts")),
          getDocs(collection(db, "instructors")),
          getDocs(collection(db, "certificates")),
          getDocs(collection(db, "quizzes")),
          getDocs(collection(db, "reels")),
          getDocs(collection(db, "tasks")),
          getDocs(collection(db, "mails")),
          getDocs(collection(db, "reports"))
        ]);

        setUsersCount(usersSnapshot.size);
        setCoursesCount(coursesSnapshot.size);
        setPostsCount(postsSnapshot.size);
        setInstructorsCount(instructorsSnapshot.size);
        setCertificatesCount(certificatesSnapshot.size);
        setQuizzesCount(quizzesSnapshot.size);
        setReelsCount(reelsSnapshot.size);
        setTasksCount(tasksSnapshot.size);
        setMailsCount(mailsSnapshot.size);
        setReportsCount(reportsSnapshot.size);
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
    const isCurrent = location.pathname === path || location.pathname.startsWith(`${path}/`);
    return `ad-nav-item ${isCurrent ? 'active' : ''}`;
  };

  const isOverview = location.pathname === "/admin";

  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // ALL NAVIGATION ITEMS - Organized by category
  const dashboardNavItems = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  ];

  const managementNavItems = [
    { path: "/admin/users", label: "Manage Users", icon: <Users size={20} /> },
    { path: "/admin/instructors", label: "Manage Instructors", icon: <GraduationCap size={20} /> },
    { path: "/admin/manage-courses", label: "Manage Courses", icon: <BookOpen size={20} /> },
    { path: "/admin/manage-posts", label: "Manage Posts", icon: <FileText size={20} /> },
    { path: "/admin/manage-reels", label: "Manage Reels", icon: <Film size={20} /> },
    { path: "/admin/manage-quizzes", label: "Manage Quizzes", icon: <HelpCircle size={20} /> },
    { path: "/admin/manage-certificates", label: "Manage Certificates", icon: <Award size={20} /> },
    { path: "/admin/manage-tasks", label: "Manage Tasks", icon: <CheckSquare size={20} /> },
    { path: "/admin/manage-mails", label: "Manage Mails", icon: <Mail size={20} /> },
    { path: "/admin/manage-economy", label: "Manage Economy", icon: <DollarSign size={20} /> },
    { path: "/admin/manage-leadership", label: "Manage Leadership", icon: <Crown size={20} /> },
    { path: "/admin/manage-testimonies", label: "Manage Testimonies", icon: <MessageSquare size={20} /> },
    { path: "/admin/manage-reports", label: "Manage Reports", icon: <Flag size={20} /> },
  ];

  const createNavItems = [
    { path: "/admin/create-course", label: "New Course", icon: <PlusCircle size={20} /> },
    { path: "/admin/create-post", label: "New Post", icon: <PenTool size={20} /> },
    { path: "/admin/create-quiz", label: "New Quiz", icon: <HelpCircle size={20} /> },
  ];

  const settingsNavItems = [
    { path: "/admin/settings", label: "Settings", icon: <Settings size={20} /> },
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
          {/* Dashboard */}
          <div className="ad-nav-section">
            {sidebarOpen && <span className="ad-nav-section-title">Overview</span>}
            {dashboardNavItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={isActive(item.path)} 
                onClick={handleNavClick}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="ad-nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="ad-nav-text">{item.label}</span>}
              </Link>
            ))}
          </div>

          <div className="ad-nav-divider" />

          {/* Management - ALL FEATURES */}
          <div className="ad-nav-section">
            {sidebarOpen && <span className="ad-nav-section-title">Management</span>}
            {managementNavItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={isActive(item.path)} 
                onClick={handleNavClick}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="ad-nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="ad-nav-text">{item.label}</span>}
              </Link>
            ))}
          </div>

          <div className="ad-nav-divider" />

          {/* Create */}
          <div className="ad-nav-section">
            {sidebarOpen && <span className="ad-nav-section-title">Create New</span>}
            {createNavItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={isActive(item.path)} 
                onClick={handleNavClick}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="ad-nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="ad-nav-text">{item.label}</span>}
              </Link>
            ))}
          </div>

          <div className="ad-nav-divider" />

          {/* Settings */}
          <div className="ad-nav-section">
            {settingsNavItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={isActive(item.path)} 
                onClick={handleNavClick}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="ad-nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="ad-nav-text">{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <button 
          onClick={handleLogout} 
          className="ad-logout"
          title={!sidebarOpen ? "Sign Out" : undefined}
        >
          <span className="ad-nav-icon"><LogOut size={20} /></span>
          {sidebarOpen && <span className="ad-nav-text">Sign Out</span>}
        </button>
      </aside>

      {/* Main Content */}
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
              <div className="ad-stat">
                <div className="ad-stat-icon">📧</div>
                <div>
                  <p className="ad-stat-value">{mailsCount}</p>
                  <p className="ad-stat-label">Mails</p>
                </div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-icon">🚩</div>
                <div>
                  <p className="ad-stat-value">{reportsCount}</p>
                  <p className="ad-stat-label">Reports</p>
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
                <Link to="/admin/create-quiz" className="ad-btn-primary">
                  ❓ Create New Quiz
                </Link>
                <Link to="/admin/users" className="ad-btn-secondary">
                  👥 Manage Users
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
