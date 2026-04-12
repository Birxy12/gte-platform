import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { useAuth } from "../../../context/AuthProvider";
import {
  collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from "firebase/firestore";
import {
  LayoutDashboard, BookOpen, Users, MessageSquare, Settings, Plus, MoreVertical,
  TrendingUp, Star, Clock, CheckCircle, AlertCircle, ChevronRight, Search, Filter,
  Download, Calendar, Award, Eye, FileText, HelpCircle, Shield, X, Upload, Trash2, Edit3, Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./InstructorDashboard.css";

export default function InstructorDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth < 968;
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 968) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Real data state
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [testimonies, setTestimonies] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [studentProfiles, setStudentProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  // Materials list state
  const [courseMaterials, setCourseMaterials] = useState({});

  // Materials state
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [materialType, setMaterialType] = useState("pdf");
  const [materialDesc, setMaterialDesc] = useState("");
  const [savingMaterial, setSavingMaterial] = useState(false);

  // Quiz scheduling state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingQuiz, setSchedulingQuiz] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        // Fetch instructor's courses (admin: all; instructor: their own)
        const coursesSnap = isAdmin
          ? await getDocs(collection(db, "courses"))
          : await getDocs(query(collection(db, "courses"), where("instructorUid", "==", user.uid)));

        const coursesList = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCourses(coursesList);

        // Fetch enrollments for all their courses
        if (coursesList.length > 0) {
          const courseIds = coursesList.map(c => c.id);
          let allEnrollments = [];
          // Firestore doesn't allow 'in' with > 10, so batch
          for (let i = 0; i < courseIds.length; i += 10) {
            const batch = courseIds.slice(i, i + 10);
            const q = query(collection(db, "enrollments"), where("courseId", "in", batch));
            const snap = await getDocs(q);
            allEnrollments.push(...snap.docs.map(d => ({ id: d.id, ...d.data() })));
          }
            setEnrollments(allEnrollments);

            // Fetch unique student profiles
            const uids = [...new Set(allEnrollments.map(e => e.userId))];
            const profiles = {};
            for (let i = 0; i < uids.length; i += 10) {
              const batch = uids.slice(i, i + 10);
              const q = query(collection(db, "users"), where("uid", "in", batch));
              const snap = await getDocs(q);
              snap.docs.forEach(d => { profiles[d.id] = d.data(); });
            }
            setStudentProfiles(profiles);

            // Fetch materials for each course
            const mats = {};
            const { courseService } = await import("../../../services/courseService");
            await Promise.all(courseIds.map(async (cId) => {
              const m = await courseService.getCourseMaterials(cId).catch(() => []);
              mats[cId] = m;
            }));
            setCourseMaterials(mats);
          }

        // Fetch pending testimonies (instructor can approve)
        const testSnap = await getDocs(query(collection(db, "testimonies"), where("published", "==", false)));
        setTestimonies(testSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch quizzes for their courses
        if (isAdmin) {
          const qSnap = await getDocs(collection(db, "quizzes"));
          setQuizzes(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else if (coursesList.length > 0) {
          const courseIds = coursesList.map(c => c.id);
          let allQuizzes = [];
          for (let i = 0; i < courseIds.length; i += 10) {
            const batch = courseIds.slice(i, i + 10);
            const q = query(collection(db, "quizzes"), where("courseId", "in", batch));
            const snap = await getDocs(q);
            allQuizzes.push(...snap.docs.map(d => ({ id: d.id, ...d.data() })));
          }
          setQuizzes(allQuizzes);
        }

        // Fetch instructor profile
        const { getDoc } = await import("firebase/firestore");
        const profileSnap = await getDoc(doc(db, "users", user.uid));
        if (profileSnap.exists()) setProfile(profileSnap.data());

      } catch (err) {
        console.error("Error loading instructor data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, isAdmin]);

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !materialTitle || !materialUrl) return;
    setSavingMaterial(true);
    try {
      await addDoc(collection(db, "courseMaterials"), {
        courseId: selectedCourseId,
        title: materialTitle,
        url: materialUrl,
        type: materialType,
        description: materialDesc,
        order: Date.now(),
        addedBy: user.uid,
        createdAt: serverTimestamp()
      });
      alert("Material added successfully! 📎");
      setShowMaterialForm(false);
      setMaterialTitle(""); setMaterialUrl(""); setMaterialDesc(""); setMaterialType("pdf");
      
      // Refresh local materials state
      const { courseService } = await import("../../../services/courseService");
      const updatedMats = await courseService.getCourseMaterials(selectedCourseId);
      setCourseMaterials(prev => ({ ...prev, [selectedCourseId]: updatedMats }));
    } catch (err) {
      console.error(err);
      alert("Failed to add material.");
    } finally {
      setSavingMaterial(false);
    }
  };

  const handleApproveTestimony = async (id) => {
    try {
      await updateDoc(doc(db, "testimonies", id), { published: true });
      setTestimonies(prev => prev.filter(t => t.id !== id));
      alert("Testimony approved and published! ✅");
    } catch (err) {
      alert("Failed to approve testimony.");
    }
  };

  const handleRejectTestimony = async (id) => {
    if (!window.confirm("Reject and delete this testimony?")) return;
    try {
      await deleteDoc(doc(db, "testimonies", id));
      setTestimonies(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert("Failed to reject testimony.");
    }
  };

  const handleToggleLive = async (courseId, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = !currentStatus;
      const { courseService } = await import("../../../services/courseService");
      await courseService.toggleLiveStatus(courseId, newStatus);
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, isLive: newStatus } : c));
      alert(`Course is now ${newStatus ? 'LIVE 🔴' : 'OFFLINE ⚪'}`);
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQuiz = async (quizId, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = !currentStatus;
      const { courseService } = await import("../../../services/courseService");
      await courseService.toggleQuizStatus(quizId, newStatus);
      setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, isActive: newStatus } : q));
      alert(`Quiz is now ${newStatus ? 'ACTIVE 🟢' : 'INACTIVE ⚪'}`);
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleQuiz = async () => {
    if (!schedulingQuiz || !scheduleDate) return;
    try {
      await updateDoc(doc(db, "quizzes", schedulingQuiz.id), {
        availableFrom: new Date(scheduleDate).toISOString()
      });
      setQuizzes(prev => prev.map(q => q.id === schedulingQuiz.id ? { ...q, availableFrom: new Date(scheduleDate).toISOString() } : q));
      setShowScheduleModal(false);
      setSchedulingQuiz(null);
      setScheduleDate("");
      alert("Quiz scheduled successfully! 📅");
    } catch (err) {
      alert("Failed to schedule quiz.");
    }
  };

  const totalStudents = enrollments.length;
  const initials = profile?.username?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "ID";

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "students", label: "Students", icon: Users, badge: enrollments.length },
    { id: "materials", label: "Course Materials", icon: FileText },
    { id: "quizzes", label: "Quiz Scheduler", icon: HelpCircle, badge: quizzes.filter(q => !q.availableFrom).length },
    { id: "testimonies", label: "Testimonies", icon: Star, badge: testimonies.length || null },
    { id: "moderation", label: "Moderation", icon: Shield },
  ];

  if (loading) return (
    <div className="instructor-dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ width: 48, height: 48, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }}></div>
        <p>Loading instructor data...</p>
      </div>
    </div>
  );

  return (
    <div className={`instructor-dashboard ${sidebarCollapsed ? 'sidebar-closed' : ''}`}>
      {/* Mobile Header */}
      <div className="id-mobile-header">
        <div className="id-mobile-brand">
          <Award size={20} className="text-blue-500 inline mr-2" />
          <span>GTE {isAdmin ? "Admin" : "Instructor"}</span>
        </div>
        <button className="id-menu-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay */}
      {!sidebarCollapsed && (
        <div className="id-overlay" onClick={() => setSidebarCollapsed(true)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? "closed" : "open"}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Award size={32} className="logo-icon" />
            {!sidebarCollapsed && <span className="logo-text">GTE {isAdmin ? "Admin" : "Instructor"}</span>}
          </div>
          <button className="collapse-btn id-sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
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
                  {item.badge > 0 && <span className="badge">{item.badge}</span>}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="instructor-profile">
            <div className="profile-avatar">{initials}</div>
            {!sidebarCollapsed && (
              <div className="profile-info">
                <span className="profile-name">{profile?.username || "Instructor"}</span>
                <span className="profile-role">{isAdmin ? "Admin & Instructor" : "Instructor"}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="header-search">
            <Search size={20} />
            <input type="text" placeholder="Search courses, students..." />
          </div>
          <div className="header-actions">
            <button className="icon-btn notification">
              <MessageSquare size={20} />
              {testimonies.length > 0 && <span className="notification-badge">{testimonies.length}</span>}
            </button>
            <button className="create-course-btn" onClick={() => setShowMaterialForm(true)}>
              <Plus size={18} /> Add Material
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <AnimatePresence mode="wait">

            {/* ===== OVERVIEW ===== */}
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="tab-content">
                <div className="welcome-banner">
                  <div className="welcome-text">
                    <h1>Welcome back, {profile?.username || "Instructor"}! 👋</h1>
                    <p>You have {testimonies.length} pending testimonies and {courses.length} courses.</p>
                  </div>
                  <div className="quick-stats">
                    <div className="quick-stat">
                      <TrendingUp size={20} />
                      <span>{totalStudents} enrolled students</span>
                    </div>
                  </div>
                </div>

                <div className="stats-grid">
                  {[
                    { title: "Total Students", value: totalStudents, icon: Users, color: "blue" },
                    { title: "Active Courses", value: courses.length, icon: BookOpen, color: "green" },
                    { title: "Pending Testimonies", value: testimonies.length, icon: Star, color: "amber" },
                    { title: "Total Quizzes", value: quizzes.length, icon: HelpCircle, color: "purple" },
                  ].map((stat, idx) => (
                    <motion.div key={stat.title} className={`stat-card ${stat.color}`}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                      <div className="stat-header">
                        <div className={`stat-icon ${stat.color}`}><stat.icon size={24} /></div>
                      </div>
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.title}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="dashboard-grid">
                  <div className="dashboard-card courses-section">
                    <div className="card-header">
                      <h3>My Courses</h3>
                      <button className="btn-text" onClick={() => setActiveTab("courses")}>View All</button>
                    </div>
                    <div className="courses-list">
                      {courses.slice(0, 4).map(course => (
                        <div key={course.id} className="course-item">
                          <div className="course-thumb" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
                            <span className="course-emoji">📚</span>
                          </div>
                          <div className="course-info">
                            <h4>{course.title}</h4>
                            <div className="course-meta">
                              <span><Users size={14} /> {enrollments.filter(e => e.courseId === course.id).length} students</span>
                              <span className={`status green`}>active</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {courses.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                          <BookOpen size={32} opacity={0.4} />
                          <p style={{ marginTop: '0.75rem' }}>No courses assigned yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="dashboard-card students-section">
                    <div className="card-header">
                      <h3>Recent Enrollments</h3>
                    </div>
                    <div className="students-list">
                      {enrollments.slice(0, 5).map((enr, idx) => (
                        <motion.div key={enr.id} className="student-item"
                          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}>
                          <div className="student-avatar">{(studentProfiles[enr.userId]?.username || "U").substring(0, 2).toUpperCase()}</div>
                          <div className="student-info">
                            <span className="student-name">{studentProfiles[enr.userId]?.username || enr.userId?.substring(0, 8)}</span>
                            <span className="student-course">{courses.find(c => c.id === enr.courseId)?.title || enr.courseId}</span>
                          </div>
                          <div className="student-progress">
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${enr.progress || 0}%` }} />
                            </div>
                            <span>{enr.progress || 0}%</span>
                          </div>
                        </motion.div>
                      ))}
                      {enrollments.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                          <Users size={32} opacity={0.4} />
                          <p style={{ marginTop: '0.75rem' }}>No students enrolled yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===== COURSES ===== */}
            {activeTab === "courses" && (
              <motion.div key="courses" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="tab-content">
                <div className="page-header">
                  <h2>My Courses</h2>
                </div>
                <div className="courses-grid-detailed">
                  {courses.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <BookOpen size={48} opacity={0.3} />
                      <p style={{ marginTop: '1rem' }}>No courses found. Contact admin to assign courses.</p>
                    </div>
                  ) : courses.map(course => (
                    <div key={course.id} className="course-card-detailed">
                      <div className="course-header" style={{ background: "linear-gradient(135deg, #1e3a5f, #3b82f6)" }}>
                        <span className="status-badge green">active</span>
                      </div>
                      <div className="course-body">
                        <span className="course-category">{course.category || "General"}</span>
                        <h3>{course.title}</h3>
                        <div className="course-stats-row">
                          <div className="mini-stat"><Users size={14} /><span>{enrollments.filter(e => e.courseId === course.id).length} students</span></div>
                          <div className="mini-stat"><Star size={14} /><span>4.9 ★</span></div>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>{course.description?.substring(0, 100)}...</p>
                      </div>
                      <div className="course-footer">
                        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                          <button 
                            className={`btn-primary ${course.isLive ? 'btn-danger' : ''}`} 
                            style={{ flex: 1, gap: '0.4rem', background: course.isLive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: course.isLive ? '#ef4444' : '#10b981', border: course.isLive ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)' }}
                            onClick={() => handleToggleLive(course.id, course.isLive)}
                          >
                            {course.isLive ? <><X size={14} /> End Class</> : <><Play size={14} /> Start Class</>}
                          </button>
                          <button 
                            className="btn-text" 
                            style={{ flex: 1 }}
                            onClick={() => { setSelectedCourseId(course.id); setShowMaterialForm(true); setActiveTab("materials"); }}
                          >
                            <Plus size={14} /> Add Material
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ===== STUDENTS ===== */}
            {activeTab === "students" && (
              <motion.div key="students" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="tab-content">
                <div className="page-header">
                  <h2>Student Management</h2>
                  <div className="header-stats">
                    <div className="header-stat">
                      <span className="stat-number-large">{totalStudents}</span>
                      <span className="stat-label-small">Total Enrolled</span>
                    </div>
                  </div>
                </div>
                <div className="students-table-container">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Course</th>
                        <th>Progress</th>
                        <th>Quiz Scores</th>
                        <th>Enrolled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map(enr => (
                        <tr key={enr.id}>
                          <td>
                            <div className="table-user">
                              <div className="user-avatar small">{(studentProfiles[enr.userId]?.username || "U").substring(0, 2).toUpperCase()}</div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#f1f5f9' }}>
                                  {studentProfiles[enr.userId]?.username || "Unknown Operative"}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                  ID: {studentProfiles[enr.userId]?.studentId || enr.userId?.substring(0, 8)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>{courses.find(c => c.id === enr.courseId)?.title || enr.courseId}</td>
                          <td>
                            <div className="table-progress">
                              <div className="progress-bar small">
                                <div className="progress-fill" style={{ width: `${enr.progress || 0}%` }} />
                              </div>
                              <span>{enr.progress || 0}%</span>
                            </div>
                          </td>
                          <td>
                            {Object.keys(enr.quizScores || {}).length > 0 ? (
                              <div>
                                {Object.entries(enr.quizScores).map(([qId, s]) => (
                                  <span key={qId} style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: '700' }}>
                                    {s.score}/{s.total} ({Math.round((s.score / s.total) * 100)}%)
                                  </span>
                                ))}
                              </div>
                            ) : <span style={{ color: '#475569', fontSize: '0.8rem' }}>No quizzes taken</span>}
                          </td>
                          <td>{enr.enrolledAt?.toDate ? enr.enrolledAt.toDate().toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                      {enrollments.length === 0 && (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No students enrolled yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ===== MATERIALS ===== */}
            {activeTab === "materials" && (
              <motion.div key="materials" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="tab-content">
                <div className="page-header">
                  <h2>Course Materials</h2>
                  <button className="btn-primary" onClick={() => setShowMaterialForm(true)}>
                    <Plus size={18} /> Add Material
                  </button>
                </div>

                <AnimatePresence>
                  {showMaterialForm && (
                    <motion.div className="dashboard-card" style={{ marginBottom: '1.5rem' }}
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <div className="card-header">
                        <h3><Upload size={18} /> Add New Material</h3>
                        <button className="icon-btn ghost" onClick={() => setShowMaterialForm(false)}><X size={16} /></button>
                      </div>
                      <form onSubmit={handleAddMaterial} style={{ padding: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label>Course</label>
                            <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} required>
                              <option value="">Select a course...</option>
                              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Material Type</label>
                            <select value={materialType} onChange={e => setMaterialType(e.target.value)}>
                              <option value="pdf">📄 PDF Document</option>
                              <option value="video">🎬 Video Link</option>
                              <option value="resource">🔗 Resource Link</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Title</label>
                            <input placeholder="e.g. Week 1 Notes" value={materialTitle} onChange={e => setMaterialTitle(e.target.value)} required />
                          </div>
                          <div className="form-group">
                            <label>URL / Link</label>
                            <input placeholder="https://..." value={materialUrl} onChange={e => setMaterialUrl(e.target.value)} required />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Description (optional)</label>
                          <textarea rows="2" placeholder="Brief description..." value={materialDesc} onChange={e => setMaterialDesc(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                          <button type="button" className="btn-secondary" onClick={() => setShowMaterialForm(false)}>Cancel</button>
                          <button type="submit" className="btn-primary" disabled={savingMaterial}>
                            {savingMaterial ? "Saving..." : "✅ Add Material"}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {courses.map(course => (
                  <div key={course.id} className="dashboard-card" style={{ marginBottom: '1rem' }}>
                    <div className="card-header">
                      <h3><BookOpen size={16} /> {course.title}</h3>
                      <button className="btn-text" onClick={() => { setSelectedCourseId(course.id); setShowMaterialForm(true); }}>
                        <Plus size={14} /> Add
                      </button>
                    </div>
                      <p style={{ color: '#64748b', fontSize: '0.83rem', padding: '0 0 0.5rem 0' }}>
                      Paste PDF links, video URLs, or external resources for students.
                    </p>
                    
                    {/* Display existing materials for this course */}
                    <div className="materials-preview-list">
                      {courseMaterials[course.id]?.length > 0 ? (
                        courseMaterials[course.id].map(m => (
                          <div key={m.id} className="material-preview-item">
                            <FileText size={14} color="#60a5fa" />
                            <div className="m-p-info">
                              <span className="m-p-title">{m.title}</span>
                              <span className="m-p-meta">{m.type.toUpperCase()} • {new Date(m.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                            </div>
                            <a href={m.url} target="_blank" rel="noopener noreferrer" className="m-p-link">View</a>
                          </div>
                        ))
                      ) : (
                        <div className="m-p-empty">No materials added yet.</div>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ===== QUIZ SCHEDULER ===== */}
            {activeTab === "quizzes" && (
              <motion.div key="quizzes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="tab-content">
                <div className="page-header">
                  <h2>Quiz Scheduler</h2>
                </div>
                <div className="dashboard-card">
                  <div className="card-header"><h3>All Quizzes</h3></div>
                  {quizzes.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                      <HelpCircle size={48} opacity={0.3} />
                      <p style={{ marginTop: '1rem' }}>No quizzes found.</p>
                    </div>
                  ) : (
                    <div style={{ padding: '0.5rem 0' }}>
                      {quizzes.map(quiz => {
                        const available = quiz.availableFrom ? new Date() >= new Date(quiz.availableFrom) : true;
                        return (
                          <div key={quiz.id} style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '700', color: '#f1f5f9', marginBottom: '0.25rem' }}>{quiz.title}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Course: {courses.find(c => c.id === quiz.courseId)?.title || quiz.courseId || "Global"}
                              </div>
                              {quiz.availableFrom && (
                                <div style={{ fontSize: '0.78rem', color: available ? '#10b981' : '#f59e0b', marginTop: '0.2rem' }}>
                                  <Clock size={12} style={{ display: 'inline', marginRight: '0.2rem' }} />
                                  {available ? "Available now" : `Unlocks: ${new Date(quiz.availableFrom).toLocaleString()}`}
                                </div>
                              )}
                              {!quiz.availableFrom && (
                                <div style={{ fontSize: '0.78rem', color: '#3b82f6', marginTop: '0.2rem' }}>Not yet scheduled</div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                style={{ padding: '0.5rem 1rem', background: quiz.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: quiz.isActive ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', color: quiz.isActive ? '#ef4444' : '#10b981', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
                                onClick={() => handleToggleQuiz(quiz.id, quiz.isActive)}
                              >
                                {quiz.isActive ? "Stop" : "Live"}
                              </button>
                              <button
                                style={{ padding: '0.5rem 1rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', color: '#818cf8', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
                                onClick={() => { setSchedulingQuiz(quiz); setScheduleDate(quiz.availableFrom ? new Date(quiz.availableFrom).toISOString().slice(0,16) : ""); setShowScheduleModal(true); }}
                              >
                                <Calendar size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />
                                {quiz.availableFrom ? "Reschedule" : "Schedule"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ===== TESTIMONIES ===== */}
            {activeTab === "testimonies" && (
              <motion.div key="testimonies" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="tab-content">
                <div className="page-header">
                  <h2>Testimony Moderation</h2>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{testimonies.length} pending</span>
                </div>
                {testimonies.length === 0 ? (
                  <div className="dashboard-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <Star size={48} opacity={0.3} />
                    <p style={{ marginTop: '1rem' }}>All caught up! No pending testimonies.</p>
                  </div>
                ) : testimonies.map(t => (
                  <div key={t.id} className="dashboard-card" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', color: '#f1f5f9', marginBottom: '0.25rem' }}>{t.name || t.username || "Anonymous"}</div>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 0.5rem', lineHeight: '1.5' }}>{t.message || t.content}</p>
                        <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                          {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button
                          style={{ padding: '0.5rem 1rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10b981', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}
                          onClick={() => handleApproveTestimony(t.id)}
                        >
                          <CheckCircle size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />Approve
                        </button>
                        <button
                          style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}
                          onClick={() => handleRejectTestimony(t.id)}
                        >
                          <Trash2 size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ===== MODERATION ===== */}
            {activeTab === "moderation" && (
              <motion.div key="moderation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="tab-content">
                <div className="page-header">
                  <h2>Content Moderation</h2>
                </div>
                <div className="dashboard-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <Shield size={48} opacity={0.3} />
                  <p style={{ marginTop: '1rem' }}>No reported content to review.</p>
                  <span style={{ fontSize: '0.85rem' }}>Reports from students about course content will appear here.</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Quiz Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && schedulingQuiz && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowScheduleModal(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Schedule Quiz</h2>
                <button className="icon-btn" onClick={() => setShowScheduleModal(false)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                  Set when <strong style={{ color: '#f1f5f9' }}>{schedulingQuiz.title}</strong> becomes available to students.
                </p>
                <div className="form-group">
                  <label>Available From (Date & Time)</label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', borderRadius: '8px', padding: '0.6rem 1rem', width: '100%' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleScheduleQuiz} disabled={!scheduleDate}>
                  <Calendar size={16} /> Schedule Quiz
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
