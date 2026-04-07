import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { Mail, Save, RotateCcw, AlertTriangle } from "lucide-react";

export default function ManageMails() {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const defaultTemplates = [
        {
            id: "welcome_email",
            name: "Welcome Email",
            description: "Sent to new operatives upon registration.",
            subject: "Welcome to GTE, {{username}}",
            body: "Operational Command welcomes you to the Global Tactical Environment. Your student ID is {{studentId}}. Prepare for your first mission.",
            placeholders: ["username", "studentId", "email"]
        },
        {
            id: "course_enrollment",
            name: "Course Enrollment",
            description: "Sent when a user enrolls in a new module.",
            subject: "Mission Assigned: {{courseName}}",
            body: "You have been successfully enrolled in {{courseName}}. Complete the objectives and report back with your findings.",
            placeholders: ["username", "courseName", "enrollmentDate"]
        },
        {
            id: "mission_complete",
            name: "Mission Completion",
            description: "Sent when a user completes all lessons in a course.",
            subject: "Objective Secured: {{courseName}}",
            body: "Congratulations, {{username}}. You have successfully completed the {{courseName}} mission. Check your dossier for the new clearance level.",
            placeholders: ["username", "courseName", "completionDate"]
        }
    ];

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const snap = await getDocs(collection(db, "mailTemplates"));
                if (snap.empty) {
                    // Seed defaults if empty
                    const initial = [];
                    for (const t of defaultTemplates) {
                        await setDoc(doc(db, "mailTemplates", t.id), t);
                        initial.push(t);
                    }
                    setTemplates(initial);
                    if (initial.length > 0) setSelectedTemplate(initial[0]);
                } else {
                    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setTemplates(data);
                    if (data.length > 0) setSelectedTemplate(data[0]);
                }
            } catch (err) {
                console.error("Error fetching templates:", err);
                setMessage({ type: "error", text: "Failed to load mail templates." });
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    const handleSave = async () => {
        if (!selectedTemplate) return;
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            await updateDoc(doc(db, "mailTemplates", selectedTemplate.id), selectedTemplate);
            setTemplates(templates.map(t => t.id === selectedTemplate.id ? selectedTemplate : t));
            setMessage({ type: "success", text: `${selectedTemplate.name} updated successfully.` });
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Failed to save template changes." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="ad-card">Loading intelligence communication protocols...</div>;

    return (
        <div className="ad-container">
            <div className="ad-page-header">
                <div className="ad-header-title">
                    <h1>Communication Protocols</h1>
                    <p>Manage automated field correspondence and mission briefings</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Template List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="uppercase tracking-widest text-xs text-slate-500 mb-4">Available Templates</h3>
                    {templates.map(t => (
                        <div 
                            key={t.id}
                            onClick={() => setSelectedTemplate(t)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                selectedTemplate?.id === t.id 
                                ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-900/10' 
                                : 'bg-slate-900/50 border-white/5 hover:border-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${selectedTemplate?.id === t.id ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-200">{t.name}</h4>
                                    <p className="text-xs text-slate-500">{t.id}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-2">
                    {selectedTemplate ? (
                        <div className="ad-card" style={{ marginTop: 0 }}>
                            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedTemplate.name}</h3>
                                    <p className="text-sm text-slate-500">{selectedTemplate.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setSelectedTemplate(templates.find(t => t.id === selectedTemplate.id))}
                                        className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-colors"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                                    >
                                        <Save size={18} /> {saving ? "Updating..." : "Save Protocol"}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="ad-field">
                                    <label>Message Subject</label>
                                    <input 
                                        type="text"
                                        value={selectedTemplate.subject}
                                        onChange={(e) => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none"
                                    />
                                </div>

                                <div className="ad-field">
                                    <label>Message Content (Body)</label>
                                    <textarea 
                                        rows={10}
                                        value={selectedTemplate.body}
                                        onChange={(e) => setSelectedTemplate({...selectedTemplate, body: e.target.value})}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-blue-500/50 outline-none font-mono text-sm leading-relaxed"
                                    />
                                </div>

                                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                                        <div>
                                            <h5 className="text-sm font-bold text-amber-400 mb-1">Available Placeholder Variables</h5>
                                            <p className="text-xs text-amber-500/70 mb-3">Include these in the subject or body to inject mission-specific data.</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTemplate.placeholders?.map(p => (
                                                    <code key={p} className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 text-[10px]">
                                                        {`{{${p}}}`}
                                                    </code>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="ad-card flex flex-col items-center justify-center py-24 text-center border-dashed border-2 border-white/5 bg-transparent">
                            <div className="p-4 rounded-2xl bg-slate-900 text-slate-700 mb-4">
                                <Mail size={48} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-400">Select a Secure Communication Protocol</h3>
                            <p className="text-sm text-slate-600">Choose a template from the left to begin correspondence encryption.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
