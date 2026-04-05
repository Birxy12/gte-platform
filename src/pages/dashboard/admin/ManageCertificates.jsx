import { useEffect, useState, useCallback } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { Award, Trash2, User, Book, CheckCircle, Download } from "lucide-react";
import { format } from "date-fns";

export default function ManageCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = useCallback(async () => {
    try {
      // Certificates are derived from userProgress docs that are marked as completed
      const q = query(collection(db, "userProgress"), where("completed", "==", true));
      const data = await getDocs(q);
      setCertificates(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } catch (err) {
      console.error("Error fetching certificates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCertificates(); }, [fetchCertificates]);

  const handleRevoke = async (id) => {
    if (window.confirm("Revoke this certificate? This will mark the user's course as incomplete.")) {
      try {
        await deleteDoc(doc(db, "userProgress", id));
        fetchCertificates();
      } catch (err) {
        console.error("Error revoking certificate:", err);
      }
    }
  };

  if (loading) return <div className="ad-card">Verifying credential authority...</div>;

  return (
    <>
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Credential Registry</h1>
          <p>Verify and manage all issued mission completion certificates</p>
        </div>
      </div>

      <div className="ad-card" style={{ padding: '0' }}>
        <div className="ad-table-wrapper">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Certificate Grantee</th>
                <th>Course Intel</th>
                <th>Issue Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No credentials have been issued in this cycle.
                  </td>
                </tr>
              ) : (
                certificates.map(cert => (
                  <tr key={cert.id}>
                    <td>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                         <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                            <User size={16} />
                         </div>
                         <div>
                            <div style={{ fontWeight: '700', color: 'white' }}>User: {cert.userId?.substring(0, 8)}...</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cert.id}</div>
                         </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa' }}>
                        <Book size={14} /> <span>{cert.courseTitle || 'Advanced Mission Training'}</span>
                      </div>
                    </td>
                    <td>
                       <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          {cert.completedAt ? format(cert.completedAt.toDate(), 'MMM d, yyyy') : 'Official Record'}
                       </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <button className="ad-btn-secondary" style={{ padding: '0.5rem' }} title="Download Data">
                            <Download size={16} />
                         </button>
                         <button onClick={() => handleRevoke(cert.id)} className="ad-btn-danger" style={{ padding: '0.5rem' }} title="Revoke Credential">
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
