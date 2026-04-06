import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthProvider";
import { Search, PlayCircle, BookOpen, Clock, Star, X, CheckCircle, Award, Lock, Coins } from "lucide-react";
import { progressService } from "../../services/progressService";
import { enrollmentService } from "../../services/enrollmentService";
import { notificationService } from "../../services/notificationService";
import CoursePlayer from "./CoursePlayer";
import Quiz from "./Quiz";
import "./Courses.css";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState({}); // courseId -> enrollment data
  const [enrollingCourse, setEnrollingCourse] = useState(null); // course being enrolled
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null); // course open in player
  const [activeEnrollment, setActiveEnrollment] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [completedCourses, setCompletedCourses] = useState(new Set());
  const [showQuizDirect, setShowQuizDirect] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) {
        setError("Please log in to access courses.");
        setLoading(false);
        return;
      }
      setError("");
      setLoading(true);
      try {
        const data = await getDocs(collection(db, "courses"));
        const courseData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setCourses(courseData);
        setFilteredCourses(courseData);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.code === "permission-denied"
          ? "You do not have permission to view courses. Please confirm you are logged in."
          : "An error occurred while loading courses."
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchEnrollments = async () => {
      if (!user) return;
      try {
        const enrolled = await enrollmentService.getEnrolledCourses(user.uid);
        const map = {};
        enrolled.forEach(e => { map[e.courseId] = e; });
        setEnrollments(map);
      } catch (err) {
        console.error("Error fetching enrollments:", err);
      }
    };

    const fetchProgress = async () => {
      if (!user) return;
      try {
        const completed = await progressService.getUserCompletedCourses(user.uid);
        setCompletedCourses(new Set(completed.map(c => c.courseId)));
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };

    const fetchUserCoins = async () => {
      if (!user) return;
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserCoins(snap.data().coins || 0);
      } catch (err) {
        console.error("Error fetching coins:", err);
      }
    };

    fetchCourses();
    fetchEnrollments();
    fetchProgress();
    fetchUserCoins();
  }, [user]);

  useEffect(() => {
    let result = courses;
    if (activeCategory !== "All") {
      result = result.filter(c => c.category === activeCategory || c.level === activeCategory);
    }
    if (searchQuery.trim() !== "") {
      result = result.filter(c =>
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredCourses(result);
  }, [searchQuery, activeCategory, courses]);

  const categories = ["All", "Beginner", "Intermediate", "Advanced", "Programming", "Design", "Business"];

  const handleCourseClick = (course) => {
    const enrollment = enrollments[course.id];
    if (enrollment) {
      // Already enrolled — open player
      setActiveCourse(course);
      setActiveEnrollment(enrollment);
    } else {
      // Not enrolled — show enrollment modal
      setEnrollingCourse(course);
    }
  };

  const handleEnroll = async () => {
    if (!enrollingCourse || !user || enrollLoading) return;
    const coinCost = enrollingCourse.coinCost || 0;

    setEnrollLoading(true);
    try {
      if (coinCost === 0) {
        await enrollmentService.enrollFree(user.uid, enrollingCourse.id);
      } else {
        if (userCoins < coinCost) {
          alert(`Insufficient coins! You have ${userCoins} coins, but this course costs ${coinCost} coins.`);
          setEnrollLoading(false);
          return;
        }
        await enrollmentService.enrollInCourse(user.uid, enrollingCourse.id, coinCost);
        setUserCoins(prev => prev - coinCost);
      }

      // Create enrollment in local state
      const newEnrollment = {
        userId: user.uid,
        courseId: enrollingCourse.id,
        progress: 0,
        completedLessons: [],
        quizScores: {}
      };
      setEnrollments(prev => ({ ...prev, [enrollingCourse.id]: newEnrollment }));

      await notificationService.createNotification({
        userId: user.uid,
        type: "message",
        message: `You have enrolled in "${enrollingCourse.title}"! Start learning now.`,
        link: "/courses"
      });

      // Open player immediately after enrollment
      setActiveCourse(enrollingCourse);
      setActiveEnrollment(newEnrollment);
      setEnrollingCourse(null);
    } catch (err) {
      console.error("Enrollment error:", err);
      alert(err.message || "Failed to enroll. Please try again.");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleComplete = async (course) => {
    if (!user) return;
    try {
      await progressService.markCourseCompleted(user.uid, course.id, course.title);
      setCompletedCourses(prev => new Set(prev).add(course.id));
      await notificationService.createNotification({
        userId: user.uid,
        type: "message",
        message: `Congratulations! You completed "${course.title}" and earned a certificate!`,
        link: "/dashboard"
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="courses-page">
      {/* Hero Section */}
      <div className="courses-hero">
        <div className="hero-content">
          <h1>Master New Skills with <span>Global Experts</span></h1>
          <p>Explore our premium library of courses designed to elevate your career and expand your knowledge.</p>

          <div className="courses-search-bar">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="What do you want to learn today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">Search</button>
          </div>

          {user && (
            <div className="courses-hero-coins">
              <span>🪙</span>
              <span><strong>{userCoins}</strong> coins in your vault</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="courses-container">
        {error ? (
          <div className="courses-error-state">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="courses-loading">
            <div className="spinner"></div>
            <p>Curating course library...</p>
          </div>
        ) : (
          <>
            {/* Category Filters */}
            <div className="courses-filter-scroll no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Courses Grid */}
            <div className="courses-grid">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => {
                  const isEnrolled = !!enrollments[course.id];
                  const isCompleted = completedCourses.has(course.id);
                  const coinCost = course.coinCost || 0;

                  return (
                    <div
                      key={course.id}
                      className={`course-card ${isEnrolled ? 'enrolled' : ''}`}
                      onClick={() => handleCourseClick(course)}
                    >
                      <div className="course-thumbnail">
                        <img
                          src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80"}
                          alt={course.title}
                        />
                        <div className="course-overlay">
                          {isEnrolled ? (
                            <div className="enrolled-overlay-icon">
                              <PlayCircle size={48} className="text-white opacity-90" />
                            </div>
                          ) : (
                            <PlayCircle size={48} className="text-white opacity-90" />
                          )}
                        </div>
                        {course.level && <span className="course-badge">{course.level}</span>}
                        {isCompleted && (
                          <span className="course-completed-badge">
                            <CheckCircle size={14} /> Completed
                          </span>
                        )}
                        {isEnrolled && !isCompleted && (
                          <span className="course-enrolled-badge">
                            <PlayCircle size={14} /> Enrolled
                          </span>
                        )}
                      </div>

                      <div className="course-info">
                        <div className="course-meta">
                          <span className="flex items-center gap-1"><BookOpen size={14} /> 12 Modules</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> 4h 30m</span>
                        </div>

                        <h3 className="course-title">{course.title}</h3>
                        <p className="course-desc">{course.description}</p>

                        <div className="course-footer">
                          <div className="course-instructor">
                            <div className="instructor-avatar">
                              {course.instructor ? course.instructor[0].toUpperCase() : "G"}
                            </div>
                            <span className="text-sm text-gray-400">{course.instructor || "Globix Instructor"}</span>
                          </div>
                          <div className="course-rating text-yellow-500 font-bold flex items-center gap-1">
                            <Star size={14} fill="currentColor" /> 4.9
                          </div>
                        </div>

                        {/* Coin cost / enroll button */}
                        <div className="course-action-row">
                          {isEnrolled ? (
                            <button className="course-continue-btn" onClick={(e) => { e.stopPropagation(); handleCourseClick(course); }}>
                              <PlayCircle size={14} />
                              {isCompleted ? "Review Course" : "Continue Learning"}
                            </button>
                          ) : (
                            <button className="course-enroll-btn" onClick={(e) => { e.stopPropagation(); setEnrollingCourse(course); }}>
                              {coinCost > 0 ? (
                                <><span>🪙</span> {coinCost} Coins — Enroll</>
                              ) : (
                                <><CheckCircle size={14} /> Enroll Free</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-courses-found">
                  <h3>No courses found</h3>
                  <p>Try adjusting your search criteria or changing the category filter.</p>
                  <button onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}>Reset Filters</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Enrollment Confirmation Modal */}
      {enrollingCourse && (
        <div className="enroll-modal-overlay" onClick={() => !enrollLoading && setEnrollingCourse(null)}>
          <div className="enroll-modal" onClick={e => e.stopPropagation()}>
            <button className="enroll-modal-close" onClick={() => setEnrollingCourse(null)} disabled={enrollLoading}>
              <X size={20} />
            </button>

            <div className="enroll-modal-thumb">
              <img
                src={enrollingCourse.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80"}
                alt={enrollingCourse.title}
              />
            </div>

            <div className="enroll-modal-body">
              <h2>{enrollingCourse.title}</h2>
              <p>{enrollingCourse.description}</p>
              <p className="enroll-instructor">By {enrollingCourse.instructor || "GTE Academy"}</p>

              <div className="enroll-cost-box">
                {enrollingCourse.coinCost > 0 ? (
                  <>
                    <div className="enroll-cost-row">
                      <span>Course Cost</span>
                      <span className="enroll-coins">🪙 {enrollingCourse.coinCost} coins</span>
                    </div>
                    <div className="enroll-cost-row">
                      <span>Your Vault</span>
                      <span className={userCoins >= enrollingCourse.coinCost ? "enroll-coins-ok" : "enroll-coins-low"}>
                        🪙 {userCoins} coins
                      </span>
                    </div>
                    {userCoins < enrollingCourse.coinCost && (
                      <p className="enroll-warning">⚠️ Insufficient coins! Purchase more from your dashboard.</p>
                    )}
                  </>
                ) : (
                  <div className="enroll-free-badge">🎁 Free Course — No coins required!</div>
                )}
              </div>

              <div className="enroll-modal-actions">
                <button className="enroll-cancel-btn" onClick={() => setEnrollingCourse(null)} disabled={enrollLoading}>
                  Cancel
                </button>
                <button
                  className="enroll-confirm-btn"
                  onClick={handleEnroll}
                  disabled={enrollLoading || (enrollingCourse.coinCost > 0 && userCoins < enrollingCourse.coinCost)}
                >
                  {enrollLoading ? "Enrolling..." : enrollingCourse.coinCost > 0 ? `Pay 🪙 ${enrollingCourse.coinCost} & Enroll` : "Enroll Now — Free"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Player */}
      {activeCourse && (
        <CoursePlayer
          course={activeCourse}
          enrollment={activeEnrollment}
          onClose={() => { setActiveCourse(null); setActiveEnrollment(null); }}
          onQuizComplete={(quizId, score, total) => {
            if (score >= (activeCourse.passingScore || 15)) {
              handleComplete(activeCourse);
            }
          }}
        />
      )}
    </div>
  );
}