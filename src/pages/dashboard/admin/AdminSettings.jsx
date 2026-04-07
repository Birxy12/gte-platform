import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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

    if (loading) return <div className="ad-card">Synchronizing with Command Center...</div>;

    return (
        <div className="ad-card" style={{ maxWidth: '800px', margin: '0 0' }}>
            <h2>Global Web App Settings</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                Control platform-wide features, maintenance status, and security configurations.
            </p>

            {message.text && (
                <div style={{
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
                <div className="ad-form-grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>

                    <div className="ad-field">
                        <label>Application / Site Name</label>
                        <input
                            type="text"
                            value={settings.siteName || ''}
                            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        />
                    </div>

                    {/* Section: Access & Security */}
                    <div className="ad-settings-section">
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: '0.5rem' }}>Access & Security</h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.75rem' }}>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', color: '#f1f5f9' }}>Allow New Registrations</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>If disabled, new users will not be able to sign up.</p>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    style={{ width: '20px', height: '20px', accentColor: '#3b82f6' }}
                                    checked={settings.allowRegistrations}
                                    onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
                                />
                            </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.75rem' }}>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', color: '#f1f5f9' }}>Maintenance Mode</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Shows a maintenance screen to all non-admin users.</p>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    style={{ width: '20px', height: '20px', accentColor: '#f59e0b' }}
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Section: Referral System */}
                    <div className="ad-settings-section">
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: '0.5rem' }}>Referral System</h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', color: '#f1f5f9' }}>Enable Referral Program</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Toggle the global refer-a-friend system.</p>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    style={{ width: '20px', height: '20px', accentColor: '#10b981' }}
                                    checked={settings.referralEnabled}
                                    onChange={(e) => setSettings({ ...settings, referralEnabled: e.target.checked })}
                                />
                            </label>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="ad-field">
                                <label>Referrer Bonus (Coins)</label>
                                <input
                                    type="number"
                                    value={settings.referralBonus || 0}
                                    onChange={(e) => setSettings({ ...settings, referralBonus: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="ad-field">
                                <label>Registrant Bonus (Coins)</label>
                                <input
                                    type="number"
                                    value={settings.referralRegistrantBonus || 0}
                                    onChange={(e) => setSettings({ ...settings, referralRegistrantBonus: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 mb-6 text-center">
                        <p className="text-sm text-slate-400 m-0">
                            <strong>Note:</strong> Economy, Pricing, and Coin Allocation have been moved to the <a href="/admin/economy" className="text-blue-400 hover:text-blue-300">Coin Settings</a> page.
                        </p>
                    </div>

                    {/* Section: Platform Features */}
                    <div className="ad-settings-section">
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: '0.5rem' }}>Platform Features</h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.75rem' }}>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', color: '#f1f5f9' }}>OpenAI Auto-Moderation</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Enable AI analysis buttons in Moderation panel.</p>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    style={{ width: '20px', height: '20px', accentColor: '#10b981' }}
                                    checked={settings.autoModerationEnabled}
                                    onChange={(e) => setSettings({ ...settings, autoModerationEnabled: e.target.checked })}
                                />
                            </label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.75rem' }}>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0', color: '#f1f5f9' }}>Social Platforms (Reels/Social)</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Toggle vertical video feed and social dossiers.</p>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    style={{ width: '20px', height: '20px', accentColor: '#ec4899' }}
                                    checked={settings.socialFeaturesEnabled}
                                    onChange={(e) => setSettings({ ...settings, socialFeaturesEnabled: e.target.checked })}
                                />
                            </label>
                        </div>

                        <div className="ad-field">
                            <label>Max Reel Upload Size (MB)</label>
                            <input
                                type="number"
                                value={settings.maxReelUploadSize || 50}
                                onChange={(e) => setSettings({ ...settings, maxReelUploadSize: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="ad-field">
                            <label>Featured Course ID (Dossier Highlight)</label>
                            <input
                                type="text"
                                placeholder="Course Firestore ID..."
                                value={settings.featuredCourseId || ''}
                                onChange={(e) => setSettings({ ...settings, featuredCourseId: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="ad-field">
                        <label>Maintenance Downtime Message</label>
                        <textarea
                            value={settings.maintenanceMessage || ''}
                            onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                            rows={3}
                            style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '8px' }}
                        />
                    </div>

                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="ad-btn-primary" disabled={saving}>
                        {saving ? "Saving..." : "💾 Save Settings"}
                    </button>
                </div>
            </form>
        </div>
    );
}
