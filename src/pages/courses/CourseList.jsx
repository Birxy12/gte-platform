import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Star, PlayCircle, CheckCircle, Shield } from "lucide-react";

export default function CourseList({ courses = [], enrollments = {}, onCourseClick }) {
  if (!courses || courses.length === 0) {
    return (
      <div className="p-16 text-center bg-slate-900/30 rounded-3xl border border-slate-800 text-slate-500">
        <h3 className="text-lg font-bold text-white mb-1">No Courses Available</h3>
        <p className="text-sm">No courses match your query at this time.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        const isEnrolled = !!enrollments[course.id];
        const coinCost = course.coinCost || course.price || 0;

        return (
          <div
            key={course.id}
            onClick={() => onCourseClick ? onCourseClick(course) : null}
            className="group flex flex-col justify-between bg-slate-900/70 border border-slate-800 hover:border-blue-500/40 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer"
          >
            <div>
              <div className="relative aspect-video overflow-hidden bg-slate-950">
                <img
                  src={course.thumbnailUrl || course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {course.level && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-blue-400 border border-blue-500/30">
                    {course.level}
                  </span>
                )}
                {isEnrolled && (
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/90 text-white flex items-center gap-1">
                    <CheckCircle size={12} /> Enrolled
                  </span>
                )}
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1"><BookOpen size={14} /> 12 Modules</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> 4h 30m</span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-slate-800/40 flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 font-bold text-xs flex items-center justify-center">
                  {(course.instructor || "G")[0].toUpperCase()}
                </div>
                <span className="text-xs text-slate-400 font-medium">{course.instructor || "GTE Instructor"}</span>
              </div>

              <div className="text-xs font-black text-amber-400 flex items-center gap-1">
                {coinCost > 0 ? (
                  <span>🪙 {coinCost} Coins</span>
                ) : (
                  <span className="text-emerald-400">FREE</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
