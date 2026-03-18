import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [usersCount, setUsersCount] = useState(0); // Analytics counts
  const [coursesCount, setCoursesCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

  const [error, setError] = useState(null);

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

  const isActive = (path) => location.pathname === path ? "ad-nav-item active" : "ad-nav-item";
  const isOverview = location.pathname === "/admin";

  return (
    <div className="admin-dash">
      {/* Sidebar */}
      <aside className="ad-sidebar">
        <Link to="/home" className="ad-brand">
          <span className="ad-nav-icon">🛡️</span>
          <span>Admin <b>Panel</b></span>
        </Link>

        <nav className="ad-nav">
          <Link to="/admin" className={isActive("/admin")}>
            <span className="ad-nav-icon">📊</span>
            <span>Analytics</span>
          </Link>
          <Link to="/admin/users" className={isActive("/admin/users")}>
            <span className="ad-nav-icon">👥</span>
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/manage-courses" className={isActive("/admin/manage-courses")}>
            <span className="ad-nav-icon">📚</span>
            <span>Manage Courses</span>
          </Link>
          <Link to="/admin/manage-posts" className={isActive("/admin/manage-posts")}>
            <span className="ad-nav-icon">📰</span>
            <span>Manage Posts</span>
          </Link>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '1rem 0' }} />
          <Link to="/admin/create-course" className={isActive("/admin/create-course")}>
            <span className="ad-nav-icon">✨</span>
            <span>New Course</span>
          </Link>
          <Link to="/admin/create-post" className={isActive("/admin/create-post")}>
            <span className="ad-nav-icon">🖋️</span>
            <span>New Post</span>
          </Link>
        </nav>

        <button onClick={handleLogout} className="ad-logout">
          <span className="ad-nav-icon">🚪</span>
          <span>Sign Out</span>
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

            <div className="ad-card">
              <h3>System Status</h3>
              <div style={{ display: 'flex', gap: '2rem' }}>
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