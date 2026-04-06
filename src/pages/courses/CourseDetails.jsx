import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { courseService } from "../../services/courseService";
import { enrollmentService } from "../../services/enrollmentService";
import { 
    BookOpen, 
    Play, 
    FileText, 
    Clock, 
    Lock, 
    CheckCircle, 
    Shield, 
    TrendingUp, 
    ChevronRight,
    ArrowLeft,
    Share2,
    Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./Courses.css";

export default function CourseDetails() {
    const { courseId } = useParams();
    const { user, role } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [enrolled, setEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const c = await courseService.getCourseById(courseId);
                if (!c) {
                    setError("Course intel not found.");
                    return;
                }
                setCourse(c);

                const m = await courseService.getCourseMaterials(courseId);
                setMaterials(m);

                if (user) {
                    const isE = await enrollmentService.isEnrolled(user.uid, courseId);
                    setEnrolled(isE);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to synchronize with GTE learning matrix.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [courseId, user]);

    const handleEnroll = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        const coinCost = course.price || 0;
        if (!window.confirm(`Deploy ${coinCost} GTE Coins to unlock this course permanently?`)) return;

        setEnrolling(true);
        try {
            await enrollmentService.enrollInCourse(user.uid, courseId, coinCost);
            setEnrolled(true);
            alert("Enrollment Successful! Mission parameters updated. ✅");
        } catch (err) {
            console.error(err);
            alert(err.message || "Financial transaction failed. Check Vault balance.");
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return (
        <div className="courses-loading">
            <div className="spinner"></div>
            <p>Decrypting Subject Intel...</p>
        </div>
    );

    if (error || !course) return (
        <div className="courses-error">
            <ArrowLeft size={48} />
            <h2>Intel Error</h2>
            <p>{error || "Course does not exist or has been redacted."}</p>
            <Link to="/courses" className="btn-primary">Return to Catalog</Link>
        </div>
    );

    return (
        <div className="course-details-page">
            <div className="course-hero">
                <div className="hero-blur" style={{ backgroundImage: `url(${course.thumbnail || '/course-placeholder.jpg'})` }}></div>
                <div className="hero-content max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12 relative z-10">
                    
                    {/* Left: Info */}
                    <div className="flex-1 space-y-6">
                        <Link to="/courses" className="back-link flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors mb-4">
                            <ArrowLeft size={18} /> BACK TO MISSIONS
                        </Link>
                        
                        <div className="flex items-center gap-2">
                            <span className="tag blue">{course.category || "General"}</span>
                            {course.isLive && <span className="tag red animate-pulse">LIVE NOW</span>}
                        </div>

                        <h1 className="course-title text-5xl font-black text-white leading-tight">
                            {course.title}
                        </h1>

                        <p className="course-description text-slate-300 text-lg leading-relaxed max-w-2xl">
                            {course.description}
                        </p>

                        <div className="course-meta flex flex-wrap gap-6 text-slate-400 font-medium">
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-blue-400" />
                                <span>{course.enrollmentCount || 0} Operatives Enrolled</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-blue-400" />
                                <span>{course.duration || "4h 20m"} Total Transmission</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield size={18} className="text-blue-400" />
                                <span>Level: {course.level || "Specialist"}</span>
                            </div>
                        </div>

                        <div className="instructor-badge flex items-center gap-3 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-fit">
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                                {course.instructor?.charAt(0) || "I"}
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase font-black block">Mission Instructor</span>
                                <span className="text-white font-bold">{course.instructor || "GTE Elite"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Pricing Card */}
                    <div className="md:w-[400px]">
                        <motion.div 
                            className="pricing-card bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl sticky top-24"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <img 
                                src={course.thumbnail || '/course-placeholder.jpg'} 
                                alt={course.title} 
                                className="w-full aspect-video object-cover rounded-xl mb-6 border border-white/10 shadow-lg"
                            />

                            <div className="flex items-end gap-2 mb-6">
                                <span className="text-4xl font-black text-white">{course.price || 0}</span>
                                <span className="text-blue-400 font-bold mb-1">GTE COINS</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle size={16} className="text-blue-500" />
                                    <span>Permanent Access to Intel</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle size={16} className="text-blue-500" />
                                    <span>Downloadable Briefings & Assets</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle size={16} className="text-blue-500" />
                                    <span>Official Mission Certification</span>
                                </div>
                            </div>

                            {enrolled ? (
                                <button 
                                    onClick={() => navigate(`/courses/${courseId}/lessons`)}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-green-900/20"
                                >
                                    CONTINUE MISSION <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button 
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50"
                                >
                                    {enrolling ? "PROCESSING TRANSACTION..." : <>DEPLOY VAULT COINS <Shield size={20} /></>}
                                </button>
                            )}

                            <div className="flex items-center justify-between mt-6">
                                <button className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                    <Share2 size={14} /> Shared Intel
                                </button>
                                <span className="text-[10px] text-slate-600 font-mono">SECURE TRANS_V2</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Curriculum Section */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Materials */}
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <h2 className="text-3xl font-black text-white mb-8 border-l-4 border-blue-600 pl-4 uppercase tracking-tighter">
                                Mission Curriculum
                            </h2>
                            <div className="curriculum-list space-y-4">
                                {materials.length === 0 ? (
                                    <div className="p-12 text-center bg-slate-800/20 rounded-3xl border border-white/5 border-dashed">
                                        <BookOpen size={48} className="text-slate-700 mx-auto mb-4" />
                                        <p className="text-slate-500">Curriculum intel is still being decrypted. Refresh soon.</p>
                                    </div>
                                ) : (
                                    materials.map((m, idx) => (
                                        <div 
                                            key={m.id} 
                                            className={`curriculum-item p-6 rounded-2xl border transition-all flex items-center gap-6 ${enrolled ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800' : 'bg-slate-900/50 border-slate-800 opacity-60'}`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                                                    {m.title}
                                                    {!enrolled && <Lock size={14} className="text-slate-600" />}
                                                </h4>
                                                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1">
                                                        {m.type === 'video' ? <Play size={10} /> : <FileText size={10} />} {m.type}
                                                    </span>
                                                    <span>• {m.duration || "10m"}</span>
                                                </div>
                                            </div>
                                            {enrolled && (
                                                <button 
                                                    onClick={() => navigate(`/courses/${courseId}/lessons/${m.id}`)}
                                                    className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all"
                                                >
                                                    START
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-white mb-8 border-l-4 border-slate-600 pl-4 uppercase tracking-tighter">
                                Learning Objectives
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {["Master core conceptual frameworks", "Apply direct operational workflows", "Secure certification benchmarks", "Deploy learned intel in real scenarios"].map((obj, i) => (
                                    <div key={i} className="flex gap-3 text-slate-400">
                                        <CheckCircle size={20} className="text-blue-500 flex-shrink-0" />
                                        <p>{obj}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Sidebar / Related */}
                    <div>
                        <div className="p-8 bg-blue-600/10 rounded-3xl border border-blue-500/20">
                            <TrendingUp size={32} className="text-blue-400 mb-4" />
                            <h3 className="text-white font-bold text-lg mb-2">Ready to Level Up?</h3>
                            <p className="text-slate-400 text-sm mb-6">Completing this mission will increase your platform reputation and unlock Tier 2 briefings.</p>
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                    <span className="text-slate-500">Reputation Gain</span>
                                    <span className="text-blue-400">+500 PTS</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-3/4"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
