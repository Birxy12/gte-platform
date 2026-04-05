import { useEffect, useState, useCallback } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { HelpCircle, Trash2, Edit3, BookOpen, Clock } from "lucide-react";

export default function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = useCallback(async () => {
    try {
      const data = await getDocs(collection(db, "quizzes"));
      setQuizzes(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } catch (err) {
      console.error("Error fetching quizzes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const handleDelete = async (id) => {
    if (window.confirm("Permanentely delete this Mission Quiz? This will affect course progress for some students.")) {
      try {
        await deleteDoc(doc(db, "quizzes", id));
        fetchQuizzes();
      } catch (err) {
        console.error("Error deleting quiz:", err);
      }
    }
  };

  if (loading) return <div className="ad-card">Loading Mission Assessments...</div>;

  return (
    <>
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Quiz Management</h1>
          <p>Configure course assessments and knowledge checks</p>
        </div>
      </div>

      <div className="ad-card" style={{ padding: '0' }}>
        <div className="ad-table-wrapper">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Assessment Details</th>
                <th>Course Mapping</th>
                <th>Question Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No assessments found in the mission archive.
                  </td>
                </tr>
              ) : (
                quizzes.map(quiz => (
                  <tr key={quiz.id}>
                    <td>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                         <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                            <HelpCircle size={18} />
                         </div>
                         <div>
                            <div style={{ fontWeight: '700', color: 'white' }}>{quiz.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{quiz.id}</div>
                         </div>
                      </div>
                    </td>
                    <td>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.85rem' }}>
                          <BookOpen size={14} /> <span>{quiz.courseId || 'Global Assessment'}</span>
                       </div>
                    </td>
                    <td>
                       <div style={{ color: '#e2e8f0', fontWeight: '600' }}>{quiz.questions?.length || 0} Questions</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <button onClick={() => handleDelete(quiz.id)} className="ad-btn-danger" style={{ padding: '0.5rem 0.75rem' }}>
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
