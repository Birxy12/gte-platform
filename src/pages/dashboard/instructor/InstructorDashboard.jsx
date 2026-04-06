import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Plus,
  MoreVertical,
  TrendingUp,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  Download,
  Calendar,
  Award,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./InstructorDashboard.css";

// Mock data - replace with actual API calls
const mockStats = {
  totalStudents: 12483,
  activeCourses: 12,
  totalRevenue: 45280,
  averageRating: 4.8,
  monthlyGrowth: 23.5,
  pendingAssignments: 45
};

const mockCourses = [
  {
    id: 1,
    title: "React & Next.js Masterclass",
    students: 3240,
    revenue: 28960,
    rating: 4.9,
    status: "published",
    progress: 100,
    image: "linear-gradient(135deg, #3b82f6, #6366f1)",
    lastUpdated: "2 days ago",
    category: "Frontend"
  },
  {
    id: 2,
    title: "Advanced Node.js Patterns",
    students: 1890,
    revenue: 15200,
    rating: 4.7,
    status: "published",
    progress: 100,
    image: "linear-gradient(135deg, #10b981, #059669)",
    lastUpdated: "1 week ago",
    category: "Backend"
  },
  {
    id: 3,
    title: "System Design Fundamentals",
    students: 856,
    revenue: 8560,
    rating: 4.8,
    status: "draft",
    progress: 65,
    image: "linear-gradient(135deg, #f59e0b, #d97706)",
    lastUpdated: "3 days ago",
    category: "Architecture"
  },
  {
    id: 4,
    title: "DevOps Engineering Bootcamp",
    students: 0,
    revenue: 0,
    rating: 0,
    status: "review",
    progress: 90,
    image: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    lastUpdated: "Just now",
    category: "DevOps"
  }
];

const mockRecentStudents = [
  { id: 1, name: "Sarah Chen", course: "React & Next.js", progress: 75, avatar: "SC", joined: "2 hours ago" },
  { id: 2, name: "Michael Ross", course: "Node.js Patterns", progress: 45, avatar: "MR", joined: "5 hours ago" },
  { id: 3, name: "Emma Wilson", course: "React & Next.js", progress: 90, avatar: "EW", joined: "1 day ago" },
  { id: 4, name: "James Kumar", course: "System Design", progress: 20, avatar: "JK", joined: "2 days ago" },
  { id: 5, name: "Lisa Park", course: "Node.js Patterns", progress: 60, avatar: "LP", joined: "3 days ago" }
];

const mockReviews = [
  { id: 1, student: "Alex Thompson", rating: 5, comment: "Best course I've ever taken! The instructor explains complex concepts so clearly.", course: "React & Next.js", date: "2 days ago" },
  { id: 2, student: "Maria Garcia", rating: 4, comment: "Great content, but would love more practical exercises.", course: "Node.js Patterns", date: "4 days ago" },
  { id: 3, student: "David Kim", rating: 5, comment: "Absolutely transformative for my career. Highly recommend!", course: "React & Next.js", date: "1 week ago" }
];

const mockEarningsData = [
  { month: "Jan", amount: 3200 },
  { month: "Feb", amount: 4100 },
  { month: "Mar", amount: 3800 },
  { month: "Apr", amount: 5200 },
  { month: "May", amount: 6100 },
  { month: "Jun", amount: 7800 }
];

