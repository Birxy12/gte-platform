import { useEffect, useState, useCallback } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, BarChart3, Trash2, Edit3, Plus, ExternalLink, Shield } from "lucide-react";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("modules"); // modules, stats
  const navigate = useNavigate();

  const fetchCourses = useCallback(async () => {
    try {
      const data = await getDocs(collection(db, "courses"));
      setCourses(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleDelete = async (id) => {
    if (window.confirm("Permanentely delete this course and all its data?")) {
      try {
        await deleteDoc(doc(db, "courses", id));
        fetchCourses();
      } catch (err) {
        console.error("Error deleting course:", err);
      }
    }
  };

  if (loading) return <div className="ad-card">Loading mission curriculum...</div>;

  return (
    <div className="ad-container">
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Course Command & Control</h1>
          <p>Organize, edit and curate the platform learning curriculum</p>
        </div>
        <Link to="/admin/create-course" className="ad-btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Course
        </Link>
      </div>

      <div className="ad-tab-container mb-8">
        <button 
          className={`ad-tab ${activeTab === 'modules' ? 'active' : ''}`}
          onClick={() => setActiveTab('modules')}
        >
          <BookOpen size={16} /> Tactical Modules
        </button>
        <button 
          className={`ad-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 size={16} /> Intelligence / Stats
        </button>
      </div>

      <div className="ad-content-area">
        {activeTab === 'modules' && (
          <div className="ad-card" style={{ padding: '0', marginTop: 0 }}>
            <div className="ad-table-wrapper">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Course Details</th>
                    <th>Instructor</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        <BookOpen size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                        <p>No tactical modules found in the database.</p>
                      </td>
                    </tr>
                  ) : (
                    courses.map(course => (
                      <tr key={course.id}>
                        <td>
                          <div style={{ fontWeight: '700', color: 'white', marginBottom: '4px' }}>{course.title}</div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                              ID: {course.id}
                            </span>
                            <span className="text-[10px] text-slate-500 italic">
                                {course.description.substring(0, 40)}...
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ color: '#fbbf24', fontWeight: '600' }}>{course.instructor}</div>
                        </td>
                        <td>
                           <span className="p-1 px-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] uppercase font-bold tracking-wider">
                             Active
                           </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <button
                              onClick={() => navigate(`/admin/edit-course/${course.id}`)}
                              className="ad-btn-secondary"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                              title="Edit Course"
                            >
                              <Edit3 size={14} />
                            </button>
                            <a
                              href={course.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ad-btn-secondary"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', color: '#60a5fa' }}
                              title="View Material"
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="ad-btn-danger"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                              title="Delete Course"
                            >
                              <Trash2 size={14} />
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
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="ad-card" style={{ marginTop: 0 }}>
              <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-bold">Total Enlistment</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{courses.length}</span>
                <span className="text-slate-400 text-sm italic">Modules Active</span>
              </div>
            </div>
            
            <div className="ad-card" style={{ marginTop: 0 }}>
                <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-bold">Infrastructure Health</h4>
                <div className="flex items-center gap-3 text-emerald-500">
                    <Shield size={24} />
                    <span className="font-bold">Sync Verified</span>
                </div>
            </div>

            <div className="ad-card col-span-1 md:col-span-3">
              <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-6 font-bold">Module Distribution</h4>
              <p className="text-sm text-slate-400">Tactical insights for course curriculum balances will appear here.</p>
              <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-2/3 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}