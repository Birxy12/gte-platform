import { useEffect, useState } from "react";
import { db } from "../../../config/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp,
  query,
  where
} from "firebase/firestore";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Calendar, 
  Award, 
  BookOpen, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Shield,
  UserCheck,
  Star,
  DollarSign,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./Admindashboard.css";

export default function ManageInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [newInstructor, setNewInstructor] = useState({ 
    username: "", 
    email: "", 
    bio: "",
    expertise: [],
    status: "pending",
    hourlyRate: 50
  });
  const [addingInstructor, setAddingInstructor] = useState(false);

  const expertiseOptions = [
    "Frontend Development",
    "Backend Development", 
    "Full Stack",
    "DevOps",
    "Data Science",
    "Mobile Development",
    "UI/UX Design",
    "Cloud Computing",
    "Cybersecurity",
    "AI/ML"
  ];

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "users"), where("role", "in", ["instructor", "pending_instructor"]));
      const snapshot = await getDocs(q);
      const instructorsList = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setInstructors(instructorsList);
    } catch (err) {
      console.error(err);
      setError("Failed to load instructors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const changeStatus = async (id, currentStatus) => {
    const statuses = ["pending", "active", "suspended", "inactive"];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

    if (currentStatus === "active" && nextStatus === "suspended") {
      const confirm = window.confirm("Are you sure you want to suspend this instructor? They will lose access to create courses.");
      if (!confirm) return;
    }

    try {
      await updateDoc(doc(db, "users", id), { 
        status: nextStatus,
        updatedAt: new Date().toISOString()
      });
      setInstructors(instructors.map(i => i.id === id ? { ...i, status: nextStatus } : i));
    } catch (err) {
      console.error("Error changing status:", err);
      if (err.code === "permission-denied") {
        alert("Permission denied: Insufficient privileges to modify instructor status.");
      } else {
        alert("Failed to update status. Please try again.");
      }
    }
  };

  const verifyInstructor = async (id) => {
    const confirm = window.confirm("Verify this instructor? They will gain full instructor privileges.");
    if (!confirm) return;

    try {
      await updateDoc(doc(db, "users", id), { 
        status: "active",
        verifiedAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      });
      setInstructors(instructors.map(i => i.id === id ? { ...i, status: "active" } : i));
      alert("Instructor verified successfully! ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to verify instructor.");
    }
  };

  const deleteInstructor = async (id, status) => {
    if (status === "active") {
      const confirm = window.confirm("⚠️ This instructor has active courses. Deleting will unenroll all students. Continue?");
      if (!confirm) return;
    }

    const confirmDelete = window.confirm("Permanently delete this instructor account?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", id));
      setInstructors(instructors.filter(i => i.id !== id));
      alert("Instructor record permanently deleted.");
    } catch (err) {
      console.error(err);
      if (err.code === "permission-denied") {
        alert("Permission denied: Insufficient privileges to delete instructors.");
      } else {
        alert("Failed to delete instructor. Please try again.");
      }
    }
  };

  const handleAddInstructor = async (e) => {
    e.preventDefault();
    if (!newInstructor.username || !newInstructor.email) return;

    setAddingInstructor(true);
    try {
      const customId = `inst_${Date.now()}`;
      const instructorRef = doc(db, "users", customId);

      const instructorData = {
        uid: customId,
        username: newInstructor.username,
        email: newInstructor.email,
        bio: newInstructor.bio,
        expertise: newInstructor.expertise,
        role: "instructor",
        status: newInstructor.status,
        hourlyRate: parseInt(newInstructor.hourlyRate) || 50,
        totalStudents: 0,
        totalRevenue: 0,
        averageRating: 0,
        coursesCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(instructorRef, instructorData);
      alert("Instructor added successfully! 👨‍🏫");
      setShowAddForm(false);
      setNewInstructor({ 
        username: "", 
        email: "", 
        bio: "",
        expertise: [],
        status: "pending",
        hourlyRate: 50
      });
      fetchInstructors();
    } catch (err) {
      console.error(err);
      alert("Failed to add instructor.");
    } finally {
      setAddingInstructor(false);
    }
  };

  const handleUpdateInstructor = async (e) => {
    e.preventDefault();
    if (!selectedInstructor) return;

    try {
      await updateDoc(doc(db, "users", selectedInstructor.id), {
        ...selectedInstructor,
        updatedAt: new Date().toISOString()
      });
      alert("Instructor updated successfully! ✏️");
      setShowEditModal(false);
      setSelectedInstructor(null);
      fetchInstructors();
    } catch (err) {
      console.error(err);
      alert("Failed to update instructor.");
    }
  };

  const toggleExpertise = (exp) => {
    setNewInstructor(prev => ({
      ...prev,
      expertise: prev.expertise.includes(exp)
        ? prev.expertise.filter(e => e !== exp)
        : [...prev.expertise, exp]
    }));
  };

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = 
      instructor.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.expertise?.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === "all" || instructor.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    const colors = {
      active: "green",
      pending: "amber",
      suspended: "red",
      inactive: "gray"
    };
    return colors[status] || "gray";
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: CheckCircle,
      pending: Clock,
      suspended: XCircle,
      inactive: UserCheck
    };
    return icons[status] || Clock;
  };

  const stats = {
    total: instructors.length,
    active: instructors.filter(i => i.status === "active").length,
    pending: instructors.filter(i => i.status === "pending").length,
    suspended: instructors.filter(i => i.status === "suspended").length,
    totalRevenue: instructors.reduce((acc, i) => acc + (i.totalRevenue || 0), 0),
    totalStudents: instructors.reduce((acc, i) => acc + (i.totalStudents || 0), 0)
  };

  if (loading && instructors.length === 0) {
    return (
      <div className="mi-loading">
        <div className="mi-spinner"></div>
        <p>Loading instructor data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mi-error">
        <XCircle size={48} />
        <p>{error}</p>
        <button onClick={fetchInstructors}>Retry</button>
      </div>
    );
  }

  return (
    <div className="manage-instructors">
      {/* Header Section */}
      <div className="mi-header">
        <div className="mi-header-content">
          <div className="mi-title">
            <Users size={32} className="mi-icon" />
            <div>
              <h1>Manage Instructors</h1>
              <p>Oversee instructor accounts, verify credentials, and monitor performance</p>
            </div>
          </div>
          <button
            className="mi-btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? <XCircle size={18} /> : <Plus size={18} />}
            {showAddForm ? "Cancel" : "Add Instructor"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mi-stats-grid">
        <motion.div 
          className="mi-stat-card blue"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Users size={24} />
          <div>
            <span className="mi-stat-value">{stats.total}</span>
            <span className="mi-stat-label">Total Instructors</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="mi-stat-card green"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CheckCircle size={24} />
          <div>
            <span className="mi-stat-value">{stats.active}</span>
            <span className="mi-stat-label">Active</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="mi-stat-card amber"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Clock size={24} />
          <div>
            <span className="mi-stat-value">{stats.pending}</span>
            <span className="mi-stat-label">Pending Verification</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="mi-stat-card purple"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DollarSign size={24} />
          <div>
            <span className="mi-stat-value">${stats.totalRevenue.toLocaleString()}</span>
            <span className="mi-stat-label">Total Revenue</span>
          </div>
        </motion.div>
      </div>

      {/* Add Instructor Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            className="mi-form-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="mi-form-header">
              <h3><Plus size={20} /> Add New Instructor</h3>
              <p>Create a new instructor account manually</p>
            </div>
            
            <form onSubmit={handleAddInstructor}>
              <div className="mi-form-grid">
                <div className="mi-field">
                  <label>Full Name</label>
                  <input
                    placeholder="e.g. Sarah Johnson"
                    value={newInstructor.username}
                    onChange={(e) => setNewInstructor({ ...newInstructor, username: e.target.value })}
                    required
                  />
                </div>
                
                <div className="mi-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="sarah@example.com"
                    value={newInstructor.email}
                    onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="mi-field">
                  <label>Hourly Rate ($)</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={newInstructor.hourlyRate}
                    onChange={(e) => setNewInstructor({ ...newInstructor, hourlyRate: e.target.value })}
                  />
                </div>
                
                <div className="mi-field">
                  <label>Initial Status</label>
                  <select
                    value={newInstructor.status}
                    onChange={(e) => setNewInstructor({ ...newInstructor, status: e.target.value })}
                  >
                    <option value="pending">Pending Verification</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mi-field full-width">
                <label>Bio / Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief description of instructor background and expertise..."
                  value={newInstructor.bio}
                  onChange={(e) => setNewInstructor({ ...newInstructor, bio: e.target.value })}
                />
              </div>

              <div className="mi-field full-width">
                <label>Areas of Expertise</label>
                <div className="mi-expertise-tags">
                  {expertiseOptions.map(exp => (
                    <button
                      key={exp}
                      type="button"
                      className={`mi-tag ${newInstructor.expertise.includes(exp) ? 'active' : ''}`}
                      onClick={() => toggleExpertise(exp)}
                    >
                      {newInstructor.expertise.includes(exp) && <CheckCircle size={14} />}
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mi-form-actions">
                <button type="button" className="mi-btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="mi-btn-primary" disabled={addingInstructor}>
                  {addingInstructor ? "Adding..." : "✅ Add Instructor"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search */}
      <div className="mi-filters">
        <div className="mi-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search instructors by name, email, or expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="mi-filter-group">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Instructors Table */}
      <div className="mi-table-card">
        <div className="mi-table-header">
          <h3>Instructor Directory</h3>
          <span className="mi-count">{filteredInstructors.length} instructors</span>
        </div>
        
        <div className="mi-table-wrapper">
          <table className="mi-table">
            <thead>
              <tr>
                <th>Instructor</th>
                <th>Expertise</th>
                <th>Performance</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="mi-empty">
                    <Users size={48} />
                    <p>No instructors found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredInstructors.map((instructor, idx) => {
                  const StatusIcon = getStatusIcon(instructor.status);
                  return (
                    <motion.tr 
                      key={instructor.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td>
                        <div className="mi-instructor-info">
                          <div className="mi-avatar">
                            {instructor.username?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <span className="mi-name">{instructor.username || "N/A"}</span>
                            <span className="mi-email">
                              <Mail size={12} /> {instructor.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td>
                        <div className="mi-expertise-list">
                          {instructor.expertise?.slice(0, 2).map((exp, i) => (
                            <span key={i} className="mi-expertise-badge">{exp}</span>
                          ))}
                          {instructor.expertise?.length > 2 && (
                            <span className="mi-more">+{instructor.expertise.length - 2}</span>
                          )}
                        </div>
                      </td>
                      
                      <td>
                        <div className="mi-performance">
                          <div className="mi-metric">
                            <BookOpen size={14} />
                            <span>{instructor.coursesCount || 0} courses</span>
                          </div>
                          <div className="mi-metric">
                            <Users size={14} />
                            <span>{instructor.totalStudents || 0} students</span>
                          </div>
                          <div className="mi-metric">
                            <Star size={14} />
                            <span>{instructor.averageRating || "0.0"} ★</span>
                          </div>
                        </div>
                      </td>
                      
                      <td>
                        <button
                          className={`mi-status-badge ${getStatusColor(instructor.status)}`}
                          onClick={() => changeStatus(instructor.id, instructor.status)}
                        >
                          <StatusIcon size={14} />
                          {instructor.status}
                        </button>
                      </td>
                      
                      <td className="mi-date">
                        <Calendar size={14} />
                        {instructor.createdAt?.toDate 
                          ? instructor.createdAt.toDate().toLocaleDateString() 
                          : 'N/A'}
                      </td>
                      
                      <td>
                        <div className="mi-actions">
                          <button 
                            className="mi-btn-icon"
                            onClick={() => {
                              setSelectedInstructor(instructor);
                              setShowEditModal(true);
                            }}
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          
                          {instructor.status === "pending" && (
                            <button 
                              className="mi-btn-icon verify"
                              onClick={() => verifyInstructor(instructor.id)}
                              title="Verify Instructor"
                            >
                              <Shield size={16} />
                            </button>
                          )}
                          
                          <button 
                            className="mi-btn-icon delete"
                            onClick={() => deleteInstructor(instructor.id, instructor.status)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedInstructor && (
          <div className="mi-modal-overlay" onClick={() => setShowEditModal(false)}>
            <motion.div 
              className="mi-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mi-modal-header">
                <h3><Edit3 size={20} /> Edit Instructor</h3>
                <button className="mi-btn-icon" onClick={() => setShowEditModal(false)}>
                  <XCircle size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateInstructor}>
                <div className="mi-form-grid">
                  <div className="mi-field">
                    <label>Full Name</label>
                    <input
                      value={selectedInstructor.username}
                      onChange={(e) => setSelectedInstructor({...selectedInstructor, username: e.target.value})}
                    />
                  </div>
                  
                  <div className="mi-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={selectedInstructor.email}
                      onChange={(e) => setSelectedInstructor({...selectedInstructor, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="mi-field">
                    <label>Hourly Rate ($)</label>
                    <input
                      type="number"
                      value={selectedInstructor.hourlyRate || 50}
                      onChange={(e) => setSelectedInstructor({...selectedInstructor, hourlyRate: e.target.value})}
                    />
                  </div>
                  
                  <div className="mi-field">
                    <label>Status</label>
                    <select
                      value={selectedInstructor.status}
                      onChange={(e) => setSelectedInstructor({...selectedInstructor, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="mi-field full-width">
                  <label>Bio</label>
                  <textarea
                    rows="3"
                    value={selectedInstructor.bio || ""}
                    onChange={(e) => setSelectedInstructor({...selectedInstructor, bio: e.target.value})}
                  />
                </div>
                
                <div className="mi-modal-footer">
                  <button type="button" className="mi-btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="mi-btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
