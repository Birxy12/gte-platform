import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { auth, db } from "../../../config/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { StatusFeed } from "../../../components/status/StatusSystem";
import { progressService } from "../../../services/progressService";
import CertificateModal from "./CertificateModal";
import { Award, FileText, Zap, Coins, Shield, Star, Upload, X, ChevronRight, Menu } from "lucide-react";
import { reelsService } from "../../../services/reelsService";
import { socialService } from "../../../services/socialService";
import { enrollmentService } from "../../../services/enrollmentService";
import { courseService } from "../../../services/courseService";
import { ARMY_RANKS, getArmyRank } from "../../../config/armyRanks";
import TestimonyForm from "../../../components/social/TestimonyForm";
import { mailService } from "../../../services/mailService";
import "./UserDashboard.css";

export default function UserDashboard() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') return window.innerWidth < 1024;
        return false;
    });

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarCollapsed(true);
            } else {
                setSidebarCollapsed(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [profile, setProfile] = useState(null);
    const [postCount, setPostCount] = useState(0);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [selectedCert, setSelectedCert] = useState(null);
    const [purchasing, setPurchasing] = useState(false);
    
    // Level Tasks Stats
    const [friendsCount, setFriendsCount] = useState(0);
    const [reelsCount, setReelsCount] = useState(0);
    const [referralCount, setReferralCount] = useState(0);
    
    // Reel Upload State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [reelFile, setReelFile] = useState(null);
    const [reelDescription, setReelDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const [claimingBonus, setClaimingBonus] = useState(false);
    const [dailyBonusAmount, setDailyBonusAmount] = useState(50);
    const [lastClaimDate, setLastClaimDate] = useState(null);

    useEffect(() => {
        if (!user) return;
        const loadProfile = async () => {
            try {
                const docRef = doc(db, "users", user.uid);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setProfile(data);
                    if (data.lastBonusClaimAt) {
                        setLastClaimDate(data.lastBonusClaimAt.toDate());
                    }

                    // Check for low coins and trigger reminder email
                    const coins = data.coins || 0;
                    if (coins < 20) {
                        const lastReminder = data.lastLowCoinEmailAt?.toDate();
                        const now = new Date();
                        // Send at most once every 7 days
                        if (!lastReminder || (now - lastReminder) > 7 * 24 * 60 * 60 * 1000) {
                            await mailService.sendEmail(user.uid, "low_balance_reminder", {
                                currentBalance: coins
                            });
                            await updateDoc(docRef, {
                                lastLowCoinEmailAt: serverTimestamp()
                            });
                        }
                    }
                }
                
                // Fetch daily bonus amount from settings
                const settingsRef = doc(db, "settings", "global");
                const settingsSnap = await getDoc(settingsRef);
                if (settingsSnap.exists()) {
                    setDailyBonusAmount(settingsSnap.data().dailyBonusAmount || 50);
                }
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

                const referralQuery = query(collection(db, "users"), where("referredBy", "==", user.uid));
                const referralSnap = await getDocs(referralQuery);
                setReferralCount(referralSnap.size);
            } catch (e) { console.error(e); }
        };
        const loadEnrollments = async () => {
            try {
                const enrData = await enrollmentService.getEnrolledCourses(user.uid);
                // Fetch course details for each enrollment
                const fullCourses = await Promise.all(enrData.map(async (enr) => {
                    const course = await courseService.getCourseById(enr.courseId);
                    return { ...enr, ...course };
                }));
                setEnrolledCourses(fullCourses);
            } catch (e) { console.error("Error loading enrollments:", e); }
        };
        loadProfile();
        loadPostCount();
        loadProgress();
        loadStats();
        loadEnrollments();
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

    const handleClaimBonus = async () => {
        if (!user || claimingBonus) return;
        
        // Final check: Is it really 24h?
        const now = new Date();
        if (lastClaimDate && (now - lastClaimDate) < 24 * 60 * 60 * 1000) {
            alert("Reward not ready yet, operative. Check back later.");
            return;
        }

        setClaimingBonus(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                bonusWallet: increment(dailyBonusAmount),
                lastBonusClaimAt: serverTimestamp()
            });
            
            setProfile(prev => ({
                ...prev,
                bonusWallet: (prev?.bonusWallet || 0) + dailyBonusAmount
            }));
            setLastClaimDate(new Date());
            alert(`🎖️ Daily bonus claimed! ${dailyBonusAmount} coins added to your Bonus Wallet.`);
        } catch (err) {
            console.error("Error claiming daily bonus:", err);
            alert("Failed to secure daily bonus. Signal interference detected.");
        } finally {
            setClaimingBonus(false);
        }
    };

    const getBonusStatus = () => {
        if (!lastClaimDate) return { ready: true, text: "Ready to Claim" };
        const now = new Date();
        const diff = now - lastClaimDate;
        const cooldown = 24 * 60 * 60 * 1000;
        if (diff >= cooldown) return { ready: true, text: "Ready to Claim" };
        
        const remaining = cooldown - diff;
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        return { ready: false, text: `${hours}h ${mins}m left` };
    };

    const [boosting, setBoosting] = useState(false);
    const handleBoostProgress = async () => {
        if (coins < 3) {
            alert("Not enough coins! You need 3 coins to boost your progress.");
            return;
        }
        setBoosting(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                coins: increment(-3),
                progressBoost: increment(2)
            });
            setProfile(prev => ({ 
                ...prev, 
                coins: prev.coins - 3, 
                progressBoost: (prev.progressBoost || 0) + 2 
            }));
            alert("🚀 Rank Progress Boosted by 2%!");
        } catch (err) {
            console.error("Error boosting progress:", err);
            alert("Failed to boost progress. Please try again.");
        } finally {
            setBoosting(false);
        }
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
        <div className={`user-dash ${sidebarCollapsed ? 'sidebar-closed' : ''}`}>
            {/* Mobile Header */}
            <div className="ud-mobile-header">
                <div className="ud-mobile-brand">
                    <span>GTE</span> Portal
                </div>
                <button className="ud-menu-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                    <Menu size={24} />
                </button>
            </div>

            {/* Overlay */}
            {!sidebarCollapsed && (
                <div className="ud-overlay" onClick={() => setSidebarCollapsed(true)} />
            )}

            {/* Sidebar */}
            <aside className={`ud-sidebar ${sidebarCollapsed ? 'closed' : 'open'}`}>
                <button className="ud-sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                    <ChevronRight size={16} style={{ transform: sidebarCollapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "0.2s" }} />
                </button>
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
                    <Link to="/reels/create" className="ud-nav-item">
                        <span className="ud-nav-icon">🎥</span> Deploy Reel
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
                                <div className="flex flex-col items-end gap-2">
                                    <div className="ud-wallet-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            className="ud-btn-purchase army-btn"
                                            onClick={() => setShowUploadModal(true)}
                                            style={{ padding: '0.5rem 1rem' }}
                                        >
                                            <Upload size={18} /> Deploy Reel
                                        </button>
                                        <button 
                                            className="ud-btn-purchase"
                                            onClick={handlePurchaseCoins}
                                            disabled={purchasing}
                                            style={{ padding: '0.5rem 1rem' }}
                                        >
                                            {purchasing ? "Processing..." : `Vault: ${coins} 🪙`}
                                        </button>
                                    </div>
                                    <div 
                                        className="bonus-wallet-pill"
                                        style={{ 
                                            background: 'rgba(16, 185, 129, 0.1)', 
                                            border: '1px solid rgba(16, 185, 129, 0.2)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.8rem',
                                            color: '#10b981'
                                        }}
                                    >
                                        <Star size={14} fill="#10b981" />
                                        <span>Bonus: {profile?.bonusWallet || 0} 🪙</span>
                                        <button 
                                            onClick={handleClaimBonus}
                                            disabled={!getBonusStatus().ready || claimingBonus}
                                            style={{
                                                background: getBonusStatus().ready ? '#10b981' : 'transparent',
                                                border: 'none',
                                                color: getBonusStatus().ready ? 'white' : '#64748b',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                marginLeft: '4px',
                                                cursor: getBonusStatus().ready ? 'pointer' : 'default',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {claimingBonus ? "..." : getBonusStatus().text}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="ud-progress-section army-mission-box">
                                <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <h4 className="army-mission-title" style={{ margin: 0 }}>Active Mission Objectives</h4>
                                    <button 
                                        className="army-btn" 
                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: 'white', border: 'none' }}
                                        onClick={handleBoostProgress}
                                        disabled={boosting}
                                    >
                                        {boosting ? "Boosting..." : "🚀 Boost +2% (Cost: 3 Coins)"}
                                    </button>
                                </div>
                                
                                <div className="army-task-item">
                                    <div className="army-task-label">Recruit {nextLevelReq.friends} Friends ({friendsCount}/{nextLevelReq.friends})</div>
                                    <div className="army-progress-bar"><div className="army-progress-fill" style={{ width: `${Math.min(friendProgress + (profile?.progressBoost || 0), 100)}%` }}></div></div>
                                </div>

                                <div className="army-task-item">
                                    <div className="army-task-label">Deploy {nextLevelReq.reels} Reels ({reelsCount}/{nextLevelReq.reels})</div>
                                    <div className="army-progress-bar"><div className="army-progress-fill" style={{ width: `${Math.min(reelProgress + (profile?.progressBoost || 0), 100)}%` }}></div></div>
                                </div>

                                <div className="army-task-item">
                                    <div className="army-task-label">Intelligence Report: Complete Bio ({hasBio ? `${Math.min(100, 100 + (profile?.progressBoost || 0))}%` : `${Math.min(0 + (profile?.progressBoost || 0), 100)}%`})</div>
                                    <div className="army-progress-bar"><div className="army-progress-fill" style={{ width: `${Math.min(bioProgress + (profile?.progressBoost || 0), 100)}%` }}></div></div>
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
                                <p className="ud-stat-value">{enrolledCourses.length}</p>
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
                            <div className="ud-stat">
                                <div className="ud-stat-icon">🤝</div>
                                <p className="ud-stat-value">{referralCount}</p>
                                <p className="ud-stat-label">Referrals</p>
                            </div>
                        </div>

                        {/* Enrolled Courses / Mission Logistics */}
                        <div className="ud-card">
                            <div className="ud-card-header-flex">
                                <h3>Mission Logistics: Active Courses</h3>
                                <Link to="/dashboard/enrolled" className="ud-view-all">Manage All →</Link>
                            </div>
                            <div className="ud-enrolled-grid">
                                {enrolledCourses.length > 0 ? (
                                    enrolledCourses.slice(0, 3).map(course => (
                                        <Link to={`/courses/${course.courseId}`} key={course.id} className="ud-enrolled-item">
                                            <div className="ud-enrolled-icon">📚</div>
                                            <div className="ud-enrolled-info">
                                                <h4>{course.title || "Loading..."}</h4>
                                                <div className="ud-enrolled-meta">
                                                    <div className="ud-mini-progress">
                                                        <div className="ud-mini-fill" style={{ width: `${course.progress || 0}%` }}></div>
                                                    </div>
                                                    <span>{course.progress || 0}% Ready</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="ud-enrolled-arrow" />
                                        </Link>
                                    ))
                                ) : (
                                    <div className="ud-empty-state">
                                        <p>No active missions found. Visit the academy to begin.</p>
                                        <Link to="/courses" className="ud-btn-secondary">Explore Courses</Link>
                                    </div>
                                )}
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
                    allCompleted={completedCourses}
                    onClose={() => setSelectedCert(null)} 
                />
            )}
        </div>
    );
}
