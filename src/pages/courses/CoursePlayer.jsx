import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import { db } from "../../config/firebase";
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { enrollmentService } from "../../services/enrollmentService";
import { X, PlayCircle, FileText, HelpCircle, CheckCircle, Lock, ChevronRight, Award, Clock } from "lucide-react";
import Quiz from "./Quiz";
import "./CoursePlayer.css";

export default function CoursePlayer({ course, enrollment, onClose, onQuizComplete }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("video");
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizScores, setQuizScores] = useState(enrollment?.quizScores || {});
  const [completedLessons, setCompletedLessons] = useState(enrollment?.completedLessons || []);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch materials for this course
        const matsQuery = query(
          collection(db, "courseMaterials"),
          where("courseId", "==", course.id)
        );
        const matsSnap = await getDocs(matsQuery);
        const matsList = matsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setMaterials(matsList);

        // Fetch quizzes for this course
        const quizQuery = query(
          collection(db, "quizzes"),
          where("courseId", "==", course.id)
        );
        const quizSnap = await getDocs(quizQuery);
        setQuizzes(quizSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching course content:", err);
      } finally {
        setLoadingMaterials(false);
      }
    };
    fetchContent();
  }, [course.id]);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) return "https://www.youtube.com/embed/" + url.split("youtu.be/")[1];
    if (url.includes("vimeo.com/")) return `https://player.vimeo.com/video/${url.split("/").pop()}`;
    return url;
  };

  const handleMarkMaterialDone = async (materialId) => {
    if (completedLessons.includes(materialId)) return;
    try {
      await enrollmentService.markLessonComplete(user.uid, course.id, materialId);
      setCompletedLessons(prev => [...prev, materialId]);
    } catch (err) {
      console.error("Error marking lesson complete:", err);
    }
  };

  const handleQuizSubmit = async (score, total) => {
    if (!activeQuiz) return;
    try {
      await enrollmentService.submitQuizResult(user.uid, course.id, activeQuiz.id, score, total);
      setQuizScores(prev => ({
        ...prev,
        [activeQuiz.id]: { score, total, submittedAt: new Date().toISOString() }
      }));
      setActiveQuiz(null);
      if (onQuizComplete) onQuizComplete(activeQuiz.id, score, total);
    } catch (err) {
      console.error("Error submitting quiz:", err);
    }
  };

  const isQuizAvailable = (quiz) => {
    if (!quiz.availableFrom) return true;
    const availDate = quiz.availableFrom?.toDate ? quiz.availableFrom.toDate() : new Date(quiz.availableFrom);
    return new Date() >= availDate;
  };

  const getQuizAvailableDate = (quiz) => {
    if (!quiz.availableFrom) return null;
    const d = quiz.availableFrom?.toDate ? quiz.availableFrom.toDate() : new Date(quiz.availableFrom);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="cp-overlay">
      <div className="cp-container">
        {/* Header */}
        <div className="cp-header">
          <div className="cp-header-left">
            <div className="cp-course-icon">
              <PlayCircle size={22} />
            </div>
            <div>
              <h2 className="cp-title">{course.title}</h2>
              <p className="cp-instructor">By {course.instructor || "GTE Academy"}</p>
            </div>
          </div>
          <button className="cp-close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="cp-tabs">
          <button className={`cp-tab ${activeTab === "video" ? "active" : ""}`} onClick={() => setActiveTab("video")}>
            <PlayCircle size={16} /> Video Lesson
          </button>
          <button className={`cp-tab ${activeTab === "materials" ? "active" : ""}`} onClick={() => setActiveTab("materials")}>
            <FileText size={16} /> Materials {materials.length > 0 && <span className="cp-tab-badge">{materials.length}</span>}
          </button>
          <button className={`cp-tab ${activeTab === "quizzes" ? "active" : ""}`} onClick={() => setActiveTab("quizzes")}>
            <HelpCircle size={16} /> Quizzes {quizzes.length > 0 && <span className="cp-tab-badge">{quizzes.length}</span>}
          </button>
        </div>

        {/* Content */}
        <div className="cp-body">
          {/* Video Tab */}
          {activeTab === "video" && (
            <div className="cp-video-section">
              <div className="cp-video-wrapper">
                {getEmbedUrl(course.videoUrl) ? (
                  <iframe
                    src={getEmbedUrl(course.videoUrl)}
                    title={course.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <div className="cp-no-video">
                    <PlayCircle size={64} opacity={0.3} />
                    <p>No video available for this course</p>
                  </div>
                )}
              </div>
              <div className="cp-video-info">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
              </div>
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === "materials" && (
            <div className="cp-materials-section">
              {loadingMaterials ? (
                <div className="cp-loading">Loading materials...</div>
              ) : materials.length === 0 ? (
                <div className="cp-empty">
                  <FileText size={48} opacity={0.3} />
                  <p>No materials uploaded yet for this course.</p>
                  <span>Check back later or contact your instructor.</span>
                </div>
              ) : (
                <div className="cp-materials-list">
                  {materials.map((mat, idx) => {
                    const isDone = completedLessons.includes(mat.id);
                    return (
                      <div key={mat.id} className={`cp-material-item ${isDone ? "done" : ""}`}>
                        <div className="cp-material-num">
                          {isDone ? <CheckCircle size={20} className="cp-check-icon" /> : <span>{idx + 1}</span>}
                        </div>
                        <div className="cp-material-info">
                          <h4>{mat.title}</h4>
                          <p>{mat.description}</p>
                          <span className="cp-mat-type">{mat.type === "pdf" ? "📄 PDF" : mat.type === "video" ? "🎬 Video" : "🔗 Resource"}</span>
                        </div>
                        <div className="cp-material-actions">
                          {mat.url && (
                            <a
                              href={mat.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cp-open-btn"
                              onClick={() => handleMarkMaterialDone(mat.id)}
                            >
                              Open <ChevronRight size={14} />
                            </a>
                          )}
                          {!isDone && (
                            <button className="cp-mark-btn" onClick={() => handleMarkMaterialDone(mat.id)}>
                              Mark Done
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === "quizzes" && (
            <div className="cp-quizzes-section">
              {quizzes.length === 0 ? (
                <div className="cp-empty">
                  <HelpCircle size={48} opacity={0.3} />
                  <p>No quizzes scheduled for this course yet.</p>
                  <span>Your instructor will announce when quizzes become available.</span>
                </div>
              ) : (
                <div className="cp-quizzes-list">
                  {quizzes.map((quiz) => {
                    const available = isQuizAvailable(quiz);
                    const score = quizScores[quiz.id];
                    const availDate = getQuizAvailableDate(quiz);

                    return (
                      <div key={quiz.id} className={`cp-quiz-card ${!available ? "locked" : ""} ${score ? "scored" : ""}`}>
                        <div className="cp-quiz-icon">
                          {score ? <Award size={24} /> : available ? <HelpCircle size={24} /> : <Lock size={24} />}
                        </div>
                        <div className="cp-quiz-info">
                          <h4>{quiz.title}</h4>
                          <p>{quiz.description || `${quiz.questions?.length || 0} questions`}</p>
                          {!available && availDate && (
                            <span className="cp-quiz-unlock">
                              <Clock size={12} /> Unlocks: {availDate}
                            </span>
                          )}
                          {score && (
                            <span className="cp-quiz-score">
                              Score: {score.score}/{score.total} ({Math.round((score.score / score.total) * 100)}%)
                            </span>
                          )}
                        </div>
                        <div className="cp-quiz-action">
                          {score ? (
                            <span className="cp-completed-badge">✓ Completed</span>
                          ) : available ? (
                            <button className="cp-start-quiz-btn" onClick={() => setActiveQuiz(quiz)}>
                              Start Quiz
                            </button>
                          ) : (
                            <span className="cp-locked-badge">
                              <Lock size={14} /> Locked
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quiz Overlay */}
      {activeQuiz && (
        <Quiz
          course={course}
          quiz={activeQuiz}
          onComplete={(score, total) => handleQuizSubmit(score, total)}
          onClose={() => setActiveQuiz(null)}
        />
      )}
    </div>
  );
}
