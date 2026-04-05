import { useEffect, useState, useCallback } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Play, Trash2, User, Music, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function ManageReels() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReels = useCallback(async () => {
    try {
      const data = await getDocs(collection(db, "reels"));
      setReels(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } catch (err) {
      console.error("Error fetching reels:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReels(); }, [fetchReels]);

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this reel and its associated media?")) {
      try {
        await deleteDoc(doc(db, "reels", id));
        fetchReels();
      } catch (err) {
        console.error("Error deleting reel:", err);
      }
    }
  };

  if (loading) return <div className="ad-card">Loading mission assets...</div>;

  return (
    <>
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Reel Moderation</h1>
          <p>Monitor and manage global content transitions</p>
        </div>
      </div>

      <div className="ad-card" style={{ padding: '0' }}>
        <div className="ad-table-wrapper">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Intel Preview</th>
                <th>Author Info</th>
                <th>Metadata</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reels.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No intel registered in the network.
                  </td>
                </tr>
              ) : (
                reels.map(reel => (
                  <tr key={reel.id}>
                    <td>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ 
                          width: '60px', 
                          height: '80px', 
                          background: '#020617', 
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          {reel.videoUrl ? (
                            <video src={reel.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} muted />
                          ) : <Play size={20} className="text-slate-700" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: 'white', maxWidth: '200px' }} className="line-clamp-1">{reel.description || 'No description'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {reel.id.substring(0, 10)}...</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <User size={14} className="text-blue-400" />
                         <div style={{ color: '#e2e8f0', fontWeight: '500' }}>{reel.createdBy?.displayName || 'Unknown Author'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1 text-xs text-slate-400">
                        <div className="flex items-center gap-1"><Music size={10} /> {reel.music || 'Original Audio'}</div>
                        <div className="flex items-center gap-1"><Calendar size={10} /> {reel.createdAt ? format(reel.createdAt.toDate(), 'MMM d, p') : 'Pending'}</div>
                      </div>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(reel.id)} className="ad-btn-danger" style={{ padding: '0.5rem 0.75rem' }}>
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
