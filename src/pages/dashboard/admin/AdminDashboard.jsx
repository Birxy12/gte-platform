import { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  BarChart3, 
  Shield, 
  Bell, 
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Plus,
  TrendingUp,
  DollarSign,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ManageInstructors from "./ManageInstructors";
import "./AdminDashboard.css";

// Mock components for other sections - replace with actual imports
const ManageUsers = () => <div className="ad-placeholder">Users Management Component</div>;
const ManageCourses = () => <div className="ad-placeholder">Courses Management Component</div>;
const Analytics = () => <div className="ad-placeholder">Analytics Component</div>;
const AdminSettings = () => <div className="ad-placeholder">Settings Component</div>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch admin data and notifications
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch pending instructor verifications
        const instructorsQuery = query(
          collection(db, "users"), 
          where("role", "==", "pending_instructor")
        );
        const instructorsSnap = await getDocs(instructorsQuery);
        const pendingInstructors = instructorsSnap.docs.length;

        // Fetch pending course approvals
        const coursesQuery = query(
          collection(db, "courses"),
          where("status", "==", "pending_review")
        );
        const coursesSnap = await getDocs(coursesQuery);
        const pendingCourses = coursesSnap.docs.length;

        // Fetch total stats
        const usersSnap = await getDocs(collection(db, "users"));
        const totalUsers = usersSnap.docs.length;

        const allCoursesSnap = await getDocs(collection(db, "courses"));
        const totalCourses = allCoursesSnap.docs.length;

        setAdminData({
          totalUsers,
          totalCourses,
          pendingInstructors,
          pendingCourses,
          totalRevenue: 125000,
          monthlyGrowth: 23.5
        });

        // Generate notifications
        const notifs = [];
        if (pendingInstructors > 0) {
          notifs.push({
            id: 1,
            type: "instructor",
            message: `${pendingInstructors} instructor${pendingInstructors > 1 ? 's' : ''} awaiting verification`,
            time: "Just now",
            icon: UserCheck,
            color: "amber"
          });
        }
        if (pendingCourses > 0) {
          notifs.push({
            id: 2,
            type: "course",
            message: `${pendingCourses} course${pendingCourses > 1 ? 's' : ''} pending review`,
            time: "2 hours ago",
            icon: BookOpen,
            color: "blue"
          });
        }
        notifs.push({
          id: 3,
          type: "system",
          message: "System backup completed successfully",
          time: "5 hours ago",
          icon: CheckCircle,
          color: "green"
        });

        setNotifications(notifs);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, badge: null },
    { id: "instructors", label: "    { id: "instructors", label: "Instructors", icon: Shield, badge: adminData?.pendingInstructors || 0 },
    { id: "users", label: "Users", icon: Users, badge: null },
    { id: "courses", label: "Courses", icon: BookOpen, badge: adminData?.pendingCourses || 0 },
    { id: "analytics", label: "Analytics", icon: BarChart3, badge: null },
    { id: "settings", label: "Settings", icon: Settings, badge: null }
  ];

  const quickActions = [
    { label: "Add Instructor", icon: Plus, color: "blue", action: () => setActiveTab("instructors") },
    { label: "Review Courses", icon: BookOpen, color: "amber", action: () => setActiveTab("courses") },
    { label: "View Reports", icon: BarChart3, color: "purple", action: () => setActiveTab("analytics") }
  ];

  const renderContent = () => {
    switch(activeTab) {
      case "overview":
        return <OverviewDashboard data={adminData} quickActions={quickActions} />;
      case "instructors":
        return <ManageInstructors />;
      case "users":
        return <ManageUsers />;
      case "courses":
        return <ManageCourses />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <AdminSettings />;
      default:
        return <OverviewDashboard data={adminData} quickActions={quickActions} />;
    }
  };

  if (loading) {
    return (
      <div className="ad-loading-screen">
        <div className="ad-spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            className="ad-mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        className={`ad-sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
      >
        <div className="ad-sidebar-header">
          <div className="ad-logo">
            <Shield size={32} className="ad-logo-icon" />
            {sidebarOpen && (
              <motion.div 
                className="ad-logo-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="ad-logo-title">GTE Admin</span>
                <span className="ad-logo-subtitle">Control Center</span>
              </motion.div>
            )}
          </div>
          <button 
            className="ad-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="ad-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`ad-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={22} />
              {sidebarOpen && (
                <motion.span 
                  className="ad-nav-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {item.label}
                </motion.span>
              )}
              {sidebarOpen && item.badge > 0 && (
                <span className="ad-badge">{item.badge}</span>
              )}
              {!sidebarOpen && item.badge > 0 && (
                <span className="ad-badge-mini">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <button className="ad-logout">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="ad-main">
        {/* Top Header */}
        <header className="ad-header">
          <div className="ad-header-left">
            <button 
              className="ad-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <div className="ad-search">
              <Search size={18} />
              <input type="text" placeholder="Search anything..." />
            </div>
          </div>

          <div className="ad-header-right">
            {/* Notifications */}
            <div className="ad-notifications">
              <button 
                className="ad-icon-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="ad-notification-dot">{notifications.length}</span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    className="ad-notification-dropdown"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="ad-notification-header">
                      <h4>Notifications</h4>
                      <span>{notifications.length} new</span>
                    </div>
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className="ad-notification-item"
                        onClick={() => {
                          if (notif.type === "instructor") setActiveTab("instructors");
                          if (notif.type === "course") setActiveTab("courses");
                          setShowNotifications(false);
                        }}
                      >
                        <div className={`ad-notification-icon ${notif.color}`}>
                          <notif.icon size={16} />
                        </div>
                        <div className="ad-notification-content">
                          <p>{notif.message}</p>
                          <span>{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin Profile */}
            <div className="ad-profile">
              <div className="ad-avatar">AD</div>
              <div className="ad-profile-info">
                <span className="ad-profile-name">Admin User</span>
                <span className="ad-profile-role">Super Admin</span>
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="ad-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Overview Dashboard Component
function OverviewDashboard({ data, quickActions }) {
  const stats = [
    { 
      title: "Total Users", 
      value: data?.totalUsers?.toLocaleString() || "0", 
      change: "+12%", 
      icon: Users, 
      color: "blue" 
    },
    { 
      title: "Total Courses", 
      value: data?.totalCourses?.toLocaleString() || "0", 
      change: "+8%", 
      icon: BookOpen, 
      color: "purple" 
    },
    { 
      title: "Revenue", 
      value: `$${(data?.totalRevenue / 1000).toFixed(1)}k`, 
      change: `+${data?.monthlyGrowth}%`, 
      icon: DollarSign, 
      color: "green" 
    },
    { 
      title: "Pending Verifications", 
      value: (data?.pendingInstructors + data?.pendingCourses) || "0", 
      change: "Action needed", 
      icon: AlertCircle, 
      color: "amber" 
    }
  ];

  const recentActivity = [
    { action: "New instructor registered", time: "2 min ago", icon: UserCheck, color: "blue" },
    { action: "Course published: React Advanced", time: "15 min ago", icon: BookOpen, color: "green" },
    { action: "Payment received: $2,499", time: "1 hour ago", icon: DollarSign, color: "purple" },
    { action: "User report submitted", time: "3 hours ago", icon: AlertCircle, color: "amber" }
  ];

  return (
    <div className="ad-overview">
      {/* Welcome Section */}
      <div className="ad-welcome">
        <div>
          <h1>Welcome back, Admin! 👋</h1>
          <p>Here's what's happening across your platform today.</p>
        </div>
        <div className="ad-quick-actions">
          {quickActions.map((action, idx) => (
            <button 
              key={idx} 
              className={`ad-quick-btn ${action.color}`}
              onClick={action.action}
            >
              <action.icon size={18} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="ad-stats-grid">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.title}
            className={`ad-stat-card ${stat.color}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="ad-stat-icon">
              <stat.icon size={24} />
            </div>
            <div className="ad-stat-info">
              <span className="ad-stat-value">{stat.value}</span>
              <span className="ad-stat-label">{stat.title}</span>
            </div>
            <span className={`ad-stat-change ${stat.change.includes('+') ? 'positive' : 'neutral'}`}>
              {stat.change}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="ad-overview-grid">
        {/* Pending Verifications */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3>Pending Verifications</h3>
            <button className="ad-btn-text">View All</button>
          </div>
          <div className="ad-pending-list">
            {data?.pendingInstructors > 0 && (
              <div 
                className="ad-pending-item"
                onClick={() => document.querySelector('[data-tab="instructors"]')?.click()}
              >
                <div className="ad-pending-icon amber">
                  <UserCheck size={20} />
                </div>
                <div className="ad-pending-content">
                  <h4>{data.pendingInstructors} Instructor Verifications</h4>
                  <p>Awaiting approval to create courses</p>
                </div>
                <button className="ad-btn-small">Review</button>
              </div>
            )}
            {data?.pendingCourses > 0 && (
              <div 
                className="ad-pending-item"
                onClick={() => document.querySelector('[data-tab="courses"]')?.click()}
              >
                <div className="ad-pending-icon blue">
                  <BookOpen size={20} />
                </div>
                <div className="ad-pending-content">
                  <h4>{data.pendingCourses} Course Reviews</h4>
                  <p>Pending publication approval</p>
                </div>
                <button className="ad-btn-small">Review</button>
              </div>
            )}
            {data?.pendingInstructors === 0 && data?.pendingCourses === 0 && (
              <div className="ad-all-clear">
                <CheckCircle size={48} />
                <p>All caught up! No pending verifications.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3>Recent Activity</h3>
            <button className="ad-btn-text">View All</button>
          </div>
          <div className="ad-activity-list">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="ad-activity-item">
                <div className={`ad-activity-icon ${activity.color}`}>
                  <activity.icon size={16} />
                </div>
                <div className="ad-activity-content">
                  <p>{activity.action}</p>
                  <span>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="ad-card wide">
          <div className="ad-card-header">
            <h3>Platform Health</h3>
            <span className="ad-status-badge healthy">All Systems Operational</span>
          </div>
          <div className="ad-health-metrics">
            <div className="ad-metric">
              <span className="ad-metric-value">99.9%</span>
              <span className="ad-metric-label">Uptime</span>
            </div>
            <div className="ad-metric">
              <span className="ad-metric-value">245ms</span>
              <span className="ad-metric-label">Avg Response</span>
            </div>
            <div className="ad-metric">
              <span className="ad-metric-value">1.2k</span>
              <span className="ad-metric-label">Active Now</span>
            </div>
            <div className="ad-metric">
              <span className="ad-metric-value">0</span>
              <span className="ad-metric-label">Incidents</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