export default function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [timeRange, setTimeRange] = useState("7d");

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "students", label: "Students", icon: Users },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: 5 },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const statsCards = [
    { 
      title: "Total Students", 
      value: mockStats.totalStudents.toLocaleString(), 
      change: "+12.5%", 
      icon: Users, 
      color: "blue",
      trend: "up"
    },
    { 
      title: "Active Courses", 
      value: mockStats.activeCourses, 
      change: "+2", 
      icon: BookOpen, 
      color: "green",
      trend: "up"
    },
    { 
      title: "Total Revenue", 
      value: `$${mockStats.totalRevenue.toLocaleString()}`, 
      change: "+23.5%", 
      icon: DollarSign, 
      color: "purple",
      trend: "up"
    },
    { 
      title: "Average Rating", 
      value: mockStats.averageRating, 
      change: "+0.2", 
      icon: Star, 
      color: "amber",
      trend: "up"
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      published: "green",
      draft: "gray",
      review: "amber",
      archived: "red"
    };
    return colors[status] || "gray";
  };

  const getStatusIcon = (status) => {
    const icons = {
      published: CheckCircle,
      draft: Clock,
      review: AlertCircle,
      archived: AlertCircle
    };
    return icons[status] || Clock;
  };

  return (
    <div className="instructor-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Award size={32} className="logo-icon" />
            {!sidebarCollapsed && <span className="logo-text">GTE Instructor</span>}
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <ChevronRight size={20} className={sidebarCollapsed ? "rotated" : ""} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge && <span className="badge">{item.badge}</span>}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="instructor-profile">
            <div className="profile-avatar">JD</div>
            {!sidebarCollapsed && (
              <div className="profile-info">
                <span className="profile-name">John Doe</span>
                <span className="profile-role">Senior Instructor</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-search">
            <Search size={20} />
            <input type="text" placeholder="Search courses, students..." />
          </div>
          
          <div className="header-actions">
            <button className="icon-btn">
              <Calendar size={20} />
            </button>
            <button className="icon-btn notification">
              <MessageSquare size={20} />
              {notifications > 0 && <span className="notification-badge">{notifications}</span>}
            </button>
            <button className="create-course-btn" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              Create Course
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="tab-content"
              >
                {/* Welcome Banner */}
                <div className="welcome-banner">
                  <div className="welcome-text">
                    <h1>Welcome back, John! 👋</h1>
                    <p>You have {mockStats.pendingAssignments} assignments to review and 3 new messages.</p>
                  </div>
                  <div className="quick-stats">
                    <div className="quick-stat">
                      <TrendingUp size={20} />
                      <span>+{mockStats.monthlyGrowth}% this month</span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                  {statsCards.map((stat, idx) => (
                    <motion.div
                      key={stat.title}
                      className={`stat-card ${stat.color}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <div className="stat-header">
                        <div className={`stat-icon ${stat.color}`}>
                          <stat.icon size={24} />
                        </div>
                        <span className={`stat-change ${stat.trend}`}>{stat.change}</span>
                      </div>
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.title}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Main Grid */}
                <div className="dashboard-grid">
                  {/* Courses Section */}
                  <div className="dashboard-card courses-section">
                    <div className="card-header">
                      <h3>My Courses</h3>
                      <div className="card-actions">
                        <button className="btn-text">View All</button>
                        <button className="icon-btn small"><Filter size={16} /></button>
                      </div>
                    </div>
                    <div className="courses-list">
                      {mockCourses.map((course) => (
                        <div 
                          key={course.id} 
                          className="course-item"
                          onClick={() => setSelectedCourse(course)}
                        >
                          <div className="course-thumb" style={{ background: course.image }}>
                            <span className="course-emoji">
                              {course.category === "Frontend" ? "⚛️" : 
                               course.category === "Backend" ? "🟢" : 
                               course.category === "DevOps" ? "☁️" : "🏗️"}
                            </span>
                          </div>
                          <div className="course-info">
                            <h4>{course.title}</h4>
                            <div className="course-meta">
                              <span><Users size={14} /> {course.students.toLocaleString()}</span>
                              <span><Star size={14} /> {course.rating || "N/A"}</span>
                              <span className={`status ${getStatusColor(course.status)}`}>
                                {course.status}
                              </span>
                            </div>
                          </div>
                          <div className="course-revenue">
                            <span className="revenue-amount">${course.revenue.toLocaleString()}</span>
                            <span className="revenue-label">Revenue</span>
                          </div>
                          <button className="icon-btn ghost">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Students */}
                  <div className="dashboard-card students-section">
                    <div className="card-header">
                      <h3>Recent Students</h3>
                      <button className="btn-text">View All</button>
                    </div>
                    <div className="students-list">
                      {mockRecentStudents.map((student, idx) => (
                        <motion.div
                          key={student.id}
                          className="student-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <div className="student-avatar">{student.avatar}</div>
                          <div className="student-info">
                            <span className="student-name">{student.name}</span>
                            <span className="student-course">{student.course}</span>
                          </div>
                          <div className="student-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                            <span>{student.progress}%</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews Section */}
                  <div className="dashboard-card reviews-section">
                    <div className="card-header">
                      <h3>Recent Reviews</h3>
                      <div className="rating-summary">
                        <Star size={16} className="star-filled" />
                        <span>{mockStats.averageRating}</span>
                      </div>
                    </div>
                    <div className="reviews-list">
                      {mockReviews.map((review) => (
                        <div key={review.id} className="review-item">
                          <div className="review-header">
                            <span className="reviewer-name">{review.student}</span>
                            <div className="review-rating">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={12} 
                                  className={i < review.rating ? "star-filled" : "star-empty"} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="review-text">{review.comment}</p>
                          <div className="review-footer">
                            <span className="review-course">{review.course}</span>
                            <span className="review-date">{review.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Earnings Chart */}
                  <div className="dashboard-card earnings-section">
                    <div className="card-header">
                      <h3>Earnings Overview</h3>
                      <div className="time-range-selector">
                        {["7d", "30d", "90d", "1y"].map((range) => (
                          <button
                            key={range}
                            className={timeRange === range ? "active" : ""}
                            onClick={() => setTimeRange(range)}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="earnings-chart">
                      <div className="chart-bars">
                        {mockEarningsData.map((data, idx) => (
                          <div key={idx} className="chart-bar-wrapper">
                            <div 
                              className="chart-bar"
                              style={{ height: `${(data.amount / 8000) * 100}%` }}
                            >
                              <div className="bar-tooltip">${data.amount}</div>
                            </div>
                            <span className="bar-label">{data.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="earnings-summary">
                      <div className="summary-item">
                        <span className="summary-label">This Month</span>
                        <span className="summary-value">$7,800</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Last Month</span>
                        <span className="summary-value">$6,100</span>
                      </div>
                      <div className="summary-item positive">
                        <span className="summary-label">Growth</span>
                        <span className="summary-value">+27.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "courses" && (
              <motion.div
                key="courses"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="tab-content"
              >
                <div className="page-header">
                  <h2>My Courses</h2>
                  <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} /> Create New Course
                  </button>
                </div>
                
                <div className="courses-filter-bar">
                  <div className="search-box">
                    <Search size={18} />
                    <input type="text" placeholder="Search courses..." />
                  </div>
                  <div className="filter-group">
                    <select>
                      <option>All Status</option>
                      <option>Published</option>
                      <option>Draft</option>
                      <option>Under Review</option>
                    </select>
                    <select>
                      <option>Sort by: Recent</option>
                      <option>Most Popular</option>
                      <option>Highest Rated</option>
                    </select>
                    <button className="btn-secondary">
                      <Download size={16} /> Export
                    </button>
                  </div>
                </div>

                <div className="courses-grid-detailed">
                  {mockCourses.map((course) => (
                    <div key={course.id} className="course-card-detailed">
                      <div className="course-header" style={{ background: course.image }}>
                        <span className={`status-badge ${getStatusColor(course.status)}`}>
                          {course.status}
                        </span>
                        <button className="icon-btn white">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                      <div className="course-body">
                        <span className="course-category">{course.category}</span>
                        <h3>{course.title}</h3>
                        <div className="course-stats-row">
                          <div className="mini-stat">
                            <Users size={14} />
                            <span>{course.students.toLocaleString()}</span>
                          </div>
                          <div className="mini-stat">
                            <Star size={14} />
                            <span>{course.rating || "-"}</span>
                          </div>
                          <div className="mini-stat">
                            <Clock size={14} />
                            <span>{course.lastUpdated}</span>
                          </div>
                        </div>
                        <div className="course-progress">
                          <div className="progress-header">
                            <span>Completion</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="course-footer">
                        <div className="revenue">
                          <DollarSign size={16} />
                          <span>{course.revenue.toLocaleString()}</span>
                        </div>
                        <button className="btn-text">Manage</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "students" && (
              <motion.div
                key="students"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="tab-content"
              >
                <div className="page-header">
                  <h2>Student Management</h2>
                  <div className="header-stats">
                    <div className="header-stat">
                      <span className="stat-number-large">12,483</span>
                      <span className="stat-label-small">Total Students</span>
                    </div>
                    <div className="header-stat">
                      <span className="stat-number-large">89%</span>
                      <span className="stat-label-small">Avg. Completion</span>
                    </div>
                  </div>
                </div>
                
                <div className="students-table-container">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Enrolled Course</th>
                        <th>Progress</th>
                        <th>Last Active</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockRecentStudents.map((student) => (
                        <tr key={student.id}>
                          <td>
                            <div className="table-user">
                              <div className="user-avatar small">{student.avatar}</div>
                              <span>{student.name}</span>
                            </div>
                          </td>
                          <td>{student.course}</td>
                          <td>
                            <div className="table-progress">
                              <div className="progress-bar small">
                                <div 
                                  className="progress-fill" 
                                  style={{ width: `${student.progress}%` }}
                                />
                              </div>
                              <span>{student.progress}%</span>
                            </div>
                          </td>
                          <td>{student.joined}</td>
                          <td>
                            <span className={`status-pill ${student.progress > 80 ? 'active' : 'warning'}`}>
                              {student.progress > 80 ? 'Active' : 'Needs Attention'}
                            </span>
                          </td>
                          <td>
                            <button className="icon-btn ghost"><MessageSquare size={16} /></button>
                            <button className="icon-btn ghost"><Eye size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Create Course Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Create New Course</h2>
                <button className="icon-btn" onClick={() => setShowCreateModal(false)}>
                  <AlertCircle size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Course Title</label>
                  <input type="text" placeholder="Enter course title" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select>
                      <option>Frontend Development</option>
                      <option>Backend Development</option>
                      <option>DevOps</option>
                      <option>Data Science</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="4" placeholder="Brief description of the course"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary">
                  Create Course
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
