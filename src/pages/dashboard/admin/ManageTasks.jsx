import { useEffect, useState, useCallback } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { CheckCircle, Clock, Plus, Trash2, Edit3, X, Save } from "lucide-react";
import { format } from "date-fns";

export default function ManageTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", status: "pending" });

  const fetchTasks = useCallback(async () => {
    try {
      const data = await getDocs(collection(db, "tasks"));
      setTasks(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    try {
      await addDoc(collection(db, "tasks"), {
        ...newTask,
        createdAt: serverTimestamp(),
      });
      setNewTask({ title: "", description: "", priority: "medium", status: "pending" });
      setShowAdd(false);
      fetchTasks();
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const toggleStatus = async (task) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await updateDoc(doc(db, "tasks", task.id), { status: nextStatus });
      fetchTasks();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this mission task?")) {
      try {
        await deleteDoc(doc(db, "tasks", id));
        fetchTasks();
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  };

  if (loading) return <div className="ad-card">Synchronizing mission objectives...</div>;

  return (
    <>
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Mission Objectives</h1>
          <p>Assign and track platform-wide operational tasks</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="ad-btn-primary">
          <Plus size={18} /> New Objective
        </button>
      </div>

      {showAdd && (
        <div className="ad-card" style={{ marginBottom: '2rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
             <h3>Assign New Task</h3>
             <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
             </button>
          </div>
          <form onSubmit={handleAddTask} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
               <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Objective Title</label>
               <input 
                type="text" 
                value={newTask.title} 
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                placeholder="High-level mission title..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #1e293b', color: 'white' }}
                required
               />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
               <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Detailed Briefing</label>
               <textarea 
                value={newTask.description} 
                onChange={e => setNewTask({...newTask, description: e.target.value})}
                placeholder="Operational details for the task force..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #1e293b', color: 'white', minHeight: '100px' }}
               />
            </div>
            <div>
               <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Priority Level</label>
               <select 
                value={newTask.priority} 
                onChange={e => setNewTask({...newTask, priority: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #1e293b', color: 'white' }}
               >
                 <option value="low">Low Priority</option>
                 <option value="medium">Medium Priority</option>
                 <option value="high">High Priority (CRITICAL)</option>
               </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
               <button type="submit" className="ad-btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                  <Save size={18} /> Deploy Task
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
                <th>Objective Details</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No mission objectives deployed.
                  </td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: '700', color: 'white' }}>{task.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '350px' }}>{task.description}</div>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: task.priority === 'high' ? '#ef4444' : '#3b82f6'
                      }}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleStatus(task)}
                        style={{ background: 'none', border: 'none', padding: 0 }}
                      >
                        {task.status === 'completed' ? (
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', color: '#10b981' }}>
                            <CheckCircle size={14} /> <span style={{ fontSize: '0.8rem' }}>Resolved</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', color: '#fbbf24' }}>
                            <Clock size={14} /> <span style={{ fontSize: '0.8rem' }}>In Progress</span>
                          </div>
                        )}
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(task.id)} className="ad-btn-danger" style={{ padding: '0.5rem 0.75rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
