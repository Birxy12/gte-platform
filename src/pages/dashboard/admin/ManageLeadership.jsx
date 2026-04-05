import { useEffect, useState, useCallback } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Users, Plus, Trash2, Edit3, X, Save, Star } from "lucide-react";

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
    <>
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
        <div className="ad-card" style={{ marginBottom: '2rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
             <h3>{editingId ? "Edit Briefing" : "Commission New Leader"}</h3>
             <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
             </button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
               <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Full Name</label>
               <input 
                type="text" 
                value={newMember.name} 
                onChange={e => setNewMember({...newMember, name: e.target.value})}
                placeholder="Full Name/Callsign..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #1e293b', color: 'white' }}
                required
               />
            </div>
            <div>
               <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Duty/Role</label>
               <input 
                type="text" 
                value={newMember.role} 
                onChange={e => setNewMember({...newMember, role: e.target.value})}
                placeholder="Role (e.g. Chief Intelligence Officer)..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #1e293b', color: 'white' }}
                required
               />
            </div>
            <div>
               <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Initials</label>
               <input 
                type="text" 
                value={newMember.initials} 
                onChange={e => setNewMember({...newMember, initials: e.target.value})}
                placeholder="CB"
                maxLength={2}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #1e293b', color: 'white' }}
                required
               />
            </div>
            <div>
               <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Priority Order</label>
               <input 
                type="number" 
                value={newMember.order} 
                onChange={e => setNewMember({...newMember, order: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #1e293b', color: 'white' }}
               />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
               <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Operational Bio</label>
               <textarea 
                value={newMember.bio} 
                onChange={e => setNewMember({...newMember, bio: e.target.value})}
                placeholder="Brief biography/mission focus..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #1e293b', color: 'white', minHeight: '80px' }}
               />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
               <button type="submit" className="ad-btn-primary" style={{ flex: 1, padding: '1rem' }}>
                  <Save size={18} /> {editingId ? "Update Intel" : "Deploy Leader"}
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
                <th>Command Station</th>
                <th>Priority</th>
                <th>Briefing Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No leadership deployed in the current sector.
                  </td>
                </tr>
              ) : (
                members.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ 
                          width: '40px', height: '40px', borderRadius: '50%', 
                          background: 'linear-gradient(135deg, #1e293b, #334155)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontWeight: 'bold', color: '#60a5fa', border: '1px solid rgba(96, 165, 250, 0.2)'
                        }}>{m.initials}</div>
                        <div>
                          <div style={{ fontWeight: '700', color: 'white' }}>{m.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#60a5fa', textTransform: 'uppercase', fontWeight: 700 }}>{m.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                       <span style={{ color: '#94a3b8' }}>#{m.order || 0}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '300px' }} className="line-clamp-2">
                        {m.bio}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button onClick={() => handleEdit(m)} className="ad-btn-secondary" style={{ padding: '0.4rem' }}>
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="ad-btn-danger" style={{ padding: '0.4rem' }}>
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
    </>
  );
}
