import { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        allowRegistrations: true,
        siteName: "GTE Portal",
        autoModerationEnabled: false
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
                } else {
                    // Create default settings doc if it doesn't exist
                    await setDoc(docRef, settings);
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
                setMessage({ type: "error", text: "Failed to load settings. Check Firestore rules." });
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
            await setDoc(doc(db, "settings", "global"), settings);
            setMessage({ type: "success", text: "Global settings updated successfully." });
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Failed to save settings." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="ad-card">Loading settings...</div>;

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

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                            <h4 style={{ margin: '0 0 0.25rem 0', color: '#f1f5f9' }}>OpenAI Auto-Moderation</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Enable AI analysis buttons in Moderation panel (Requires VITE_OPENAI_API_KEY).</p>
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
