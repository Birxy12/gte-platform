import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

export default function AdminSiteEditor() {
    const [activeTab, setActiveTab] = useState("pricing"); // pricing, pages
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Dummy state for pages content editor
    const [pageContent, setPageContent] = useState({
        heroTitle: "Invest in Your Career",
        heroSubtitle: "Choose the perfect plan to accelerate your learning journey. Start building your future today.",
        aboutText: "Welcome to GlobixTech. We provide top-tier mission training."
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "courses"));
            const courseData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCourses(courseData);
        } catch (err) {
            console.error("Error fetching courses:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCoursePriceChange = (id, field, value) => {
        setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const handleSavePrices = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });
        try {
            // Update all courses
            const promises = courses.map(course => 
                setDoc(doc(db, "courses", course.id), course, { merge: true })
            );
            await Promise.all(promises);
            setMessage({ type: "success", text: "Course pricing updated successfully." });
        } catch (err) {
            console.error("Error saving prices:", err);
            setMessage({ type: "error", text: "Failed to update pricing." });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveContent = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });
        try {
            await setDoc(doc(db, "settings", "content"), pageContent, { merge: true });
            setMessage({ type: "success", text: "Page content updated successfully." });
        } catch (err) {
            console.error("Error saving content:", err);
            setMessage({ type: "error", text: "Failed to update page content." });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="ad-container" style={{ maxWidth: '1000px', margin: '0' }}>
            <div className="ad-page-header">
                <div className="ad-header-title">
                    <h1>Site Content & Pricing Editor</h1>
                    <p>Manage course prices and customize landing page content</p>
                </div>
            </div>

            {message.text && (
                <div className={`ad-alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`} style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    borderRadius: '8px',
                    background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    border: `1px solid ${message.type === 'error' ? '#ef4444' : '#10b981'}`,
                    color: message.type === 'error' ? '#fca5a5' : '#6ee7b7'
                }}>
                    {message.text}
                </div>
            )}

            <div className="ad-tab-container mb-8">
                <button 
                    className={`ad-tab ${activeTab === 'pricing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pricing')}
                >
                    💰 Course Pricing
                </button>
                <button 
                    className={`ad-tab ${activeTab === 'pages' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pages')}
                >
                    📝 Page Content
                </button>
            </div>

            <div className="ad-content-area">
                {activeTab === 'pricing' && (
                    <form onSubmit={handleSavePrices}>
                        <div className="ad-card" style={{ marginTop: 0 }}>
                            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#3b82f6', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Edit Mission Prices (USD)</h3>
                            
                            {loading ? (
                                <div className="text-slate-400 py-4">Loading courses...</div>
                            ) : courses.length === 0 ? (
                                <div className="text-slate-400 py-4">No courses available.</div>
                            ) : (
                                <div className="space-y-4">
                                    {courses.map(course => (
                                        <div key={course.id} className="flex items-center gap-4 p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                                            <div className="flex-1 font-bold text-slate-200">{course.title || "Untitled Course"}</div>
                                            <div className="flex items-center gap-2">
                                                <div className="ad-field mb-0">
                                                    <label className="text-[10px]">Monthly ($)</label>
                                                    <input 
                                                        type="number" 
                                                        value={course.monthlyPrice || 0} 
                                                        onChange={(e) => handleCoursePriceChange(course.id, 'monthlyPrice', e.target.value)}
                                                        className="w-24 bg-slate-800 border-white/10 text-white rounded p-1"
                                                    />
                                                </div>
                                                <div className="ad-field mb-0">
                                                    <label className="text-[10px]">Annual ($)</label>
                                                    <input 
                                                        type="number" 
                                                        value={course.annualPrice || 0} 
                                                        onChange={(e) => handleCoursePriceChange(course.id, 'annualPrice', e.target.value)}
                                                        className="w-24 bg-slate-800 border-white/10 text-white rounded p-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button type="submit" className="ad-btn-primary px-10" disabled={saving || loading}>
                                {saving ? "Saving..." : "💾 Save Prices"}
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'pages' && (
                    <form onSubmit={handleSaveContent}>
                        <div className="ad-card" style={{ marginTop: 0 }}>
                            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Landing Page Copy</h3>
                            
                            <div className="space-y-4">
                                <div className="ad-field">
                                    <label>Hero Title</label>
                                    <input 
                                        type="text" 
                                        value={pageContent.heroTitle}
                                        onChange={(e) => setPageContent({...pageContent, heroTitle: e.target.value})}
                                        className="ad-input"
                                    />
                                </div>
                                <div className="ad-field">
                                    <label>Hero Subtitle</label>
                                    <textarea 
                                        rows={2}
                                        value={pageContent.heroSubtitle}
                                        onChange={(e) => setPageContent({...pageContent, heroSubtitle: e.target.value})}
                                    />
                                </div>
                                <div className="ad-field border-t border-white/5 pt-4">
                                    <label>About Us Text</label>
                                    <textarea 
                                        rows={4}
                                        value={pageContent.aboutText}
                                        onChange={(e) => setPageContent({...pageContent, aboutText: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button type="submit" className="ad-btn-primary px-10" disabled={saving}>
                                {saving ? "Saving..." : "💾 Save Content"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
