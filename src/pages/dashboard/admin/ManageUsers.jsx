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
  increment
} from "firebase/firestore";
import { Coins, Plus, TrendingUp } from "lucide-react";
import { mailService } from "../../../services/mailService";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", email: "", role: "user" });
  const [addingUser, setAddingUser] = useState(false);
  
  const [selectedUserForTask, setSelectedUserForTask] = useState(null);

  const fetchUsersAndTasks = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "users"));
      const usersList = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setUsers(usersList);

      const taskSnap = await getDocs(collection(db, "tasks"));
      setTasks(taskSnap.docs.map(t => ({ id: t.id, ...t.data() })));
    } catch (err) {
      console.error(err);
      setError("Failed to load users or tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndTasks();
  }, []);

  const changeRole = async (id, currentRole) => {
    const roles = ["user", "instructor", "admin"];
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];

    if (currentRole === "admin") {
      const confirm = window.confirm("Are you sure you want to change an admin's role?");
      if (!confirm) return;
    }

    try {
      await updateDoc(doc(db, "users", id), { role: nextRole });
      setUsers(users.map(u => u.id === id ? { ...u, role: nextRole } : u));
    } catch (err) {
      console.error("Error changing role:", err);
      if (err.code === "permission-denied") {
        alert("Permission denied: Your account lacks sufficient privileges to change user roles. Please check your Firestore security rules.");
      } else {
        alert("Failed to update role. Please try again.");
      }
    }
  };

  const toggleSuspension = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      await updateDoc(doc(db, "users", id), { suspended: nextStatus });
      setUsers(users.map(u => u.id === id ? { ...u, suspended: nextStatus } : u));
      alert(`User account ${nextStatus ? "SUSPENDED" : "REINSTATED"} successfully.`);
    } catch (err) {
      console.error(err);
      alert("Failed to update suspension status.");
    }
  };

  const deleteUser = async (id, role) => {
    if (role === "admin") {
      alert("You cannot delete an admin.");
      return;
    }

    const confirmDelete = window.confirm("Permanentely delete this user account?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", id));
      setUsers(users.filter(user => user.id !== id));
      alert("User record permanently deleted from Firestore.");
    } catch (err) {
      console.error(err);
      if (err.code === "permission-denied") {
        alert("Permission denied: Your account lacks sufficient privileges to delete users. Please check your Firestore security rules.");
      } else {
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  const allocateCoins = async (id, currentCoins) => {
    const amountStr = window.prompt(
      `ALLOCATE VAULT COINS (Current: ${currentCoins || 0})\n\n` +
      `Price Reference:\n` +
      `- Intro Mission: 100 Coins\n` +
      `- Advanced Operative Pack: 500 Coins\n` +
      `- Elite Masterclass: 1000 Coins\n` +
      `- Full Curriculum Access: 5000 Coins\n\n` +
      `Enter exact amount to award:`, 
      "100"
    );
    
    if (amountStr === null) return;
    const amountToAdd = parseInt(amountStr);
    
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      alert("Please enter a valid positive number of coins.");
      return;
    }

    try {
      if (amountToAdd > 0) {
        await updateDoc(doc(db, "users", id), {
          coins: increment(amountToAdd)
        });
        setUsers(users.map(u => u.id === id ? { ...u, coins: (u.coins || 0) + amountToAdd } : u));
        alert(`Successfully allocated ${amountToAdd} Vault Coins!`);

        // Send Email Notification
        await mailService.sendEmail(id, "coin_credit", { amount: amountToAdd }, {
            subject: "Vault Coins Credited to Your Account 🪙",
            body: `Hello {{username}},\n\nYour account has been officially credited with ${amountToAdd} Vault Coins by the academy administration.\nKeep up the good work and continue unlocking premium course access and reels.\n\nBest Regards,\nGLOBIXTECH ACADEMY`
        });
      }
    } catch (err) {
      console.error("Error allocating coins:", err);
      alert("Failed to allocate coins. Access Denied?");
    }
  };

  const grantTaskToUser = async (task) => {
    if (!selectedUserForTask) return;
    const reward = Number(task.levelReward) || 1;
    
    if (window.confirm(`Award '${task.title}' to ${selectedUserForTask.username}? This will boost their level by +${reward}.`)) {
      try {
        await updateDoc(doc(db, "users", selectedUserForTask.id), {
          level: increment(reward)
        });
        setUsers(users.map(u => u.id === selectedUserForTask.id ? { ...u, level: (u.level || 1) + reward } : u));
        alert(`Successfully boosted ${selectedUserForTask.username} by ${reward} levels!`);
        
        // Send Email
        await mailService.sendEmail(selectedUserForTask.id, "level_up", { reward, taskTitle: task.title }, {
            subject: "Mission Accomplished: Level Up! 🚀",
            body: `Hello {{username}},\n\nYou have been awarded for completing the objective: "${task.title}".\nYour rank has increased by +${reward} Levels!\n\nKeep pushing the boundaries of your education.\n\nBest Regards,\nGLOBIXTECH ACADEMY`
        });
        
        setSelectedUserForTask(null);
      } catch (err) {
        console.error("Error awarding task", err);
        alert("Failed to update user level. Check Firestore permissions.");
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email) return;

    setAddingUser(true);
    try {
      // Create a unique ID using a timestamp or similar for now
      // In a real app, this might be handled by Auth or a generated UID
      const customId = `manual_${Date.now()}`;
      const userRef = doc(db, "users", customId);

      const userData = {
        uid: customId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(userRef, userData);
      alert("User manually added to records! 👥");
      setShowAddForm(false);
      setNewUser({ username: "", email: "", role: "user" });
      fetchUsersAndTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to add user.");
    } finally {
      setAddingUser(false);
    }
  };

  if (loading && users.length === 0) return <div className="ad-card">Loading platform users...</div>;
  if (error) return <div className="ad-card" style={{ color: '#f87171' }}>{error}</div>;

  return (
    <>
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Manage Users</h1>
          <p>Control user permissions, roles and account access</p>
        </div>
        <button
          className="ad-btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "✕ Cancel" : "＋ Add User Manually"}
        </button>
      </div>

      {showAddForm && (
        <div className="ad-card" style={{ marginBottom: '2rem' }}>
          <h3>Add New User Record</h3>
          <form onSubmit={handleAddUser}>
            <div className="ad-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="ad-field">
                <label>Username</label>
                <input
                  placeholder="e.g. JohnDoe"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>
              <div className="ad-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="ad-field">
                <label>Platform Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="ad-btn-row">
              <button type="submit" className="ad-btn-primary" disabled={addingUser}>
                {addingUser ? "Adding..." : "✅ Confirm Add User"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="ad-card" style={{ padding: '0' }}>
        <div className="ad-table-wrapper">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Level</th>
                <th>Vault Balance</th>
                <th>Created/Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ fontWeight: '700' }}>{user.username || "N/A"}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role || 'user'}`}>
                      {user.role || "user"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: '#10b981' }}>
                      LVL {user.level || 1}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#fbbf24' }}>
                      <Coins size={16} />
                      {user.coins || 0}
                    </div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'Manual Record'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button
                        className="ad-btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => changeRole(user.id, user.role || 'user')}
                      >
                        Change Role
                      </button>
                      <button
                        className="ad-btn-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', border: 'none' }}
                        onClick={() => allocateCoins(user.id, user.coins || 0)}
                      >
                        <Plus size={14} style={{ marginRight: '4px' }} /> MINT
                      </button>
                      <button
                        className="ad-btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: '#fff' }}
                        onClick={() => setSelectedUserForTask(user)}
                      >
                        <TrendingUp size={14} style={{ marginRight: '4px' }} /> AWARD TASK
                      </button>
                      {user.role !== "admin" && (
                        <>
                          <button
                            className={`ad-btn-secondary ${user.suspended ? 'suspended' : ''}`}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: user.suspended ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', color: user.suspended ? '#ef4444' : 'inherit' }}
                            onClick={() => toggleSuspension(user.id, user.suspended || false)}
                          >
                            {user.suspended ? "Unsuspend" : "Suspend"}
                          </button>
                          <button
                            className="ad-btn-danger"
                            onClick={() => deleteUser(user.id, user.role)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Awarding Modal */}
      {selectedUserForTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="ad-card" style={{ maxWidth: '500px', width: '100%', position: 'relative' }}>
             <h3 style={{ marginBottom: '1.5rem', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                Award Task to {selectedUserForTask.username}
             </h3>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto', marginBottom: '1.5rem' }}>
               {tasks.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center' }}>No tasks created yet.</p>
               ) : (
                 tasks.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => grantTaskToUser(t)} 
                      className="ad-btn-secondary"
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '1rem' }}
                    >
                       <span style={{ fontWeight: '600' }}>{t.title}</span> 
                       <span style={{ color: '#f59e0b', fontWeight: '800' }}>+{t.levelReward || 1} LVL</span>
                    </button>
                 ))
               )}
             </div>

             <button 
                onClick={() => setSelectedUserForTask(null)} 
                className="ad-btn-primary w-full"
                style={{ background: '#334155', border: '1px solid #475569' }}
             >
               Cancel
             </button>
          </div>
        </div>
      )}
    </>
  );
}
