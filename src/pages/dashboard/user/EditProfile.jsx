import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthProvider";
import { auth, db, storage } from "../../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const PREDEFINED_AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Robot1",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Robot2",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Robot3",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Robot4"
];

export default function EditProfile() {
    const { user } = useAuth();
    const fileRef = useRef(null);

    const [username, setUsername] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [bio, setBio] = useState("");
    const [photoURL, setPhotoURL] = useState("");
    const [previewURL, setPreviewURL] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            try {
                const snap = await getDoc(doc(db, "users", user.uid));
                if (snap.exists()) {
                    const d = snap.data();
                    setUsername(d.username || "");
                    setDateOfBirth(d.dateOfBirth || "");
                    setPhoneNumber(d.phoneNumber || "");
                    setBio(d.bio || "");
                    setPhotoURL(d.photoURL || "");
                }
            } catch (e) { console.error(e); }
        };
        load();
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPreviewURL(URL.createObjectURL(file));
    };

    const handleSelectAvatar = (url) => {
        setPreviewURL(url);
        setPhotoURL(url);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            let newPhotoURL = photoURL;

            // Upload image if user selected one
            const file = fileRef.current?.files[0];
            if (file) {
                const storageRef = ref(storage, `avatars/${user.uid}_${Date.now()}`);
                await uploadBytes(storageRef, file);
                newPhotoURL = await getDownloadURL(storageRef);
            }

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                username,
                dateOfBirth,
                phoneNumber,
                bio,
                photoURL: newPhotoURL,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setPhotoURL(newPhotoURL);
            setPreviewURL("");
            setSuccess("Profile updated successfully! ✅");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error(err);
            setError("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await updatePassword(auth.currentUser, newPassword);
            setSuccess("Password updated successfully! 🔒");
            setNewPassword("");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error(err);
            if (err.code === "auth/requires-recent-login") {
                setError("Security Alert: Please log out and back in to change your password.");
            } else {
                setError("Failed to change password. You may have registered via Google.");
            }
        } finally {
            setLoading(false);
        }
    };

    const initials = username?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "U";
    const displayPhoto = previewURL || photoURL;

    return (
        <>
            <div className="ud-page-header">
                <h1>Edit Profile</h1>
                <p>Update your personal information and profile picture</p>
            </div>

            {success && <div className="ud-success">{success}</div>}
            {error && <div className="ud-error">{error}</div>}

            <div className="ud-card">
                <h3>Profile Picture</h3>
                <div className="ud-avatar-section">
                    <div className="ud-avatar">
                        {displayPhoto ? <img src={displayPhoto} alt="avatar" /> : initials}
                    </div>
                    <div className="ud-avatar-info">
                        <h4>{username || "Your Name"}</h4>
                        <p>{user?.email}</p>
                        <label className="ud-upload-btn" htmlFor="avatar-upload">
                            📷 Choose Photo
                        </label>
                        <input
                            id="avatar-upload"
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>Or choose from our gallery:</h4>
                    <div className="ud-avatar-grid">
                        {PREDEFINED_AVATARS.map((url, idx) => (
                            <div 
                                key={idx} 
                                className={`ud-avatar-option ${displayPhoto === url ? 'selected' : ''}`}
                                onClick={() => handleSelectAvatar(url)}
                            >
                                <img src={url} alt={`Avatar option ${idx + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="ud-card">
                <h3>Personal Information</h3>
                <form onSubmit={handleSave}>
                    <div className="ud-form-grid">
                        <div className="ud-field">
                            <label>Display Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="ud-field">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                            />
                        </div>
                        <div className="ud-field">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                placeholder="+234 800 000 0000"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                        <div className="ud-field">
                            <label>Email</label>
                            <input
                                type="email"
                                value={user?.email || ""}
                                disabled
                                style={{ opacity: 0.5, cursor: 'not-allowed' }}
                            />
                        </div>
                        <div className="ud-field full">
                            <label>Bio</label>
                            <textarea
                                placeholder="Tell us about yourself..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows="4"
                            />
                        </div>
                    </div>
                    <div className="ud-btn-row">
                        <button type="submit" className="ud-btn-primary" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="ud-card" style={{ marginTop: '2rem' }}>
                <h3>Security Settings</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>If you registered with Google, you cannot set a custom password here.</p>
                <form onSubmit={handlePasswordChange}>
                    <div className="ud-form-grid">
                        <div className="ud-field">
                            <label>New Password</label>
                            <input
                                type="password"
                                placeholder="Enter at least 6 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="ud-btn-row" style={{ marginTop: '1rem' }}>
                        <button 
                            type="submit" 
                            className="ud-btn-primary" 
                            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none' }} 
                            disabled={loading || !newPassword}
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
