import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { db } from "../../../config/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { progressService } from "../../../services/progressService";
import { PlayCircle, Award, Clock, BookOpen, FileBadge } from "lucide-react";
import CertificateModal from "../user/CertificateModal";
import "./EnrolledCourses.css";

export default function EnrolledCourses() {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewCertCourse, setViewCertCourse] = useState(null);

    useEffect(() => {
        if (!user) return;
        const fetchEnrollments = async () => {
            try {
                // In a real app, you'd have an 'enrollments' collection
                // For now, we'll fetch completed courses from progressService
                // and maybe some mock "currently learning" courses
                const completed = await progressService.getUserCompletedCourses(user.uid);
                
                // Fetch all courses to show context
                const coursesSnap = await getDocs(collection(db, "courses"));
                const allCourses = coursesSnap.docs.reduce((acc, doc) => {
                    acc[doc.id] = { ...doc.data(), id: doc.id };
                    return acc;
                }, {});

                const enrolled = completed.map(c => {
                    const originalCourse = allCourses[c.courseId];
                    return {
                        ...originalCourse,
                        progress: 100,
                        completed: true,
                        completedAt: c.completedAt
                    };
                });

                // Add some partially completed courses for demonstration if needed
                // In a real system, this would come from a 'userProgress' collection tracking lesson completion
                
                setEnrolledCourses(enrolled);
            } catch (err) {
                console.error("Error fetching enrolled courses:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEnrollments();
    }, [user]);

    if (loading) return <div className="loading-spinner">Loading your learning journey...</div>;

    return (
        <div className="enrolled-courses-page">
            <div className="ec-header">
                <h1>My Learning Journey</h1>
                <p>Track your progress and continue where you left off.</p>
            </div>

            {enrolledCourses.length === 0 ? (
                <div className="no-enrolled">
                    <h3>No courses enrolled yet</h3>
                    <p>Explore our library and start learning new skills today!</p>
                    <Link to="/courses" className="ec-btn ec-btn-primary">Browse Courses</Link>
                </div>
            ) : (
                <div className="ec-grid">
                    {enrolledCourses.map(course => (
                        <div key={course.id} className="ec-card">
                            <div className="ec-thumbnail">
                                <img 
                                    src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80"} 
                                    alt={course.title} 
                                />
                                <span className={`ec-badge ${course.completed ? 'completed' : 'in-progress'}`}>
                                    {course.completed ? 'Completed' : 'In Progress'}
                                </span>
                            </div>
                            <div className="ec-info">
                                <h3>{course.title}</h3>
                                
                                <div className="ec-progress-container">
                                    <div className="ec-progress-header">
                                        <span>Course Progress</span>
                                        <span>{course.progress}%</span>
                                    </div>
                                    <div className="ec-progress-bar">
                                        <div 
                                            className="ec-progress-fill" 
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="ec-footer">
                                    <Link to="/courses" className="ec-btn ec-btn-primary">
                                        {course.completed ? "Review Course" : "Continue Learning"}
                                    </Link>
                                    {course.completed && (
                                        <div className="flex items-center gap-2">
                                            <div className="text-green-400 flex items-center gap-1 text-sm font-bold">
                                                <Award size={16} /> Certified
                                            </div>
                                            <button 
                                                onClick={() => setViewCertCourse(course)}
                                                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                            >
                                                <FileBadge size={16} /> View Certificate
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {viewCertCourse && (
                <CertificateModal
                    course={viewCertCourse}
                    profile={user}
                    onClose={() => setViewCertCourse(null)}
                />
            )}
        </div>
    );
}
