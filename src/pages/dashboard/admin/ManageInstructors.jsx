import { useEffect, useState } from "react";
import { db } from "../../../config/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where
} from "firebase/firestore";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Calendar, 
  Award, 
  BookOpen, 
  CheckCircle,
  XCircle,
  Edit3,
  Shield,
  UserCheck,
  Star,
  Clock,
  UserX,
  Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./Admindashboard.css";

export default function ManageInstructors() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [updating, setUpdating] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ email: "", password: "", username: "", role: "student" });
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "users"));
      const usersList = snapshot.docs.map(d => ({
        ...d.data(),
        id: d.id
      }));
      setUsers(usersList);
    } catch (err) {
      console.error(err);
      setError("Failed to load users. Check Firestore permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserData.email || !newUserData.password || !newUserData.username) {
      alert("All fields are required.");
      return;
    }
    setCreating(true);
    try {
      const { setDoc, serverTimestamp, doc } = await import("firebase/firestore");
      // Note: In this frontend-only context, we simulate user creation by adding to the 'users' collection.
      // This allows them to sign up later and be automatically granted the role, OR
      // if using a custom backend/function, it would be handled differently.
      const userId = `user_${Date.now()}`;
      
      await setDoc(doc(db, "users", userId), {
        email: newUserData.email,
        username: newUserData.username,
        role: newUserData.role,
        createdAt: serverTimestamp(),
        manualAdd: true
      });
      
      alert(`User "${newUserData.username}" added to directory as ${newUserData.role}.`);
      setShowCreateModal(false);
      setNewUserData({ email: "", password: "", username: "", role: "student" });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to create user entry.");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const promoteToInstructor = async (userId, username) => {
    if (!window.confirm(`Promote "${username}" to Instructor? They will gain course management access.`)) return;
    setUpdating(userId);
    try {
      await updateDoc(doc(db, "users", userId), {
        role: "instructor",
        promotedAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: "instructor" } : u));
    } catch (err) {
      console.error(err);
      if (err.code === "permission-denied") {
        alert("Permission denied: Only admins can promote instructors.");
      } else {
        alert("Failed to promote user.");
      }
    } finally {
      setUpdating(null);
    }
  };

  const demoteFromInstructor = async (userId, username) => {
    if (!window.confirm(`Remove instructor access from "${username}"? They will revert to student role.`)) return;
    setUpdating(userId);
    try {
      await updateDoc(doc(db, "users", userId), {
        role: "student",
        demotedAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: "student" } : u));
    } catch (err) {
      console.error(err);
      alert("Failed to remove instructor access.");
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterRole === "all") return matchesSearch;
    if (filterRole === "instructor") return matchesSearch && (u.role === "instructor" || u.role === "admin");
    if (filterRole === "student") return matchesSearch && (u.role === "student" || !u.role);
    return matchesSearch;
  });

  const instructors = users.filter(u => u.role === "instructor" || u.role === "admin");
  const pendingUsers = users.filter(u => !u.role || u.role === "student");

  const getRoleBadge = (role) => {
    if (role === "admin") return { label: "Admin (Instructor)", color: "purple", icon: Crown };
    if (role === "instructor") return { label: "Instructor", color: "green", icon: UserCheck };
    if (role === "suspended") return { label: "Suspended", color: "red", icon: UserX };
    return { label: "Student", color: "gray", icon: Users };
  };

  if (loading && users.length === 0) {
    return (
      <div className="mi-loading">
        <div className="mi-spinner"></div>
        <p>Loading user directory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mi-error">
        <XCircle size={48} />
        <p>{error}</p>
        <button onClick={fetchUsers}>Retry</button>
      </div>
    );
  }

  return (
    <div className="manage-instructors">
      {/* Header Section */}
      <div className="mi-header">
        <div className="mi-header-content">
          <div className="mi-title">
            <UserCheck size={32} className="mi-icon" />
            <div>
              <h1>Manage Instructors</h1>
              <p>Promote or remove instructor access for any platform user</p>
            </div>
          </div>
          <button className="mi-create-btn" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> Create New User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mi-stats-grid">
        <motion.div className="mi-stat-card blue" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Users size={24} />
          <div>
            <span className="mi-stat-value">{users.length}</span>
            <span className="mi-stat-label">Total Users</span>
          </div>
        </motion.div>

        <motion.div className="mi-stat-card green" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <UserCheck size={24} />
          <div>
            <span className="mi-stat-value">{users.filter(u => u.role === "instructor").length}</span>
            <span className="mi-stat-label">Instructors</span>
          </div>
        </motion.div>

        <motion.div className="mi-stat-card purple" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Crown size={24} />
          <div>
            <span className="mi-stat-value">{users.filter(u => u.role === "admin").length}</span>
            <span className="mi-stat-label">Admins</span>
          </div>
        </motion.div>

        <motion.div className="mi-stat-card amber" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Clock size={24} />
          <div>
            <span className="mi-stat-value">{users.filter(u => !u.role || u.role === "student").length}</span>
            <span className="mi-stat-label">Students</span>
          </div>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <div className="mi-filters">
        <div className="mi-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mi-filter-group">
          <Filter size={18} />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Users</option>
            <option value="instructor">Instructors & Admins</option>
            <option value="student">Students Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="mi-table-card">
        <div className="mi-table-header">
          <h3>User Directory</h3>
          <span className="mi-count">{filteredUsers.length} users</span>
        </div>

        <div className="mi-table-wrapper">
          <table className="mi-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="mi-empty">
                    <Users size={48} />
                    <p>No users found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const badge = getRoleBadge(user.role);
                  const BadgeIcon = badge.icon;
                  const isUpdating = updating === user.id;
                  const isAdmin = user.role === "admin";
                  const isInstructor = user.role === "instructor";

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <td>
                        <div className="mi-instructor-info">
                          <div className="mi-avatar">
                            {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <span className="mi-name">{user.username || "Unnamed"}</span>
                            <span className="mi-email">
                              <Mail size={12} /> {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`mi-status-badge ${badge.color}`}>
                          <BadgeIcon size={14} />
                          {badge.label}
                        </span>
                      </td>

                      <td className="mi-date">
                        <Calendar size={14} />
                        {user.createdAt?.toDate
                          ? user.createdAt.toDate().toLocaleDateString()
                          : user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>

                      <td>
                        <div className="mi-actions">
                          {isAdmin ? (
                            <span style={{ color: '#a855f7', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Crown size={14} /> Admin Access
                            </span>
                          ) : isInstructor ? (
                            <button
                              className="mi-btn-icon delete"
                              onClick={() => demoteFromInstructor(user.id, user.username || user.email)}
                              disabled={isUpdating}
                              title="Remove Instructor Access"
                            >
                              {isUpdating ? <Clock size={16} /> : <UserX size={16} />}
                              {isUpdating ? "Updating..." : "Remove Instructor"}
                            </button>
                          ) : (
                            <button
                              className="mi-btn-icon verify"
                              onClick={() => promoteToInstructor(user.id, user.username || user.email)}
                              disabled={isUpdating}
                              title="Promote to Instructor"
                            >
                              {isUpdating ? <Clock size={16} /> : <Shield size={16} />}
                              {isUpdating ? "Updating..." : "Make Instructor"}
                            </button>
                          )}
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

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div className="mi-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)}>
            <motion.div className="mi-modal-content" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="mi-modal-header">
                <h2>Create New User</h2>
                <button onClick={() => setShowCreateModal(false)}><XCircle size={20} /></button>
              </div>
              <form onSubmit={handleCreateUser} className="mi-modal-form">
                <div className="mi-field">
                  <label>Username</label>
                  <input type="text" value={newUserData.username} onChange={e => setNewUserData({ ...newUserData, username: e.target.value })} required />
                </div>
                <div className="mi-field">
                  <label>Email</label>
                  <input type="email" value={newUserData.email} onChange={e => setNewUserData({ ...newUserData, email: e.target.value })} required />
                </div>
                <div className="mi-field">
                  <label>Password (Temporary)</label>
                  <input type="password" value={newUserData.password} onChange={e => setNewUserData({ ...newUserData, password: e.target.value })} required />
                </div>
                <div className="mi-field">
                  <label>Initial Role</label>
                  <select value={newUserData.role} onChange={e => setNewUserData({ ...newUserData, role: e.target.value })}>
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>
                <button type="submit" className="mi-submit-btn" disabled={creating}>
                  {creating ? "Creating..." : "Create User"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
