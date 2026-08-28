import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../../config/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../../../context/AuthProvider";
import { BookOpen, PlusCircle, Edit3, Trash2, Users, PlayCircle, Clock } from "lucide-react";

export default function MyCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchMyCourses = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "courses"), where("instructorId", "==", user.uid));
        const snap = await getDocs(q);
        setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching instructor courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, [user]);

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you certain you want to archive this course mission?")) return;
    try {
      await deleteDoc(doc(db, "courses", courseId));
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">My Mission Courses</h2>
          <p className="text-sm text-slate-400">Manage and edit your active educational curricula.</p>
        </div>
        <Link
          to="/admin/create-course"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/30 uppercase tracking-wider"
        >
          <PlusCircle size={16} /> Deploy New Course
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading your courses...</div>
      ) : courses.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-500 space-y-4">
          <BookOpen size={48} className="mx-auto text-slate-700" />
          <h3 className="text-lg font-bold text-white">No Courses Created Yet</h3>
          <p className="text-sm">Start by authoring your first tactical mission curriculum.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden">
                  <img
                    src={course.thumbnailUrl || course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-950/80 text-blue-400">
                    {course.level || "Cadet"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white line-clamp-1">{course.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{course.description}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="text-xs text-amber-400 font-bold">🪙 {course.coinCost || 0} Coins</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/edit-course/${course.id}`)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                    title="Edit Course"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
