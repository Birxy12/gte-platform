import { useEffect, useState, useCallback } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  Play, 
  Trash2, 
  User, 
  Music, 
  Calendar, 
  Plus, 
  Video, 
  Target, 
  ShieldAlert,
  Upload,
  CheckCircle,
  XCircle,
  Megaphone
} from "lucide-react";
import { format } from "date-fns";
import { missionsService } from "../../../services/missionsService";
import { reelsService } from "../../../services/reelsService";
import { useAuth } from "../../../context/AuthProvider";

export default function ManageReels() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("reels");
  const [reels, setReels] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [newMission, setNewMission] = useState({ category: "General", prompt: "" });
  const [isAddingMission, setIsAddingMission] = useState(false);
  const [newAd, setNewAd] = useState({ description: "", file: null, videoUrl: "" });
  const [isUploadingAd, setIsUploadingAd] = useState(false);

  const fetchData = useCallback(async () => {
    if (authLoading || !isAdmin) return;
    
    try {
      setLoading(true);
      setError(null);
      const [reelsSnap, missionsSnap] = await Promise.all([
        getDocs(collection(db, "reels")),
        missionsService.getMissions()
      ]);
      setReels(reelsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setMissions(missionsSnap);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAdmin]);

  useEffect(() => { 
    if (!authLoading && isAdmin) {
      fetchData(); 
    }
  }, [fetchData, authLoading, isAdmin]);

  const handleDeleteReel = async (id) => {
    if (window.confirm("Permanently delete this reel?")) {
      try {
        await deleteDoc(doc(db, "reels", id));
        fetchData();
      } catch (err) { alert("Delete failed"); }
    }
  };

  const handleAddMission = async (e) => {
    e.preventDefault();
    if (!newMission.prompt) return;
    setIsAddingMission(true);
    try {
      await missionsService.addMission(newMission);
      setNewMission({ category: "General", prompt: "" });
      fetchData();
    } catch (err) { alert("Failed to add mission"); }
    finally { setIsAddingMission(false); }
  };

  const handleSeedMissions = async () => {
    if (!window.confirm("Restore original mission prompts? Current database items will stay, copies may be created.")) return;
    setIsAddingMission(true);
    try {
        const legacyMissions = [
            { category: "Tech", prompt: "Explain your favorite tech gadget in 10 seconds." },
            { category: "Tech", prompt: "Show us your workspace setup in cinematic shots." },
            { category: "Comedy", prompt: "Re-enact a famous movie scene with a funny twist." },
            { category: "Lifestyle", prompt: "Show your morning routine in fast forward." },
            { category: "General", prompt: "Show your hidden talent in 15 seconds!" }
        ];
        await missionsService.seedMissions(legacyMissions);
        fetchData();
        alert("Mission database seeded successfully.");
    } catch (err) { alert("Seed failed"); }
    finally { setIsAddingMission(false); }
  };

  const handleDeleteMission = async (id) => {
    if (window.confirm("Delete this mission?")) {
      try {
        await missionsService.deleteMission(id);
        fetchData();
      } catch (err) { alert("Delete failed"); }
    }
  };

  const handleUploadAd = async (e) => {
    e.preventDefault();
    if (!newAd.description || (!newAd.file && !newAd.videoUrl)) {
        alert("Description and video source required");
        return;
    }
    setIsUploadingAd(true);
    try {
        await reelsService.uploadReel(newAd.file, newAd.description, user, { 
            isAd: true, 
            isPromotional: true,
            originalVideoUrl: newAd.videoUrl, // Support manual URL if file not provided
            isRepost: !newAd.file && !!newAd.videoUrl
        });
        setNewAd({ description: "", file: null, videoUrl: "" });
        setActiveTab("reels");
        fetchData();
        alert("Promotional Reel deployed successfully!");
    } catch (err) { 
        console.error(err);
        alert("Upload failed: " + err.message); 
    }
    finally { setIsUploadingAd(false); }
  };

  if (authLoading) return <div className="ad-card">Verifying security credentials...</div>;
  if (!isAdmin) return <div className="ad-card text-red-500">Access Denied: Admin Level Required</div>;
  
  if (error?.code === "permission-denied") {
    return (
      <div className="ad-card border-red-500/50 bg-red-500/5">
        <h2 className="text-red-400 font-bold mb-4 flex items-center gap-2">
            ⚠️ Security Configuration Required
        </h2>
        <p className="text-slate-300 mb-4 font-medium">
            Access denied to missions collection. You need to update your Firestore security rules.
        </p>
        <div className="bg-black/40 p-5 rounded-xl border border-white/5 mb-6">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-3 font-bold">Paste this in Firebase Console:</p>
            <pre className="text-xs text-blue-400 overflow-x-auto leading-relaxed">
{`match /missions/{missionId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}`}
            </pre>
        </div>
        <button onClick={fetchData} className="ad-btn-primary">
            Retry Connection
        </button>
      </div>
    );
  }

  if (loading && reels.length === 0) return <div className="ad-card">Loading intelligence assets...</div>;

  return (
    <>
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Reel & Mission Command</h1>
          <p>Global moderation and mission deployment center</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab("reels")} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'reels' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          <Video size={18} /> Reel Moderation
        </button>
        <button 
          onClick={() => setActiveTab("ads")} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'ads' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          <Megaphone size={18} /> Promotional Ads
        </button>
        <button 
          onClick={() => setActiveTab("missions")} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'missions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          <Target size={18} /> Mission Command
        </button>
      </div>

      {activeTab === "reels" && (
        <div className="ad-card" style={{ padding: '0' }}>
            <div className="ad-table-header" style={{ padding: '1.5rem' }}>
                <h3 className="text-white font-bold">Active Intel ({reels.length})</h3>
            </div>
          <div className="ad-table-wrapper">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Intel Preview</th>
                  <th>Author</th>
                  <th>Type</th>
                  <th>Metadata</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reels.map(reel => (
                  <tr key={reel.id}>
                    <td>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: '80px', background: '#020617', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                          <video src={reel.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                        </div>
                        <div>
                          <div className="font-bold text-white line-clamp-1">{reel.description || 'No data'}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-tighter">SEC_ID: {reel.id.substring(0, 12)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="flex items-center gap-2 text-slate-300">
                        <User size={14} className="text-blue-400" /> {reel.authorName || 'Field Agent'}
                      </span>
                    </td>
                    <td>
                        {reel.isAd ? (
                            <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded text-[10px] font-black tracking-widest border border-amber-500/20">PROMO_AD</span>
                        ) : (
                            <span className="px-2 py-1 bg-slate-500/10 text-slate-500 rounded text-[10px] font-black tracking-widest border border-slate-500/20">ORGANIC</span>
                        )}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1 text-[10px] text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1"><Music size={10} /> {reel.music || 'Original Audio'}</div>
                        <div className="flex items-center gap-1"><Calendar size={10} /> {reel.createdAt ? format(reel.createdAt.toDate(), 'MMM d, p') : 'Pending'}</div>
                      </div>
                    </td>
                    <td>
                      <button onClick={() => handleDeleteReel(reel.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/20">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "ads" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="ad-card">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Megaphone className="text-blue-500" /> Deploy Promotional Intel
                </h3>
                <form onSubmit={handleUploadAd} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Ad Description</label>
                        <textarea 
                            value={newAd.description}
                            onChange={e => setNewAd({...newAd, description: e.target.value})}
                            placeholder="Describe this promotional objective..."
                            className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 outline-none h-32"
                            required
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Intel Source (File)</label>
                        <div className="relative h-24 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center bg-slate-900/50 hover:bg-slate-800 transition-all cursor-pointer">
                            <input 
                                type="file" 
                                accept="video/*"
                                onChange={e => setNewAd({...newAd, file: e.target.files[0]})}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {newAd.file ? (
                                <div className="flex items-center gap-2 text-blue-400 font-bold">
                                    <CheckCircle size={18} /> {newAd.file.name}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Upload size={18} /> Click to upload video asset
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center font-bold text-slate-600 text-xs uppercase tracking-widest">--- OR ---</div>

                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Intel source (External URL)</label>
                        <input 
                            type="text"
                            value={newAd.videoUrl}
                            onChange={e => setNewAd({...newAd, videoUrl: e.target.value})}
                            placeholder="https://example.com/asset.mp4"
                            className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 outline-none"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isUploadingAd}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                        {isUploadingAd ? "Encrypting & Uploading..." : "Deploy Global Ad"}
                    </button>
                </form>
            </div>
            
            <div className="ad-card bg-slate-900/50 border-slate-800">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><ShieldAlert size={18} className="text-amber-500" /> Deployment Protocol</h3>
                <ul className="space-y-4 text-slate-400 text-sm">
                    <li>• Promotional reels will bypass standard organic filtering.</li>
                    <li>• Ads are automatically prioritized in the global intelligence feed.</li>
                    <li>• Users can interact (like/comment) but are restricted from extraction (download).</li>
                    <li>• Authorship will default to Current Admin Authority.</li>
                </ul>
            </div>
        </div>
      )}

      {activeTab === "missions" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 ad-card">
                <h3 className="text-xl font-bold text-white mb-6">Deploy New Mission</h3>
                <form onSubmit={handleAddMission} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Sector (Category)</label>
                        <select 
                            value={newMission.category}
                            onChange={e => setNewMission({...newMission, category: e.target.value})}
                            className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 outline-none"
                        >
                            <option value="General">General Intel</option>
                            <option value="Tech">Technical Ops</option>
                            <option value="Comedy">Psychological Ops</option>
                            <option value="Lifestyle">Survival Training</option>
                            <option value="Special">Special Operations</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-400 text-sm font-bold uppercase tracking-widest">Objective (Prompt)</label>
                        <textarea 
                            value={newMission.prompt}
                            onChange={e => setNewMission({...newMission, prompt: e.target.value})}
                            placeholder="What is the mission objective?"
                            className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-blue-500 outline-none h-32"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isAddingMission}
                        className="bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl shadow-lg shadow-green-900/20 transition-all uppercase tracking-widest"
                    >
                        {isAddingMission ? "Transmitting..." : "Activate Mission"}
                    </button>
                </form>
            </div>

            <div className="lg:col-span-8 ad-card p-0">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-white font-bold">Mission Database ({missions.length})</h3>
                    <button 
                        onClick={handleSeedMissions}
                        className="text-[10px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-widest border border-slate-800 hover:border-blue-900/50 px-3 py-1 rounded-lg transition-all"
                    >
                        Reseed Database
                    </button>
                </div>
                <div className="ad-table-wrapper">
                    <table className="ad-table">
                        <thead>
                            <tr>
                                <th>Objective</th>
                                <th>Sector</th>
                                <th>Deployed</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {missions.map(m => (
                                <tr key={m.id}>
                                    <td className="text-slate-200 font-medium max-w-xs">{m.prompt}</td>
                                    <td>
                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-[10px] font-black border border-blue-500/20 tracking-widest uppercase">
                                            {m.category}
                                        </span>
                                    </td>
                                    <td className="text-slate-500 text-xs">
                                        {m.createdAt ? format(m.createdAt.toDate(), "MMM d, yyyy") : "N/A"}
                                    </td>
                                    <td>
                                        <button onClick={() => handleDeleteMission(m.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </>
  );
}
