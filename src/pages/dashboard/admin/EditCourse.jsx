import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditCourse() {
    const { id } = useParams(); // Using 'id' from router
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [course, setCourse] = useState({ title: "", description: "", videoUrl: "", instructor: "" });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const courseRef = doc(db, "courses", id);
                const snapshot = await getDoc(courseRef);
                if (snapshot.exists()) {
                    setCourse(snapshot.data());
                } else {
                    alert("Course not found");
                    navigate("/admin/manage-courses");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const courseRef = doc(db, "courses", id);
            await updateDoc(courseRef, course);
            alert("Course metadata updated successfully! ✅");
            navigate("/admin/manage-courses");
        } catch (err) {
            console.error("Error updating course:", err);
            alert("Error updating course");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="ad-card">Loading course data...</div>;

    return (
        <>
            <div className="ad-page-header">
                <div className="ad-header-title">
                    <h1>Edit Course: <span style={{ color: '#fbbf24' }}>{course.title}</span></h1>
                    <p>Modify existing course details and resources</p>
                </div>
            </div>

            <div className="ad-card">
                <form onSubmit={handleUpdate}>
                    <div className="ad-form-grid">
                        <div className="ad-field full">
                            <label>Course Title</label>
                            <input
                                value={course.title}
                                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="ad-field full">
                            <label>Description</label>
                            <textarea
                                value={course.description}
                                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                                rows="6"
                                required
                            />
                        </div>

                        <div className="ad-field">
                            <label>Video URL</label>
                            <input
                                value={course.videoUrl}
                                onChange={(e) => setCourse({ ...course, videoUrl: e.target.value })}
                                required
                            />
                        </div>

                        <div className="ad-field">
                            <label>Instructor</label>
                            <input
                                value={course.instructor}
                                onChange={(e) => setCourse({ ...course, instructor: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="ad-btn-row">
                        <button type="submit" className="ad-btn-primary" disabled={saving}>
                            {saving ? "Saving Changes..." : "💾 Update Course"}
                        </button>
                        <button type="button" className="ad-btn-secondary" onClick={() => navigate("/admin/manage-courses")}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
