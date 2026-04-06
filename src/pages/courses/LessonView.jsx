import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { courseService } from "../../services/courseService";
import { enrollmentService } from "../../services/enrollmentService";
import { 
    ChevronLeft, 
    ChevronRight, 
    Play, 
    FileText, 
    CheckCircle, 
    Lock,
    Menu,
    X,
    MessageSquare,
    Award,
    HelpCircle,
    ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LessonView() {
    const { courseId, materialId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [currentMaterial, setCurrentMaterial] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate("/login");
            return;
        }

        const load = async () => {
            try {
                // 1. Verify Enrollment First
                const isE = await enrollmentService.isEnrolled(user.uid, courseId);
                if (!isE) {
                    setError("UNAUTHORIZED ACCESS: MISSION ENROLLMENT REQUIRED.");
                    setLoading(false);
                    return;
                }
                setEnrolled(true);

                // 2. Fetch Course & Materials
                const [c, m] = await Promise.all([
                    courseService.getCourseById(courseId),
                    courseService.getCourseMaterials(courseId)
                ]);

                setCourse(c);
                setMaterials(m);

                // 3. Set Current Material
                if (materialId) {
                    setCurrentMaterial(m.find(item => item.id === materialId) || m[0]);
                } else if (m.length > 0) {
                    setCurrentMaterial(m[0]);
                    navigate(`/courses/${courseId}/lessons/${m[0].id}`, { replace: true });
                }
            } catch (err) {
                console.error(err);
                setError("INTEGRITY BREACH: FAILED TO RETRIEVE MISSION DATA.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [courseId, materialId, user, authLoading]);

    const handleNext = () => {
        const idx = materials.findIndex(m => m.id === currentMaterial?.id);
        if (idx < materials.length - 1) {
            navigate(`/courses/${courseId}/lessons/${materials[idx + 1].id}`);
        }
    };

    const handlePrev = () => {
        const idx = materials.findIndex(m => m.id === currentMaterial?.id);
        if (idx > 0) {
            navigate(`/courses/${courseId}/lessons/${materials[idx - 1].id}`);
        }
    };

    if (loading) return (
        <div className="lesson-loading flex flex-col items-center justify-center min-h-screen bg-[#0a0f1e] text-blue-500">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold tracking-widest uppercase">Initializing Secure Transmission...</p>
        </div>
    );

    if (error) return (
        <div className="lesson-error flex flex-col items-center justify-center min-h-screen bg-[#0a0f1e] text-red-500 p-6 text-center">
            <Shield size={64} className="mb-6 opacity-50" />
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">{error}</h2>
            <Link to={`/courses/${courseId}`} className="px-8 py-3 bg-red-600/10 border border-red-500/20 text-red-500 font-bold rounded-xl hover:bg-red-600/20 transition-all">
                RETURN TO HQ
            </Link>
        </div>
    );

    const currentIndex = materials.findIndex(m => m.id === currentMaterial?.id);
    const progressPercent = ((currentIndex + 1) / materials.length) * 100;

    return (
        <div className="lesson-viewer-layout flex h-screen bg-[#060a14] overflow-hidden text-slate-200">
            
            {/* Sidebar Navigation */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside 
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        className="w-80 h-full bg-[#0d1526] border-r border-white/5 flex flex-col z-30"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-black uppercase text-xs tracking-widest text-blue-400">Mission Content</h3>
                                <p className="text-[10px] text-slate-500 font-bold truncate max-w-[180px]">{course?.title}</p>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {materials.map((m, idx) => (
                                <button
                                    key={m.id}
                                    onClick={() => navigate(`/courses/${courseId}/lessons/${m.id}`)}
                                    className={`w-full text-left p-4 rounded-xl flex items-center gap-4 transition-all group ${currentMaterial?.id === m.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-white/5 text-slate-400'}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${currentMaterial?.id === m.id ? 'bg-white/20' : 'bg-slate-800 text-slate-500Group-hover:text-blue-400'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{m.title}</p>
                                        <p className={`text-[10px] uppercase font-black tracking-widest ${currentMaterial?.id === m.id ? 'text-blue-100' : 'text-slate-600'}`}>
                                            {m.type} • {m.duration || "10m"}
                                        </p>
                                    </div>
                                    {idx < currentIndex && <CheckCircle size={14} className="text-green-500" />}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 border-t border-white/5 bg-[#0a1120]">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                <span className="text-slate-500">Mission Progress</span>
                                <span className="text-blue-400">{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <section className="flex-1 flex flex-col h-full relative">
                
                {/* Top Navigation Bar */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#060a14]/80 backdrop-blur-md z-20">
                    <div className="flex items-center gap-4">
                        {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="text-blue-400 p-2 hover:bg-blue-500/10 rounded-lg"><Menu size={20} /></button>}
                        <Link to={`/courses/${courseId}`} className="text-slate-500 hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
                        <h2 className="text-white font-bold text-sm hidden md:block">{currentMaterial?.title}</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-900 rounded-xl p-1 border border-white/5">
                            <button 
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-20 text-blue-400"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="px-4 flex items-center text-[10px] font-black text-slate-500 border-x border-white/5">
                                {currentIndex + 1} / {materials.length}
                            </div>
                            <button 
                                onClick={handleNext}
                                disabled={currentIndex === materials.length - 1}
                                className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-20 text-blue-400"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black hidden sm:block">
                            MARK COMPLETE
                        </button>
                    </div>
                </header>

                {/* Content Viewer */}
                <div className="flex-1 overflow-y-auto bg-black flex flex-col items-center">
                    <div className="w-full max-w-5xl mx-auto py-8 px-4 md:px-8 space-y-8">
                        
                        {/* Media Player Layer */}
                        <div className="aspect-video w-full bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group">
                            {currentMaterial?.type === 'video' ? (
                                <iframe 
                                    src={currentMaterial.url.includes('youtube.com') ? currentMaterial.url.replace('watch?v=', 'embed/') : currentMaterial.url}
                                    title={currentMaterial.title}
                                    className="w-full h-full border-0"
                                    allowFullScreen
                                />
                            ) : currentMaterial?.type === 'pdf' ? (
                                <iframe 
                                    src={currentMaterial.url}
                                    title={currentMaterial.title}
                                    className="w-full h-full border-0 bg-white"
                                />
                            ) : (
                                <div className="p-12 h-full flex flex-col items-center justify-center text-center space-y-6">
                                    <FileText size={80} className="text-blue-500/20" />
                                    <div className="max-w-xl">
                                        <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">{currentMaterial?.title}</h3>
                                        <div className="prose prose-invert prose-blue max-w-none text-slate-400 text-left">
                                            {/* Render Workflow Content (Could use a Markdown parser here) */}
                                            {currentMaterial?.description || "Mission briefing content is being streamed..."}
                                            {currentMaterial?.content && (
                                                <div className="mt-8 p-6 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
                                                    {currentMaterial.content}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <a 
                                        href={currentMaterial?.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-blue-400 font-bold hover:underline"
                                    >
                                        Open External Resource <ChevronRight size={16} />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Title & Description under media */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-black text-white tracking-tight">{currentMaterial?.title}</h1>
                                <div className="flex gap-2">
                                    <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-all"><MessageSquare size={20} /></button>
                                    <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-all"><HelpCircle size={20} /></button>
                                </div>
                            </div>
                            <p className="text-slate-400 leading-relaxed text-lg italic">
                                "{currentMaterial?.description || "This briefing covers critical mission parameters specific to this objective."}"
                            </p>
                        </div>

                        {/* Quick Tips / Meta */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
                            <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5">
                                <Award size={24} className="text-yellow-500 mb-3" />
                                <h4 className="text-white font-bold text-sm mb-1">Elite Milestone</h4>
                                <p className="text-xs text-slate-500">Earn +20 XP upon completion.</p>
                            </div>
                            <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5">
                                <Users size={24} className="text-blue-500 mb-3" />
                                <h4 className="text-white font-bold text-sm mb-1">Collective Intel</h4>
                                <p className="text-xs text-slate-500">432 Operatives have passed this lesson.</p>
                            </div>
                            <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5">
                                <Shield size={24} className="text-red-500 mb-3" />
                                <h4 className="text-white font-bold text-sm mb-1">Clearance Level</h4>
                                <p className="text-xs text-slate-500">Confidential GTE Subject Matter.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
