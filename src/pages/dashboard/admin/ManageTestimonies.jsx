import { useEffect, useState } from "react";
import { db } from "../../../config/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy
} from "firebase/firestore";
import { format } from "date-fns";

export default function ManageTestimonies() {
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTestimonies = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "testimonies"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setTestimonies(list);
    } catch (err) {
      console.error(err);
      setError("Failed to load testimonies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const toggleApproval = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "testimonies", id), { published: !currentStatus });
      setTestimonies(testimonies.map(t => t.id === id ? { ...t, published: !currentStatus } : t));
    } catch (err) {
      console.error("Error updating testimony:", err);
      alert("Failed to update status.");
    }
  };

  const deleteTestimony = async (id) => {
    const confirmDelete = window.confirm("Permanently delete this testimony?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "testimonies", id));
      setTestimonies(testimonies.filter(t => t.id !== id));
      alert("Testimony deleted.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete testimony.");
    }
  };

  if (loading && testimonies.length === 0) return <div className="ad-card">Loading mission testimonies...</div>;
  if (error) return <div className="ad-card" style={{ color: '#f87171' }}>{error}</div>;

  return (
    <>
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Manage Testimonies</h1>
          <p>Review and moderate user breakthrough stories</p>
        </div>
      </div>

      <div className="ad-card" style={{ padding: '0' }}>
        <div className="ad-table-wrapper">
          <table className="ad-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Content</th>
                <th>Status</th>
                <th>Date Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonies.map(t => (
                <tr key={t.id}>
                  <td style={{ minWidth: '150px' }}>
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-msger-primary-gradient flex items-center justify-center text-white text-xs font-bold">
                        {(t.username || "U")[0].toUpperCase()}
                       </div>
                       <span style={{ fontWeight: '700' }}>{t.username || "Unknown"}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: '400px' }}>
                    <p className="text-sm text-slate-300 italic">"{t.content}"</p>
                  </td>
                  <td>
                    <span className={`role-badge ${t.published ? 'role-instructor' : 'role-user'}`}>
                      {t.published ? "✅ Published" : "⏳ Pending"}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {t.createdAt?.toDate ? format(t.createdAt.toDate(), "MMM dd, yyyy") : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button
                        className="ad-btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', minWidth: '100px' }}
                        onClick={() => toggleApproval(t.id, t.published)}
                      >
                        {t.published ? "Unpublish" : "Approve"}
                      </button>
                      <button
                        className="ad-btn-danger"
                        onClick={() => deleteTestimony(t.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {testimonies.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No testimonies found in the records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
