import { useEffect, useState, useCallback } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { CheckCircle, Clock, Plus, Trash2, Edit3, X, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function ManageTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", status: "pending", levelReward: 1 });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    try {
      if (editingId) {
        await updateDoc(doc(db, "tasks", editingId), {
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          status: newTask.status,
          levelReward: Number(newTask.levelReward) || 1,
        });
      } else {
        await addDoc(collection(db, "tasks"), {
          ...newTask,
          levelReward: Number(newTask.levelReward) || 1,
          createdAt: serverTimestamp(),
        });
        
        // Broadcast new task email
        import('../../../services/mailService').then(({ mailService }) => {
            mailService.broadcastEmail("new_task_alert", { taskTitle: newTask.title }, {
                subject: "New Mission Objective Available 🎯",
                body: `Hello {{username}},\n\nA new global objective has been posted by the administration:\n\nMission: ${newTask.title}\nReward: +${Number(newTask.levelReward) || 1} Levels\n\nLog in to the portal to review the complete mission briefing and begin execution.\n\nBest Regards,\nGLOBIXTECH ACADEMY`
            });
        }).catch(err => console.error("Mail service import error", err));
      }
      setNewTask({ title: "", description: "", priority: "medium", status: "pending", levelReward: 1 });
      setShowAdd(false);
      setEditingId(null);
      fetchTasks();
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  const handleEdit = (task) => {
    setNewTask({ title: task.title, description: task.description, priority: task.priority, status: task.status, levelReward: task.levelReward || 1 });
    setEditingId(task.id);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setShowAdd(false);
    setEditingId(null);
    setNewTask({ title: "", description: "", priority: "medium", status: "pending", levelReward: 1 });
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Mission Objectives</h1>
          <p>Assign and track platform-wide operational tasks</p>
        </div>
        <button onClick={() => { setEditingId(null); setNewTask({ title: "", description: "", priority: "medium", status: "pending", levelReward: 1 }); setShowAdd(true); }} className="ad-btn-primary">
          <Plus size={18} /> New Objective
        </button>
      </div>

      {showAdd && (
        <div className="ad-form-card mb-8 border border-blue-500/20">
          <div className="flex justify-between items-center mb-6">
             <h3>{editingId ? "Edit Mission Objective" : "Assign New Task"}</h3>
             <button onClick={handleCancel} className="text-slate-500 hover:text-white">
                <X size={20} />
             </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
               <label className="ad-label">Objective Title</label>
               <input 
                type="text" 
                value={newTask.title} 
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                placeholder="High-level mission title..."
                className="ad-input"
                required
               />
            </div>
            <div className="col-span-2">
               <label className="ad-label">Detailed Briefing</label>
               <textarea 
                value={newTask.description} 
                onChange={e => setNewTask({...newTask, description: e.target.value})}
                placeholder="Operational details for the task force..."
                className="ad-textarea min-h-[100px]"
               />
            </div>
            <div>
               <label className="ad-label">Priority Level</label>
               <select 
                value={newTask.priority} 
                onChange={e => setNewTask({...newTask, priority: e.target.value})}
                className="ad-select"
               >
                 <option value="low">Low Priority</option>
                 <option value="medium">Medium Priority</option>
                 <option value="high">High Priority (CRITICAL)</option>
               </select>
            </div>
            <div>
               <label className="ad-label">Level Boost Reward (+)</label>
               <input 
                type="number"
                min="0"
                max="100"
                value={newTask.levelReward} 
                onChange={e => setNewTask({...newTask, levelReward: parseInt(e.target.value) || 0})}
                placeholder="Levels granted..."
                className="ad-input text-amber-500 font-bold"
               />
            </div>
            <div className="col-span-2">
               <label className="ad-label">Status</label>
               <select
                value={newTask.status}
                onChange={e => setNewTask({...newTask, status: e.target.value})}
                className="ad-select"
               >
                 <option value="pending">In Progress</option>
                 <option value="completed">Completed</option>
               </select>
            </div>
            <div className="col-span-2">
               <button type="submit" className="ad-btn-primary w-full p-4">
                  <Save size={18} /> {editingId ? "Update Objective" : "Deploy Task"}
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="ad-card !p-0">
        <div className="ad-table-wrapper">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Objective Details</th>
                <th>Level Reward</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-12 text-slate-500">
                    No mission objectives deployed in the current sector.
                  </td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div className="font-bold text-white mb-1">{task.title}</div>
                      <div className="text-xs text-slate-500 max-w-[350px] line-clamp-1">{task.description}</div>
                    </td>
                    <td>
                      <div className="font-black text-amber-500">+{task.levelReward || 0} LVL</div>
                    </td>
                    <td>
                      <span className={`badge badge-${task.priority}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleStatus(task)}
                        className="bg-none border-none p-0 cursor-pointer"
                      >
                        {task.status === 'completed' ? (
                          <div className="flex items-center gap-2 text-green-500 font-bold text-xs uppercase">
                            <CheckCircle size={14} /> Resolved
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase">
                            <Clock size={14} /> In Progress
                          </div>
                        )}
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(task)} className="ad-btn-secondary !p-2" title="Edit task">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(task.id)} className="ad-btn-danger !p-2" title="Delete task">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
