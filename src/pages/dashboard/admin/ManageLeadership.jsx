import { useEffect, useState, useCallback } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Users, Plus, Trash2, Edit3, X, Save, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function ManageLeadership() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "", bio: "", initials: "", order: 0 });
  const [editingId, setEditingId] = useState(null);

  const fetchMembers = useCallback(async () => {
    try {
      const data = await getDocs(collection(db, "leadership"));
      const list = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMembers(list.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err) {
      console.error("Error fetching leadership:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;
    try {
      if (editingId) {
        await updateDoc(doc(db, "leadership", editingId), newMember);
      } else {
        await addDoc(collection(db, "leadership"), {
          ...newMember,
          createdAt: serverTimestamp(),
        });
      }
      setNewMember({ name: "", role: "", bio: "", initials: "", order: 0 });
      setShowAdd(false);
      setEditingId(null);
      fetchMembers();
    } catch (err) {
      console.error("Error saving leadership member:", err);
    }
  };

  const handleEdit = (member) => {
    setNewMember({ name: member.name, role: member.role, bio: member.bio, initials: member.initials, order: member.order || 0 });
    setEditingId(member.id);
    setShowAdd(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this leader from the strategic unit?")) {
      try {
        await deleteDoc(doc(db, "leadership", id));
        fetchMembers();
      } catch (err) {
        console.error("Error deleting leader:", err);
      }
    }
  };

  if (loading) return <div className="ad-card">Initializing leadership protocols...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Strategic Leadership</h1>
          <p>Deploy and manage the elite unit driving platform innovation</p>
        </div>
        <button onClick={() => { setEditingId(null); setNewMember({ name: "", role: "", bio: "", initials: "", order: 0 }); setShowAdd(true); }} className="ad-btn-primary">
          <Plus size={18} /> New Leader
        </button>
      </div>

      {showAdd && (
        <div className="ad-form-card mb-8 border border-purple-500/20">
          <div className="flex justify-between items-center mb-6">
             <h3>{editingId ? "Edit Briefing" : "Commission New Leader"}</h3>
             <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
             </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            <div>
               <label className="ad-label">Full Name</label>
               <input 
                type="text" 
                value={newMember.name} 
                onChange={e => setNewMember({...newMember, name: e.target.value})}
                placeholder="Full Name/Callsign..."
                className="ad-input"
                required
               />
            </div>
            <div>
               <label className="ad-label">Duty/Role</label>
               <input 
                type="text" 
                value={newMember.role} 
                onChange={e => setNewMember({...newMember, role: e.target.value})}
                placeholder="Role (e.g. Chief Intelligence Officer)..."
                className="ad-input"
                required
               />
            </div>
            <div>
               <label className="ad-label">Initials</label>
               <input 
                type="text" 
                value={newMember.initials} 
                onChange={e => setNewMember({...newMember, initials: e.target.value})}
                placeholder="CB"
                maxLength={2}
                className="ad-input"
                required
               />
            </div>
            <div>
               <label className="ad-label">Priority Order</label>
               <input 
                type="number" 
                value={newMember.order} 
                onChange={e => setNewMember({...newMember, order: parseInt(e.target.value)})}
                className="ad-input"
               />
            </div>
            <div className="col-span-2">
               <label className="ad-label">Operational Bio</label>
               <textarea 
                value={newMember.bio} 
                onChange={e => setNewMember({...newMember, bio: e.target.value})}
                placeholder="Brief biography/mission focus..."
                className="ad-textarea min-h-[80px]"
               />
            </div>
            <div className="col-span-2">
               <button type="submit" className="ad-btn-primary w-full p-4">
                  <Save size={18} /> {editingId ? "Update Intel" : "Deploy Leader"}
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
                <th>Command Station</th>
                <th>Priority</th>
                <th>Briefing Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-12 text-slate-500">
                    No leadership deployed in the current sector.
                  </td>
                </tr>
              ) : (
                members.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-blue-400 border border-blue-500/20">
                          {m.initials}
                        </div>
                        <div>
                          <div className="font-bold text-white leading-tight">{m.name}</div>
                          <div className="text-[10px] text-blue-500 uppercase font-black tracking-widest mt-0.5">{m.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                       <span className="text-slate-500 font-mono">#{m.order || 0}</span>
                    </td>
                    <td>
                      <div className="text-xs text-slate-500 max-w-[300px] line-clamp-2">
                        {m.bio}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(m)} className="ad-btn-secondary !p-2">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="ad-btn-danger !p-2">
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
