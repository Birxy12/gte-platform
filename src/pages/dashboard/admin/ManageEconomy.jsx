import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Coins, Save, TrendingUp, BookOpen, Film, FileText, ArrowRight } from "lucide-react";

export default function ManageEconomy() {
    const [settings, setSettings] = useState({
        coinToCurrencyRate: 1, // e.g. 1 USD = 20.5 Coins
        baseCurrencyLabel: "USD",
        defaultCoursePrice: 500,
        videoUnlockPrice: 50,
        pdfUnlockPrice: 20,
        referralBonus: 100,
        referralRegistrantBonus: 50
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "settings", "global");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(prev => ({ ...prev, ...docSnap.data() }));
                }
            } catch (err) {
                console.error("Error fetching economy settings:", err);
                setMessage({ type: "error", text: "Failed to load economy parameters from central bank." });
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            await setDoc(doc(db, "settings", "global"), settings, { merge: true });
            setMessage({ type: "success", text: "Global economy rates successfully updated." });
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Failed to allocate new economic parameters." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="ad-card">Loading Global Economy...</div>;

    return (
        <div className="ad-container">
            <div className="ad-page-header">
                <div className="ad-header-title">
                    <h1>Coin Allocation & Economy</h1>
                    <p>Manage platform exchange rates and asset pricing</p>
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

            <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Bank Exchange Rate section */}
                    <div className="ad-card" style={{ marginTop: 0 }}>
                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                            <TrendingUp className="text-amber-500" size={24} />
                            <h3 className="text-xl font-bold text-white mb-0 mt-0">Central Exchange</h3>
                        </div>
                        
                        <p className="text-sm text-slate-400 mb-6">
                            Set the intrinsic value of GTE coins relative to real-world currency. Example: If $10 = 205 Coins, then set the rate to 20.5.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="ad-field">
                                <label>Base Currency</label>
                                <input 
                                    type="text"
                                    value={settings.baseCurrencyLabel || "USD"}
                                    onChange={(e) => setSettings({...settings, baseCurrencyLabel: e.target.value})}
                                />
                            </div>
                            <div className="ad-field">
                                <label>Exchange Rate (1 {settings.baseCurrencyLabel || "USD"} = ? Coins)</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    value={settings.coinToCurrencyRate || 1}
                                    onChange={(e) => setSettings({...settings, coinToCurrencyRate: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900 rounded-xl border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-slate-300">
                                <span>10 {settings.baseCurrencyLabel || "USD"}</span>
                                <ArrowRight size={16} className="text-slate-500 mx-2" />
                                <span className="text-amber-400 flex items-center gap-1">
                                    <Coins size={16}/> { ((settings.coinToCurrencyRate || 1) * 10).toFixed(1) } Coins
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Standard Pricing */}
                    <div className="ad-card" style={{ marginTop: 0 }}>
                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                            <Coins className="text-amber-500" size={24} />
                            <h3 className="text-xl font-bold text-white mb-0 mt-0">Material Costs</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><BookOpen size={18} /></div>
                                    <div>
                                        <h4 className="font-bold text-slate-200 text-sm m-0">Default Course Price</h4>
                                        <p className="text-xs text-slate-500 m-0">For generic full modules</p>
                                    </div>
                                </div>
                                <div className="w-24">
                                    <input type="number" className="w-full bg-slate-950 border border-white/10 rounded px-2 py-1 text-white text-center" 
                                        value={settings.defaultCoursePrice || 0} 
                                        onChange={(e) => setSettings({...settings, defaultCoursePrice: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Film size={18} /></div>
                                    <div>
                                        <h4 className="font-bold text-slate-200 text-sm m-0">Premium Video Cost</h4>
                                        <p className="text-xs text-slate-500 m-0">Cost to unlock tactical videos</p>
                                    </div>
                                </div>
                                <div className="w-24">
                                    <input type="number" className="w-full bg-slate-950 border border-white/10 rounded px-2 py-1 text-white text-center" 
                                        value={settings.videoUnlockPrice || 0} 
                                        onChange={(e) => setSettings({...settings, videoUnlockPrice: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg"><FileText size={18} /></div>
                                    <div>
                                        <h4 className="font-bold text-slate-200 text-sm m-0">PDF Download Cost</h4>
                                        <p className="text-xs text-slate-500 m-0">Cost to access written dossiers</p>
                                    </div>
                                </div>
                                <div className="w-24">
                                    <input type="number" className="w-full bg-slate-950 border border-white/10 rounded px-2 py-1 text-white text-center" 
                                        value={settings.pdfUnlockPrice || 0} 
                                        onChange={(e) => setSettings({...settings, pdfUnlockPrice: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={saving} className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 transition-all flex items-center gap-2">
                        <Save size={18} /> {saving ? "Confirming..." : "Update Reserve"}
                    </button>
                </div>
            </form>
        </div>
    );
}
