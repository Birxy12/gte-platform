import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { auth, db } from "../../../config/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment } from "firebase/firestore";
import { StatusFeed } from "../../../components/status/StatusSystem";
import { progressService } from "../../../services/progressService";
import CertificateModal from "./CertificateModal";
import { Award, FileText, Zap, Coins, Shield, Star, Award as MedalIcon, Upload, X } from "lucide-react";
import { reelsService } from "../../../services/reelsService";
import { socialService } from "../../../services/socialService";
import { ARMY_RANKS, getArmyRank } from "../../../config/armyRanks";
import TestimonyForm from "../../../components/social/TestimonyForm";
import "./UserDashboard.css";

export default function UserDashboard() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [postCount, setPostCount] = useState(0);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [selectedCert, setSelectedCert] = useState(null);
    const [purchasing, setPurchasing] = useState(false);
    
    // Level Tasks Stats
    const [friendsCount, setFriendsCount] = useState(0);
    const [reelsCount, setReelsCount] = useState(0);
    
    // Reel Upload State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [reelFile, setReelFile] = useState(null);
    const [reelDescription, setReelDescription] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user) return;
        const loadProfile = async () => {
            try {
                const docRef = doc(db, "users", user.uid);
                const snap = await getDoc(docRef);
                if (snap.exists()) setProfile(snap.data());
            } catch (e) { console.error(e); }
        };
        const loadPostCount = async () => {
            try {
                const q = query(collection(db, "posts"), where("authorEmail", "==", user.email));
                const snap = await getDocs(q);
                setPostCount(snap.size);
            } catch (e) { console.error(e); }
        };
        const loadProgress = async () => {
            try {
                const completed = await progressService.getUserCompletedCourses(user.uid);
                setCompletedCourses(completed);
            } catch (e) { console.error(e); }
        };
        const loadStats = async () => {
            try {
                const friends = await socialService.getFriends(user.uid);
                setFriendsCount(friends.length);
                
                const reelsQuery = query(collection(db, "reels"), where("userId", "==", user.uid));
                const reelsSnap = await getDocs(reelsQuery);
                setReelsCount(reelsSnap.size);
            } catch (e) { console.error(e); }
        };
        loadProfile();
        loadPostCount();
        loadProgress();
        loadStats();
    }, [user]);

    const handleUploadReel = async (e) => {
        e.preventDefault();
        if (!reelFile || uploading) return;
        setUploading(true);
        try {
            await reelsService.uploadReel(reelFile, reelDescription, user);
            alert("Mission Accomplished! Reel uploaded successfully. 🎖️");
            setShowUploadModal(false);
            setReelFile(null);
            setReelDescription("");
            setReelsCount(prev => prev + 1);
        } catch (err) {
            console.error(err);
            alert("Mission failed. Video size might be too large.");
        } finally {
            setUploading(false);
        }
    };

    const handlePurchaseCoins = async () => {
        if (!user || purchasing) return;
        setPurchasing(true);
        try {
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, {
                coins: increment(100)
            });
            // Optimistic update
            setProfile(prev => ({
                ...prev,
                coins: (prev?.coins || 0) + 100
            }));
            alert("Success! 100 Coins purchased.");
        } catch (err) {
            console.error("Error purchasing coins:", err);
            alert("Failed to purchase coins.");
        } finally {
            setPurchasing(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path ? "ud-nav-item active" : "ud-nav-item";
    const initials = profile?.username?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "U";
    const isOverview = location.pathname === "/dashboard";

    const coins = profile?.coins || 0;
    
    // NEW ARMY RANK LOGIC
    const hasBio = !!(profile?.bio && profile.bio.length > 5);
    const armyInfo = getArmyRank(friendsCount, reelsCount, hasBio);
    
    const currentLevelNum = armyInfo.levelNum;
    const currentRank = armyInfo.rankName;
    const nextLevelReq = armyInfo.nextGoal;

    const friendProgress = Math.min(100, (friendsCount / nextLevelReq.friends) * 100);
    const reelProgress = Math.min(100, (reelsCount / nextLevelReq.reels) * 100);
    const bioProgress = hasBio ? 100 : 0;
    
    const totalProgress = (friendProgress + reelProgress + bioProgress) / 3;

    return (
        <div className="user-dash">
            {/* Sidebar */}
            <aside className="ud-sidebar">
                <Link to="/home" className="ud-brand"><span>GTE</span> Portal</Link>
                <nav className="ud-nav">
                    <Link to="/dashboard" className={isActive("/dashboard")}>
                        <span className="ud-nav-icon">🏠</span> Overview
                    </Link>
                    <Link to="/dashboard/inbox" className={isActive("/dashboard/inbox")}>
                        <span className="ud-nav-icon">📡</span> Comms Center
                    </Link>
                    <Link to="/dashboard/profile" className={isActive("/dashboard/profile")}>
                        <span className="ud-nav-icon">👤</span> Edit Profile
                    </Link>
                    <Link to="/dashboard/create-post" className={isActive("/dashboard/create-post")}>
                        <span className="ud-nav-icon">✍️</span> Write Post
                    </Link>
                    <Link to="/dashboard/my-posts" className={isActive("/dashboard/my-posts")}>
                        <span className="ud-nav-icon">📄</span> My Posts
                    </Link>
                    <Link to="/chat" className="ud-nav-item">
                        <span className="ud-nav-icon">💬</span> Chat
                    </Link>
                    <Link to="/courses" className="ud-nav-item">
                        <span className="ud-nav-icon">📚</span> Courses
                    </Link>
                    <Link to="/dashboard/enrolled" className={isActive("/dashboard/enrolled")}>
                        <span className="ud-nav-icon">🎓</span> Learning Journey
                    </Link>
                    <Link to="/blog" className="ud-nav-item">
                        <span className="ud-nav-icon">📝</span> Blog
                    </Link>
                </nav>
                <button onClick={handleLogout} className="ud-logout">
                    <span className="ud-nav-icon">🚪</span> Sign Out
                </button>
            </aside>

            {/* Main Area */}
            <main className="ud-main">
                {isOverview ? (
                    <>
                        <StatusFeed />
                        <div className="ud-page-header">
                            <div className="ud-header-flex">
                                <div className="ud-welcome">
                                    <h1>Welcome back, {profile?.username || user?.email?.split("@")[0] || "User"} 👋</h1>
                                    <p>Here's what's happening with your account</p>
                                </div>
                                <div className="ud-level-badge army-theme">
                                    <div className="ud-level-icon-wrapper">
                                        <Shield size={24} />
                                    </div>
                                    <div className="ud-level-info">
                                        <div className="ud-level-number">Rank Tier {currentLevelNum}</div>
                                        <div className="ud-level-title">{currentRank}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Army Mission Tracker */}
                        <div className="ud-card ud-gamify-card army-card">
                            <div className="ud-wallet-header">
                                <div className="ud-wallet-info">
                                    <div className="ud-wallet-icon-wrapper army-gold">
                                        <Star size={32} />
                                    </div>
                                    <div className="ud-balance">
                                        <h3 className="army-text-gold">{currentRank}</h3>
                                        <p>Current Military Standing</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        className="ud-btn-purchase army-btn"
                                        onClick={() => setShowUploadModal(true)}
                                    >
                                        <Upload size={18} /> Upload Reel
                                    </button>
                                    <button 
                                        className="ud-btn-purchase"
                                        onClick={handlePurchaseCoins}
                                        disabled={purchasing}
                                    >
                                        {purchasing ? "Processing..." : `Vault: ${coins} Coins`}
                                    </button>
                                </div>
                            </div>

                            <div className="ud-progress-section army-mission-box">
                                <h4 className="army-mission-title">Active Mission Objectives</h4>
                                
                                <div className="army-task-item">
                                    <div className="army-task-label">Recruit {nextLevelReq.friends} Friends ({friendsCount}/{nextLevelReq.friends})</div>
                                    <div className="army-progress-bar"><div className="army-progress-fill" style={{ width: `${friendProgress}%` }}></div></div>
                                </div>

                                <div className="army-task-item">
                                    <div className="army-task-label">Deploy {nextLevelReq.reels} Reels ({reelsCount}/{nextLevelReq.reels})</div>
                                    <div className="army-progress-bar"><div className="army-progress-fill" style={{ width: `${reelProgress}%` }}></div></div>
                                </div>

                                <div className="army-task-item">
                                    <div className="army-task-label">Intelligence Report: Complete Bio ({hasBio ? '100%' : '0%'})</div>
                                    <div className="army-progress-bar"><div className="army-progress-fill" style={{ width: `${bioProgress}%` }}></div></div>
                                </div>
                            </div>
                        </div>

                        {/* Leave a Testimony/Feedback */}
                        <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                            <TestimonyForm />
                        </div>

                        {/* Stats */}
                        <div className="ud-stats">
                            <div className="ud-stat">
                                <div className="ud-stat-icon">📝</div>
                                <p className="ud-stat-value">{postCount}</p>
                                <p className="ud-stat-label">Blog Posts</p>
                            </div>
                            <Link to="/dashboard/enrolled" className="ud-stat" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                                <div className="ud-stat-icon">📚</div>
                                <p className="ud-stat-value">{completedCourses.length}</p>
                                <p className="ud-stat-label">Enrolled Courses</p>
                            </Link>
                            <div className="ud-stat">
                                <div className="ud-stat-icon">🏆</div>
                                <p className="ud-stat-value">{completedCourses.length}</p>
                                <p className="ud-stat-label">Certificates</p>
                            </div>
                            <div className="ud-stat">
                                <div className="ud-stat-icon">💬</div>
                                <p className="ud-stat-value">0</p>
                                <p className="ud-stat-label">Comments</p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="ud-card">
                            <h3>Quick Actions</h3>
                            <div className="ud-activity">
                                <Link to="/dashboard/create-post" className="ud-activity-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <span className="ud-activity-icon">✍️</span>
                                    <div className="ud-activity-text">
                                        <strong>Write a New Blog Post</strong>
                                        <span>Share your knowledge with the community</span>
                                    </div>
                                </Link>
                                <Link to="/dashboard/profile" className="ud-activity-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <span className="ud-activity-icon">👤</span>
                                    <div className="ud-activity-text">
                                        <strong>Complete Your Profile</strong>
                                        <span>Add your name, birthday, and profile picture</span>
                                    </div>
                                </Link>
                                <Link to="/courses" className="ud-activity-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <span className="ud-activity-icon">📚</span>
                                    <div className="ud-activity-text">
                                        <strong>Browse Courses</strong>
                                        <span>Explore expert-led courses and start learning</span>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Certificates Section */}
                        {completedCourses.length > 0 && (
                            <div className="ud-card ud-cert-card">
                                <h3>My Certificates 🎓</h3>
                                <div className="ud-cert-list">
                                    {completedCourses.map(course => (
                                        <div key={course.id} className="ud-cert-item">
                                            <div className="ud-cert-info-main">
                                                <div className="ud-cert-icon-wrapper">
                                                    <Award size={24} />
                                                </div>
                                                <div className="ud-cert-text">
                                                    <h4>{course.courseTitle}</h4>
                                                    <p>Completed on {course.completedAt?.toDate ? course.completedAt.toDate().toLocaleDateString() : 'Recently'}</p>
                                                </div>
                                            </div>
                                            <button 
                                                className="ud-btn-view-cert"
                                                onClick={() => setSelectedCert(course)}
                                            >
                                                <FileText size={16} /> View Certificate
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Profile Card */}
                        <div className="ud-card">
                            <h3>Profile Summary</h3>
                            <div className="ud-avatar-section">
                                <div className="ud-avatar">
                                    {profile?.photoURL ? <img src={profile.photoURL} alt="avatar" /> : initials}
                                </div>
                                <div className="ud-avatar-info">
                                    <h4>{profile?.username || "Not set"}</h4>
                                    <p>{user?.email}</p>
                                    <Link to="/dashboard/profile" className="ud-upload-btn">Edit Profile →</Link>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <Outlet />
                )}
            </main>
            
            {/* Reels Upload Modal */}
            {showUploadModal && (
                <div className="ud-modal-overlay">
                    <div className="ud-modal-content reels-modal">
                        <div className="reels-modal-header">
                            <h2>Deploy New Reel 🎬</h2>
                            <button onClick={() => setShowUploadModal(false)}><X /></button>
                        </div>
                        <form onSubmit={handleUploadReel} className="reels-form">
                            <div className="reels-dropzone" onClick={() => document.getElementById('reel-input').click()}>
                                <Upload size={40} className="mb-2" />
                                <p>{reelFile ? reelFile.name : "Click to select mission footage (MP4/MOV)"}</p>
                                <input 
                                    id="reel-input" 
                                    type="file" 
                                    accept="video/*" 
                                    onChange={(e) => setReelFile(e.target.files[0])} 
                                    style={{ display: 'none' }} 
                                />
                            </div>
                            <div className="ud-field">
                                <label>Description</label>
                                <textarea 
                                    value={reelDescription}
                                    onChange={(e) => setReelDescription(e.target.value)}
                                    placeholder="Brief your squad about this reel..."
                                    required
                                />
                            </div>
                            <button type="submit" className="ud-btn-primary w-full" disabled={uploading}>
                                {uploading ? "Deploying Assets..." : "Begin Deployment"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Certificate Modal Overlay */}
            {selectedCert && (
                <CertificateModal 
                    course={selectedCert} 
                    profile={profile || user} 
                    onClose={() => setSelectedCert(null)} 
                />
            )}
        </div>
    );
}
