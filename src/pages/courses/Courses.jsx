import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthProvider";
import { Search, PlayCircle, BookOpen, Clock, Star, X, CheckCircle, Award } from "lucide-react";
import { progressService } from "../../services/progressService";
import { notificationService } from "../../services/notificationService";
import Quiz from "./Quiz";
import "./Courses.css";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null); // For Video Modal
  const [completedCourses, setCompletedCourses] = useState(new Set());
  const [completing, setCompleting] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) {
        setError("Please focus our portal while we confirm your authentication...");
        setLoading(false);
        return;
      }

      setError("");
      setLoading(true);
      try {
        const data = await getDocs(collection(db, "courses"));
        const courseData = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setCourses(courseData);
        setFilteredCourses(courseData);
      } catch (err) {
        console.error("Error fetching courses:", err);
        if (err.code === "permission-denied") {
          setError("You do not have permission to view courses. Please confirm you are logged in.");
        } else {
          setError("An error occurred while loading courses.");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchProgress = async () => {
      if (!user) return;
      try {
        const completed = await progressService.getUserCompletedCourses(user.uid);
        const completedIds = new Set(completed.map(c => c.courseId));
        setCompletedCourses(completedIds);
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };

    fetchCourses();
    fetchProgress();
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

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "youtube.com/embed/");
    }
    if (url.includes("vimeo.com/")) {
      const vimeoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${vimeoId}`;
    }
    return url;
  };

  const handleComplete = async (course) => {
    if (!user || completing) return;
    setCompleting(true);
    try {
      await progressService.markCourseCompleted(user.uid, course.id, course.title);
      setCompletedCourses(prev => new Set(prev).add(course.id));
      
      // Notify them
      await notificationService.createNotification({
          userId: user.uid,
          type: "message", // Or a new 'achievement' type
          message: `Congratulations! You have completed ${course.title} and earned a certificate!`,
          link: "/dashboard"
      });
      
    } catch (err) {
      console.error(err);
      alert("Failed to mark course as completed.");
    } finally {
      setCompleting(false);
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
        </div>
      </div>

      {/* Main Content Area */}
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
                filteredCourses.map((course) => (
                  <div key={course.id} className="course-card" onClick={() => setSelectedCourse(course)}>
                    <div className="course-thumbnail">
                      <img
                        src={course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80"}
                        alt={course.title}
                      />
                      <div className="course-overlay">
                        <PlayCircle size={48} className="text-white opacity-90" />
                      </div>
                      {course.level && <span className="course-badge">{course.level}</span>}
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
                    </div>
                  </div>
                ))
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

      {/* Video Modal */}
      {selectedCourse && (
        <div className="course-video-modal" onClick={() => setSelectedCourse(null)}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <div className="video-modal-header">
              <h2 className="text-xl font-bold text-white truncate w-10/12">{selectedCourse.title}</h2>
              <button onClick={() => setSelectedCourse(null)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="video-wrapper">
              {getEmbedUrl(selectedCourse.videoUrl) ? (
                <iframe
                  src={getEmbedUrl(selectedCourse.videoUrl)}
                  title={selectedCourse.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  className="w-full h-full"
                ></iframe>
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-slate-800 text-gray-400">
                  No video URL provided for this course.
                </div>
              )}
            </div>
            <div className="video-modal-footer">
              <p className="text-gray-300">{selectedCourse.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">Instructor: {selectedCourse.instructor || "Globix Academy"}</p>
                {completedCourses.has(selectedCourse.id) ? (
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg cursor-default">
                    <Award size={18} /> Completed 🏆
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowQuiz(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg transition-all transform hover:scale-105"
                  >
                    <CheckCircle size={18} /> Take Quiz & Earn Certificate 🎓
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Overlay */}
      {showQuiz && selectedCourse && (
        <Quiz 
          course={selectedCourse}
          onComplete={() => handleComplete(selectedCourse)}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </div>
  );
}
// Forced HMR Reload