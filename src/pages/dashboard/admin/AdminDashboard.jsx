import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../../../config/firebase";
import { collection, getDocs, writeBatch, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { presenceService } from "../../../services/presenceService";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [usersCount, setUsersCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Auto-approve testimonies older than 1 hour (Admin Only)
    const autoApproveTestimonies = async () => {
      try {
        const testimoniesRef = collection(db, "testimonies");
        const q = query(testimoniesRef, where("published", "==", false));
        const snapshot = await getDocs(q);
        
        const now = Date.now();
        const ONE_HOUR = 60 * 60 * 1000;
        const toApprove = [];

        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.createdAt) {
            const createdTime = data.createdAt.toMillis ? data.createdAt.toMillis() : new Date(data.createdAt).getTime();
            if (now - createdTime > ONE_HOUR) {
              toApprove.push({ ref: doc.ref });
            }
          }
        });

        if (toApprove.length > 0) {
          const batch = writeBatch(db);
          toApprove.forEach(item => {
            batch.update(item.ref, { published: true });
          });
          await batch.commit();
          console.log(`Mission Success: Auto-approved ${toApprove.length} testimonies.`);
        }
      } catch (err) {
        console.error("Auto-approval error:", err);
      }
    };

    // 2. Fetch Analytics
    const fetchAnalytics = async () => {
      try {
        const [uSnap, cSnap, pSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "courses")),
          getDocs(collection(db, "posts"))
        ]);
        setUsersCount(uSnap.size);
        setCoursesCount(cSnap.size);
        setPostsCount(pSnap.size);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        if (err.code === "permission-denied") {
          setError("Permission denied. Ensure Firestore rules allow access.");
        }
      }
    };

    autoApproveTestimonies();
    fetchAnalytics();
  }, []);

  const handleLogout = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) await presenceService.setOffline(currentUser.uid);
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
          <Link to="/admin/reports" className={isActive("/admin/reports")}>
            <span className="ad-nav-icon">🛡️</span>
            <span>Moderation</span>
          </Link>
          <Link to="/admin/testimonies" className={isActive("/admin/testimonies")}>
            <span className="ad-nav-icon">🌟</span>
            <span>Testimonies</span>
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
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '1rem 0' }} />
          <Link to="/admin/settings" className={isActive("/admin/settings")}>
            <span className="ad-nav-icon">⚙️</span>
            <span>Settings</span>
          </Link>
        </nav>
        <button onClick={handleLogout} className="ad-logout">
          <span className="ad-nav-icon">🚪</span>
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Area */}
      <main className="ad-main">
        {isOverview ? (
          <>
            <div className="ad-page-header">
              <div className="ad-header-title">
                <h1>Dashboard Overview</h1>
                <p>Real-time analytics and mission status</p>
              </div>
            </div>
            {error && (
              <div className="ad-card" style={{ border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
                <p style={{ color: '#fca5a5', margin: 0 }}>⚠️ {error}</p>
              </div>
            )}
            <div className="ad-stats">
              <div className="ad-stat">
                <div className="ad-stat-icon">👥</div>
                <div><p className="ad-stat-value">{usersCount}</p><p className="ad-stat-label">Total Users</p></div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-icon">📚</div>
                <div><p className="ad-stat-value">{coursesCount}</p><p className="ad-stat-label">Total Courses</p></div>
              </div>
              <div className="ad-stat">
                <div className="ad-stat-icon">📰</div>
                <div><p className="ad-stat-value">{postsCount}</p><p className="ad-stat-label">Blog Posts</p></div>
              </div>
            </div>
            <div className="ad-card">
              <h3>Quick Actions</h3>
              <div className="ad-btn-row">
                <Link to="/admin/create-course" className="ad-btn-primary" style={{ textDecoration: 'none' }}>➕ Create Course</Link>
                <Link to="/admin/create-post" className="ad-btn-primary" style={{ textDecoration: 'none' }}>✍ Write Post</Link>
                <Link to="/admin/users" className="ad-btn-secondary" style={{ textDecoration: 'none' }}>👥 Manage Roles</Link>
              </div>
            </div>
            <div className="ad-card">
              <h3>System Status</h3>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }} />
                  <span style={{ color: '#94a3b8' }}>Database: Online</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }} />
                  <span style={{ color: '#94a3b8' }}>Storage: Online</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }} />
                  <span style={{ color: '#94a3b8' }}>Auto-Approve: Active</span>
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