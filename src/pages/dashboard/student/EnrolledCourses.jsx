import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { db } from "../../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { enrollmentService } from "../../../services/enrollmentService";
import { PlayCircle, Award, Clock, BookOpen, FileBadge, TrendingUp, CheckCircle, HelpCircle } from "lucide-react";
import CertificateModal from "../user/CertificateModal";
import "./EnrolledCourses.css";

export default function EnrolledCourses() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewCertCourse, setViewCertCourse] = useState(null);
  const [totalQuizAvg, setTotalQuizAvg] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchEnrollments = async () => {
      try {
        // Get all enrollments for user
        const enrollments = await enrollmentService.getEnrolledCourses(user.uid);

        // Fetch all courses
        const coursesSnap = await getDocs(collection(db, "courses"));
        const allCourses = coursesSnap.docs.reduce((acc, doc) => {
          acc[doc.id] = { ...doc.data(), id: doc.id };
          return acc;
        }, {});

        // Merge enrollment data with course data
        const merged = enrollments.map(enr => {
          const course = allCourses[enr.courseId] || {};
          const quizScores = enr.quizScores || {};
          const quizEntries = Object.values(quizScores);
          const avgScore = quizEntries.length > 0
            ? Math.round(quizEntries.reduce((sum, s) => sum + (s.score / s.total) * 100, 0) / quizEntries.length)
            : null;

          // Calculate progress from completedLessons
          const lessonsCompleted = enr.completedLessons?.length || 0;

          return {
            ...course,
            enrollmentId: enr.id,
            enrolledAt: enr.enrolledAt,
            progress: enr.progress || (lessonsCompleted > 0 ? Math.min(90, lessonsCompleted * 10) : 0),
            completed: enr.progress >= 100,
            completedLessons: lessonsCompleted,
            quizScores,
            avgScore,
            quizCount: quizEntries.length,
            coinsPaid: enr.coinsPaid || 0
          };
        });

        setEnrolledCourses(merged);

        // Calculate overall quiz average
        const allScores = merged.flatMap(c => Object.values(c.quizScores || {}));
        if (allScores.length > 0) {
          const avg = Math.round(allScores.reduce((sum, s) => sum + (s.score / s.total) * 100, 0) / allScores.length);
          setTotalQuizAvg(avg);
        }
      } catch (err) {
        console.error("Error fetching enrolled courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [user]);

  if (loading) return (
    <div className="ec-loading">
      <div className="ec-spinner"></div>
      <p>Loading your learning journey...</p>
    </div>
  );

  const completedCount = enrolledCourses.filter(c => c.completed).length;
  const inProgressCount = enrolledCourses.filter(c => !c.completed).length;

  return (
    <div className="enrolled-courses-page">
      <div className="ec-header">
        <h1>My Learning Journey</h1>
        <p>Track your progress, quiz scores, and course completions.</p>
      </div>

      {/* Stats bar */}
      {enrolledCourses.length > 0 && (
        <div className="ec-stats-bar">
          <div className="ec-stat-item">
            <BookOpen size={20} />
            <div>
              <strong>{enrolledCourses.length}</strong>
              <span>Courses</span>
            </div>
          </div>
          <div className="ec-stat-item">
            <CheckCircle size={20} className="text-green-400" />
            <div>
              <strong>{completedCount}</strong>
              <span>Completed</span>
            </div>
          </div>
          <div className="ec-stat-item">
            <TrendingUp size={20} className="text-blue-400" />
            <div>
              <strong>{inProgressCount}</strong>
              <span>In Progress</span>
            </div>
          </div>
          <div className="ec-stat-item">
            <HelpCircle size={20} className="text-purple-400" />
            <div>
              <strong>{totalQuizAvg > 0 ? `${totalQuizAvg}%` : "—"}</strong>
              <span>Quiz Avg</span>
            </div>
          </div>
        </div>
      )}

      {enrolledCourses.length === 0 ? (
        <div className="no-enrolled">
          <BookOpen size={64} opacity={0.3} />
          <h3>No courses enrolled yet</h3>
          <p>Explore our library and enroll using your vault coins!</p>
          <Link to="/courses" className="ec-btn ec-btn-primary">Browse Courses</Link>
        </div>
      ) : (
        <div className="ec-grid">
          {enrolledCourses.map(course => (
            <div key={course.enrollmentId || course.id} className="ec-card">
              <div className="ec-thumbnail">
                <img
                  src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80"}
                  alt={course.title || "Course"}
                />
                <span className={`ec-badge ${course.completed ? 'completed' : 'in-progress'}`}>
                  {course.completed ? '✓ Completed' : 'In Progress'}
                </span>
              </div>
              <div className="ec-info">
                <h3>{course.title || "Course"}</h3>

                {/* Progress bar */}
                <div className="ec-progress-container">
                  <div className="ec-progress-header">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="ec-progress-bar">
                    <div className="ec-progress-fill" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>

                {/* Quiz scores */}
                {course.quizCount > 0 && (
                  <div className="ec-quiz-scores">
                    <div className="ec-quiz-label">
                      <HelpCircle size={14} />
                      <span>Quiz Performance</span>
                    </div>
                    {Object.entries(course.quizScores).map(([qId, s]) => (
                      <div key={qId} className="ec-quiz-row">
                        <span>Quiz Score</span>
                        <span className={`ec-score-val ${(s.score / s.total) >= 0.5 ? 'pass' : 'fail'}`}>
                          {s.score}/{s.total} — {Math.round((s.score / s.total) * 100)}%
                        </span>
                      </div>
                    ))}
                    {course.avgScore !== null && (
                      <div className="ec-quiz-avg">
                        Average: <strong>{course.avgScore}%</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Coins paid */}
                {course.coinsPaid > 0 && (
                  <div className="ec-coins-paid">🪙 {course.coinsPaid} coins paid</div>
                )}

                <div className="ec-footer">
                  <Link to="/courses" className="ec-btn ec-btn-primary">
                    <PlayCircle size={14} />
                    {course.completed ? "Review Course" : "Continue Learning"}
                  </Link>
                  {course.completed && (
                    <button
                      onClick={() => setViewCertCourse(course)}
                      className="ec-btn ec-btn-cert"
                    >
                      <FileBadge size={14} /> Certificate
                    </button>
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
