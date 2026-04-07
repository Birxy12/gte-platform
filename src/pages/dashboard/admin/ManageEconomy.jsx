import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Coins, Save, TrendingUp, BookOpen, Film, FileText, ArrowRight } from "lucide-react";
import { mailService } from "../../../services/mailService";

export default function ManageEconomy() {
    const [settings, setSettings] = useState({
        coinToCurrencyRate: 1, // e.g. 1 USD = 20.5 Coins
        baseCurrencyLabel: "USD",
        defaultCoursePrice: 500,
        videoUnlockPrice: 50,
        pdfUnlockPrice: 20,
        referralBonus: 100,
        referralRegistrantBonus: 50,
        dailyBonusAmount: 50
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [activeTab, setActiveTab] = useState("exchange"); // exchange, pricing, rewards

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
            
            // Broadcast Email for price update
            await mailService.broadcastEmail("coin_price_update", {
                newRate: `1 ${settings.baseCurrencyLabel} = ${settings.coinToCurrencyRate} Coins`
            });

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
                <div className="ad-tab-container mb-8">
                    <button 
                        type="button" 
                        className={`ad-tab ${activeTab === 'exchange' ? 'active' : ''}`}
                        onClick={() => setActiveTab('exchange')}
                    >
                        <TrendingUp size={16} /> Central Exchange
                    </button>
                    <button 
                        type="button" 
                        className={`ad-tab ${activeTab === 'pricing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pricing')}
                    >
                        <Coins size={16} /> Material Costs
                    </button>
                    <button 
                        type="button" 
                        className={`ad-tab ${activeTab === 'rewards' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rewards')}
                    >
                        <Save size={16} /> Rewards & Bonuses
                    </button>
                </div>

                <div className="ad-content-area">
                    {activeTab === 'exchange' && (
                        <div className="ad-card" style={{ marginTop: 0 }}>
                            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                                <TrendingUp className="text-amber-500" size={24} />
                                <h3 className="text-xl font-bold text-white mb-0 mt-0">Bank Exchange Rate</h3>
                            </div>
                            
                            <p className="text-sm text-slate-400 mb-6 font-medium">
                                Configure the intrinsic value of GTE coins relative to global tactical currencies.
                            </p>

                            <div className="ad-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="ad-field">
                                    <label>Base Currency Label</label>
                                    <input 
                                        type="text"
                                        placeholder="USD"
                                        value={settings.baseCurrencyLabel || "USD"}
                                        onChange={(e) => setSettings({...settings, baseCurrencyLabel: e.target.value})}
                                    />
                                </div>
                                <div className="ad-field">
                                    <label>Exchange Rate (1 {settings.baseCurrencyLabel} = ? Coins)</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={settings.coinToCurrencyRate || 1}
                                        onChange={(e) => setSettings({...settings, coinToCurrencyRate: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-slate-900/80 rounded-2xl border border-amber-500/20 shadow-inner">
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider">Estimated Conversion</div>
                                    <div className="flex items-center gap-3 font-black text-xl text-white">
                                        <span className="text-slate-200">10 {settings.baseCurrencyLabel}</span>
                                        <ArrowRight size={20} className="text-amber-500" />
                                        <span className="text-amber-400 flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-xl">
                                            <Coins size={20}/> { ((settings.coinToCurrencyRate || 1) * 10).toFixed(1) } Coins
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div className="ad-card" style={{ marginTop: 0 }}>
                            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                                <Coins className="text-amber-500" size={24} />
                                <h3 className="text-xl font-bold text-white mb-0 mt-0">Standard Material Pricing</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20"><BookOpen size={20} /></div>
                                        <div>
                                            <h4 className="font-bold text-slate-100 m-0">Default Course Price</h4>
                                            <p className="text-xs text-slate-500 m-0">Standardized module costs in coins</p>
                                        </div>
                                    </div>
                                    <div className="w-32">
                                        <input type="number" className="ad-input text-center font-bold" 
                                            value={settings.defaultCoursePrice || 0} 
                                            onChange={(e) => setSettings({...settings, defaultCoursePrice: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20"><Film size={20} /></div>
                                        <div>
                                            <h4 className="font-bold text-slate-100 m-0">Premium Video Cost</h4>
                                            <p className="text-xs text-slate-500 m-0">Price per tactical video unlock</p>
                                        </div>
                                    </div>
                                    <div className="w-32">
                                        <input type="number" className="ad-input text-center font-bold" 
                                            value={settings.videoUnlockPrice || 0} 
                                            onChange={(e) => setSettings({...settings, videoUnlockPrice: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20"><FileText size={20} /></div>
                                        <div>
                                            <h4 className="font-bold text-slate-100 m-0">PDF Download Cost</h4>
                                            <p className="text-xs text-slate-500 m-0">Resources and documentation access</p>
                                        </div>
                                    </div>
                                    <div className="w-32">
                                        <input type="number" className="ad-input text-center font-bold" 
                                            value={settings.pdfUnlockPrice || 0} 
                                            onChange={(e) => setSettings({...settings, pdfUnlockPrice: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rewards' && (
                        <div className="ad-card" style={{ marginTop: 0 }}>
                            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                                <TrendingUp className="text-emerald-500" size={24} />
                                <h3 className="text-xl font-bold text-white mb-0 mt-0">Rewards & Referral System</h3>
                            </div>

                            <div className="ad-form-grid" style={{ gap: '1.5rem' }}>
                                <div className="ad-field">
                                    <label>Referrer Bonus (Coins)</label>
                                    <input 
                                        type="number"
                                        value={settings.referralBonus || 0}
                                        onChange={(e) => setSettings({...settings, referralBonus: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="ad-field">
                                    <label>Registrant Bonus (Coins)</label>
                                    <input 
                                        type="number"
                                        value={settings.referralRegistrantBonus || 0}
                                        onChange={(e) => setSettings({...settings, referralRegistrantBonus: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="ad-field full">
                                    <label>Daily Login Bonus</label>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="number"
                                            className="flex-1"
                                            value={settings.dailyBonusAmount || 50}
                                            onChange={(e) => setSettings({...settings, dailyBonusAmount: parseInt(e.target.value)})}
                                        />
                                        <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5 text-slate-500 text-xs text-center w-1/2">
                                            Awarded every 24 hours of active protocol status.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={saving} className="ad-btn-primary flex items-center gap-3 px-8">
                        <Save size={20} /> {saving ? "Confirming..." : "Update Reserve Strategy"}
                    </button>
                </div>
            </form>
        </div>
    );
}
