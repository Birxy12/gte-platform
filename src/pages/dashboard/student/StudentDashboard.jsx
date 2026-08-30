import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { db } from "../../../config/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { enrollmentService } from "../../../services/enrollmentService";
import { progressService } from "../../../services/progressService";
import {
  BookOpen,
  Award,
  Zap,
  TrendingUp,
  Clock,
  PlayCircle,
  CheckCircle,
  FileBadge,
  Shield,
  Compass,
  ArrowRight,
  Flame,
  Home
} from "lucide-react";
import CertificateModal from "../user/CertificateModal";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewCertCourse, setViewCertCourse] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadStudentData = async () => {
      setLoading(true);
      try {
        // Fetch User profile & coins
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserCoins(userDoc.data().coins || 0);
        }

        // Fetch enrolled courses
        const enrollments = await enrollmentService.getEnrolledCourses(user.uid);
        const coursesSnap = await getDocs(collection(db, "courses"));
        const allCourses = coursesSnap.docs.reduce((acc, d) => {
          acc[d.id] = { id: d.id, ...d.data() };
          return acc;
        }, {});

        const merged = enrollments.map(enr => {
          const course = allCourses[enr.courseId] || {};
          const lessonsCompleted = enr.completedLessons?.length || 0;
          return {
            ...course,
            enrollmentId: enr.id,
            progress: enr.progress || (lessonsCompleted > 0 ? Math.min(90, lessonsCompleted * 10) : 0),
            completed: enr.progress >= 100,
            completedLessons: lessonsCompleted,
            quizScores: enr.quizScores || {}
          };
        });

        setEnrolledCourses(merged);
        const completed = await progressService.getUserCompletedCourses(user.uid);
        setCompletedCount(completed.length);
      } catch (err) {
        console.error("Failed to load student command dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-widest">Loading Cadet Command Center...</p>
      </div>
    );
  }

  const inProgressList = enrolledCourses.filter(c => !c.completed);
  const completedList = enrolledCourses.filter(c => c.completed);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-10">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/60 border border-blue-500/20 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30">
              TACTICAL STUDENT HQ
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
              <Flame size={14} /> 5 Day Streak
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Welcome Back, <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">{user?.displayName || "Cadet"}</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Track your ongoing certifications, accelerate module completions, and claim tactical rewards.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl font-bold">
              🪙
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Vault Balance</div>
              <div className="text-xl font-black text-amber-400">{userCoins} Coins</div>
            </div>
          </div>

          <Link
            to="/home"
            className="w-[52px] h-[52px] rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-lg active:scale-95"
            title="Return to Home"
          >
            <Home size={20} />
          </Link>

          <Link
            to="/courses"
            className="px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30 active:scale-95"
          >
            <Compass size={18} /> EXPLORE MISSIONS
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-blue-400">
            <BookOpen size={24} />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Active</span>
          </div>
          <div className="text-3xl font-black text-white">{inProgressList.length}</div>
          <div className="text-xs text-slate-400">Missions in progress</div>
        </div>

        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <CheckCircle size={24} />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Mastered</span>
          </div>
          <div className="text-3xl font-black text-white">{completedCount}</div>
          <div className="text-xs text-slate-400">Completed missions</div>
        </div>

        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <Award size={24} />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Credentials</span>
          </div>
          <div className="text-3xl font-black text-white">{completedList.length}</div>
          <div className="text-xs text-slate-400">Official Certificates</div>
        </div>

        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <TrendingUp size={24} />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Avg Progress</span>
          </div>
          <div className="text-3xl font-black text-white">
            {enrolledCourses.length > 0
              ? Math.round(enrolledCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / enrolledCourses.length)
              : 0}%
          </div>
          <div className="text-xs text-slate-400">Curriculum mastery</div>
        </div>
      </div>

      {/* Ongoing Courses */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <PlayCircle className="text-blue-500" /> Active Operations ({inProgressList.length})
          </h2>
          <Link to="/courses" className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1">
            Browse Full Library <ArrowRight size={14} />
          </Link>
        </div>

        {inProgressList.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-500 space-y-3">
            <BookOpen size={48} className="mx-auto text-slate-700" />
            <h3 className="text-lg font-bold text-white">No Active Missions</h3>
            <p className="text-sm">You are not currently enrolled in any ongoing courses.</p>
            <Link
              to="/courses"
              className="inline-block px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase"
            >
              Enroll in a Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressList.map(course => (
              <div
                key={course.enrollmentId || course.id}
                className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden p-6 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-2xl overflow-hidden">
                    <img
                      src={course.thumbnailUrl || course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-blue-400">
                      {course.level || "Cadet"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white line-clamp-1">{course.title}</h3>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Curriculum Mastery</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <Link
                  to="/courses"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/30"
                >
                  <PlayCircle size={16} /> CONTINUE LEARNING
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed & Certificates */}
      {completedList.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-slate-800/80">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Award className="text-amber-500" /> Completed Certifications ({completedList.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedList.map(course => (
              <div
                key={course.enrollmentId || course.id}
                className="bg-slate-900/70 border border-emerald-500/20 rounded-3xl p-6 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle size={12} /> Mastered
                    </span>
                    <span className="text-xs text-slate-500 font-bold">100% Score</span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{course.title}</h3>
                  <p className="text-xs text-slate-400">{course.description}</p>
                </div>

                <button
                  onClick={() => setViewCertCourse(course)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
                >
                  <FileBadge size={16} /> VIEW OFFICIAL TRANSCRIPT
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificate Modal */}
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
