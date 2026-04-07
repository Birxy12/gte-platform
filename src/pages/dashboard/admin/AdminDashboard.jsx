import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../../../config/firebase";
import { collection, getDocs, writeBatch, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { presenceService } from "../../../services/presenceService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, BookOpen, Newspaper, Film, Layout, 
  Settings, LogOut, PlusCircle, PenTool, 
  CheckCircle, Shield, Star, HelpCircle, 
  MessageSquare, Award, Clock, UserCheck, Coins
} from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [usersCount, setUsersCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [reelsCount, setReelsCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [leadershipCount, setLeadershipCount] = useState(0);
  const [instructorsCount, setInstructorsCount] = useState(0);
  const [pendingInstructors, setPendingInstructors] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
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
        }
      } catch (err) {
        console.error("Auto-approval error:", err);
      }
    };

    const fetchAnalytics = async () => {
      try {
        const [uSnap, cSnap, pSnap, rSnap, tSnap, lSnap, iSnap, pendingSnap] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "courses")),
          getDocs(collection(db, "posts")),
          getDocs(collection(db, "reels")),
          getDocs(collection(db, "tasks")),
          getDocs(collection(db, "leadership")),
          getDocs(query(collection(db, "users"), where("role", "in", ["instructor", "pending_instructor"]))),
          getDocs(query(collection(db, "users"), where("status", "==", "pending")))
        ]);
        setUsersCount(uSnap.size);
        setCoursesCount(cSnap.size);
        setPostsCount(pSnap.size);
        setReelsCount(rSnap.size);
        setTasksCount(tSnap.size);
        setLeadershipCount(lSnap.size);
        setInstructorsCount(iSnap.size);
        setPendingInstructors(pendingSnap.size);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        if (err.code === "permission-denied") {
          setError("Access restricted. Operational clearance required.");
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
          <Shield className="text-blue-500" size={24} />
          <span>Admin <b>Panel</b></span>
        </Link>
        <nav className="ad-nav">
          <Link to="/admin" className={isActive("/admin")}>
            <Layout size={18} className="ad-nav-icon" />
            <span>Overview</span>
          </Link>
          <Link to="/admin/users" className={isActive("/admin/users")}>
            <Users size={18} className="ad-nav-icon" />
            <span>Users</span>
          </Link>
          <Link to="/admin/instructors" className={isActive("/admin/instructors")}>
            <UserCheck size={18} className="ad-nav-icon" />
            <span>Instructors</span>
            {pendingInstructors > 0 && (
              <span className="ad-badge">{pendingInstructors}</span>
            )}
          </Link>
          <Link to="/admin/manage-courses" className={isActive("/admin/manage-courses")}>
            <BookOpen size={18} className="ad-nav-icon" />
            <span>Courses</span>
          </Link>
          <Link to="/admin/manage-posts" className={isActive("/admin/manage-posts")}>
            <Newspaper size={18} className="ad-nav-icon" />
            <span>Posts</span>
          </Link>
          <Link to="/admin/manage-reels" className={isActive("/admin/manage-reels")}>
            <Film size={18} className="ad-nav-icon" />
            <span>Reels</span>
          </Link>
          <Link to="/admin/manage-tasks" className={isActive("/admin/manage-tasks")}>
            <Clock size={18} className="ad-nav-icon" />
            <span>Tasks</span>
          </Link>
          <Link to="/admin/manage-quizzes" className={isActive("/admin/manage-quizzes")}>
            <HelpCircle size={18} className="ad-nav-icon" />
            <span>Quizzes</span>
          </Link>
          <Link to="/admin/certificates" className={isActive("/admin/certificates")}>
             <Award size={18} className="ad-nav-icon" />
            <span>Certificates</span>
          </Link>
          <Link to="/admin/manage-leadership" className={isActive("/admin/manage-leadership")}>
            <Star size={18} className="ad-nav-icon" />
            <span>Leadership</span>
          </Link>
          <Link to="/admin/reports" className={isActive("/admin/reports")}>
            <Shield size={18} className="ad-nav-icon" />
            <span>Moderation</span>
          </Link>
          <Link to="/admin/testimonies" className={isActive("/admin/testimonies")}>
            <Star size={18} className="ad-nav-icon" />
            <span>Testimonies</span>
          </Link>
          <Link to="/admin/mails" className={isActive("/admin/mails")}>
            <MessageSquare size={18} className="ad-nav-icon" />
            <span>Mails</span>
          </Link>
          <Link to="/admin/economy" className={isActive("/admin/economy")}>
            <Coins size={18} className="ad-nav-icon" />
            <span>Coin Settings</span>
          </Link>
          
          <div className="mx-4 my-6 h-px bg-slate-800/50" />
          
          <Link to="/admin/settings" className={isActive("/admin/settings")}>
            <Settings size={18} className="ad-nav-icon" />
            <span>Settings</span>
          </Link>
        </nav>

        <button onClick={handleLogout} className="ad-logout">
          <LogOut size={18} className="ad-nav-icon" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Area */}
      <main className="ad-main">
        <AnimatePresence mode="wait">
          {isOverview ? (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <div className="ad-page-header">
                <div className="ad-header-title">
                  <h1>Strategic Intelligence</h1>
                  <p>Real-time analytics and platform mission status</p>
                </div>
              </div>

              {error && (
                <div className="ad-card border border-red-500/30 bg-red-500/5">
                  <p className="text-red-400 font-bold flex items-center gap-2">
                    <Shield size={18} /> {error}
                  </p>
                </div>
              )}

              <div className="ad-stats">
                <div className="ad-stat group">
                  <div className="ad-stat-icon group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="ad-stat-value">{usersCount}</p>
                    <p className="ad-stat-label">Total Users</p>
                  </div>
                </div>
                <div className="ad-stat group">
                  <div className="ad-stat-icon group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-colors">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <p className="ad-stat-value">{instructorsCount}</p>
                    <p className="ad-stat-label">Instructors</p>
                    {pendingInstructors > 0 && (
                      <span className="text-xs text-amber-500 font-bold">{pendingInstructors} pending</span>
                    )}
                  </div>
                </div>
                <div className="ad-stat group">
                  <div className="ad-stat-icon group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <p className="ad-stat-value">{coursesCount}</p>
                    <p className="ad-stat-label">Tactical Modules</p>
                  </div>
                </div>
                <div className="ad-stat group">
                  <div className="ad-stat-icon group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                    <Newspaper size={24} />
                  </div>
                  <div>
                    <p className="ad-stat-value">{postsCount}</p>
                    <p className="ad-stat-label">Intel Briefings</p>
                  </div>
                </div>
                <div className="ad-stat group">
                  <div className="ad-stat-icon group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                    <Film size={24} />
                  </div>
                  <div>
                    <p className="ad-stat-value">{reelsCount}</p>
                    <p className="ad-stat-label">Reel Assets</p>
                  </div>
                </div>
                <div className="ad-stat group">
                  <div className="ad-stat-icon group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="ad-stat-value">{tasksCount}</p>
                    <p className="ad-stat-label">Active Missions</p>
                  </div>
                </div>
                <div className="ad-stat group">
                  <div className="ad-stat-icon group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                    <Star size={24} />
                  </div>
                  <div>
                    <p className="ad-stat-value">{leadershipCount}</p>
                    <p className="ad-stat-label">Commanders</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="ad-card">
                  <h3 className="uppercase tracking-widest text-sm text-slate-500 mb-8 border-b border-slate-800 pb-4">
                    Fast Deployment
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/admin/create-course" className="ad-btn-primary flex items-center justify-center gap-2 no-underline">
                      <PlusCircle size={16} /> New Module
                    </Link>
                    <Link to="/admin/create-post" className="ad-btn-primary flex items-center justify-center gap-2 no-underline">
                      <PenTool size={16} /> New Briefing
                    </Link>
                    <Link to="/admin/users" className="ad-btn-secondary flex items-center justify-center gap-2 no-underline">
                      <Users size={16} /> Manage Units
                    </Link>
                    <Link to="/admin/instructors" className="ad-btn-secondary flex items-center justify-center gap-2 no-underline">
                      <UserCheck size={16} /> Instructors
                    </Link>
                  </div>
                </div>

                <div className="ad-card">
                  <h3 className="uppercase tracking-widest text-sm text-slate-500 mb-8 border-b border-slate-800 pb-4">
                    Operational Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-bold text-slate-300">Firestore Master Node</span>
                      </div>
                      <span className="badge badge-completed">Online</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-bold text-slate-300">Intelligence Services</span>
                      </div>
                      <span className="badge badge-completed">Secure</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-sm font-bold text-slate-300">Automated Protocols</span>
                      </div>
                      <span className="badge badge-medium">Active</span>
                    </div>
                    {pendingInstructors > 0 && (
                      <div className="flex items-center justify-between p-3 bg-amber-900/20 rounded-xl border border-amber-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-sm font-bold text-amber-400">Pending Verifications</span>
                        </div>
                        <Link to="/admin/instructors" className="badge badge-pending cursor-pointer hover:brightness-110">
                          {pendingInstructors} Pending
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
