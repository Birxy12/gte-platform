import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { mailService } from "../../../services/mailService";

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        allowRegistrations: true,
        siteName: "GTE Portal",
        autoModerationEnabled: false,
        maxReelUploadSize: 50,
        maintenanceMessage: "System upgrade in progress. Check back soon for new mission intel.",
        featuredCourseId: "",
        socialFeaturesEnabled: true,
        referralEnabled: true,
        referralBonus: 20,
        referralRegistrantBonus: 20,
        defaultCoursePrice: 100,
        coinToCurrencyRate: 1
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [broadcasting, setBroadcasting] = useState(false);
    const [featureDetails, setFeatureDetails] = useState("");
    const [activeTab, setActiveTab] = useState("protocols"); // protocols, engagement, system

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "settings", "global");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(prev => ({ ...prev, ...docSnap.data() }));
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
                setMessage({ type: "error", text: "Failed to load settings from command center." });
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
            setMessage({ type: "success", text: "Global parameters updated successfully. Protocols active." });
        } catch (err) {
            console.error("Error saving settings:", err);
            setMessage({ type: "error", text: "Priority transmission failed. Check connection." });
        } finally {
            setSaving(false);
        }
    };

    const handleBroadcastFeatures = async () => {
        if (!featureDetails.trim() || broadcasting) return;
        setBroadcasting(true);
        try {
            await mailService.broadcastEmail("new_features_added", {
                featureDetails: featureDetails.trim()
            });
            setMessage({ type: "success", text: "Global feature announcement broadcasted to all operatives." });
            setFeatureDetails("");
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Failed to broadcast update." });
        } finally {
            setBroadcasting(false);
        }
    };

    if (loading) return <div className="ad-card">Synchronizing with Command Center...</div>;

    return (
        <div className="ad-container" style={{ maxWidth: '1000px', margin: '0' }}>
            <div className="ad-page-header">
                <div className="ad-header-title">
                    <h1>Global System Settings</h1>
                    <p>Configure platform-wide protocols and operational parameters</p>
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
                    className={`ad-tab ${activeTab === 'protocols' ? 'active' : ''}`}
                    onClick={() => setActiveTab('protocols')}
                >
                    🛡️ Protocols
                </button>
                <button 
                    className={`ad-tab ${activeTab === 'engagement' ? 'active' : ''}`}
                    onClick={() => setActiveTab('engagement')}
                >
                    🤝 Engagement
                </button>
                <button 
                    className={`ad-tab ${activeTab === 'system' ? 'active' : ''}`}
                    onClick={() => setActiveTab('system')}
                >
                    ⚙️ System Ops
                </button>
            </div>

            <form onSubmit={handleSave}>
                <div className="ad-content-area">
                    {activeTab === 'protocols' && (
                        <div className="ad-card" style={{ marginTop: 0 }}>
                            <div className="ad-field mb-6">
                                <label>Core System Identification (Site Name)</label>
                                <input
                                    type="text"
                                    placeholder="GTE Portal"
                                    className="ad-input"
                                    value={settings.siteName || ''}
                                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                                    <div>
                                        <h4 className="font-bold text-slate-100 m-0">Open Enlistment (Registrations)</h4>
                                        <p className="text-xs text-slate-500 m-0">Allow new operatives to join the platform</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.allowRegistrations}
                                            onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                                    <div>
                                        <h4 className="font-bold text-amber-500 m-0">Security Lockdown (Maintenance)</h4>
                                        <p className="text-xs text-slate-500 m-0">Restrict access during sensitive upgrades</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.maintenanceMode}
                                            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div className="ad-field pt-2">
                                    <label>Priority Mission Target (Featured Course ID)</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Course ID..."
                                        value={settings.featuredCourseId || ''}
                                        onChange={(e) => setSettings({ ...settings, featuredCourseId: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'engagement' && (
                        <div className="ad-card" style={{ marginTop: 0 }}>
                            <div className="ad-settings-section mb-8">
                                <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 mb-6">
                                    <div>
                                        <h4 className="font-bold text-emerald-400 m-0">Referral Protocol Active</h4>
                                        <p className="text-xs text-slate-500 m-0">Incentivize operative network expansion</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.referralEnabled}
                                            onChange={(e) => setSettings({ ...settings, referralEnabled: e.target.checked })}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="ad-field">
                                        <label>Recruiter Incentive (Coins)</label>
                                        <input
                                            type="number"
                                            value={settings.referralBonus || 0}
                                            onChange={(e) => setSettings({ ...settings, referralBonus: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="ad-field">
                                        <label>New Enlist Incentive (Coins)</label>
                                        <input
                                            type="number"
                                            value={settings.referralRegistrantBonus || 0}
                                            onChange={(e) => setSettings({ ...settings, referralRegistrantBonus: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="ad-settings-section">
                                <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-white/5 mb-4">
                                    <div>
                                        <h4 className="font-bold text-slate-100 m-0">Social Infrastructure</h4>
                                        <p className="text-xs text-slate-500 m-0">Enable Reels, status updates, and social dossiers</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.socialFeaturesEnabled}
                                            onChange={(e) => setSettings({ ...settings, socialFeaturesEnabled: e.target.checked })}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <p className="text-xs text-slate-500 italic px-2">
                                    Note: Detailed bounty and reward configs are managed in the <a href="/admin/economy" className="text-blue-400">Finance Division</a>.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            <div className="ad-card" style={{ marginTop: 0 }}>
                                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#3b82f6', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Automated Defense & Storage</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20">
                                        <div>
                                            <h4 className="font-bold text-blue-400 m-0">AI Cognitive Moderation</h4>
                                            <p className="text-xs text-slate-500 m-0">Analyze mission reports and media for policy violations</p>
                                        </div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.autoModerationEnabled}
                                                onChange={(e) => setSettings({ ...settings, autoModerationEnabled: e.target.checked })}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>

                                    <div className="ad-field">
                                        <label>Dossier Data Limit (Max Upload Size MB)</label>
                                        <input
                                            type="number"
                                            value={settings.maxReelUploadSize || 50}
                                            onChange={(e) => setSettings({ ...settings, maxReelUploadSize: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="ad-card">
                                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Global Frequency (Broadcasting)</h3>
                                <div className="space-y-4">
                                    <div className="ad-field">
                                        <label>Maintenance Directive (Message)</label>
                                        <textarea
                                            value={settings.maintenanceMessage || ''}
                                            onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                                            rows={2}
                                            placeholder="System update in progress..."
                                        />
                                    </div>

                                    <div className="ad-field pt-4 border-t border-white/5">
                                        <label className="text-emerald-500">Operation Update: New Feature Blast</label>
                                        <p className="text-xs text-slate-500 mb-4">Transmit a priority update to all active operatives via email.</p>
                                        <textarea 
                                            placeholder="Specify tactical enhancements..."
                                            value={featureDetails}
                                            onChange={(e) => setFeatureDetails(e.target.value)}
                                            rows={4}
                                            className="mb-4"
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleBroadcastFeatures}
                                            disabled={broadcasting || !featureDetails.trim()}
                                            className="ad-btn-secondary w-full"
                                            style={{ borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)', color: '#10b981' }}
                                        >
                                            {broadcasting ? "Transmitting..." : "📡 Synchronize Global Briefing"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button type="submit" className="ad-btn-primary px-10" disabled={saving}>
                        {saving ? "Transmitting..." : "💾 Secure Parameters"}
                    </button>
                </div>
            </form>
        </div>
    );
}
