import { useEffect, useState, useCallback } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div className="ad-card">Loading courses...</div>;

  return (
    <>
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Manage Courses</h1>
          <p>Organize, edit and curate the platform learning curriculum</p>
        </div>
        <Link to="/admin/create-course" className="ad-btn-primary" style={{ textDecoration: 'none' }}>
          ＋ Add New Course
        </Link>
      </div>

      <div className="ad-card" style={{ padding: '0' }}>
        <div className="ad-table-wrapper">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Course Details</th>
                <th>Instructor</th>
                <th>Curriculum</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No courses found in the database.
                  </td>
                </tr>
              ) : (
                courses.map(course => (
                  <tr key={course.id}>
                    <td>
                      <div style={{ fontWeight: '700', color: 'white' }}>{course.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '300px' }}>
                        {course.description.substring(0, 80)}...
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#fbbf24', fontWeight: '600' }}>{course.instructor}</div>
                    </td>
                    <td>
                      <a
                        href={course.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.9rem' }}
                      >
                        🎥 Open Video
                      </a>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button
                          onClick={() => navigate(`/admin/edit-course/${course.id}`)}
                          className="ad-btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="ad-btn-danger"
                        >
                          Delete
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