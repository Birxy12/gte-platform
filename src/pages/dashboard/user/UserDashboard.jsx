import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { auth, db } from "../../../config/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { StatusFeed } from "../../../components/status/StatusSystem";
import "./UserDashboard.css";

export default function UserDashboard() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [postCount, setPostCount] = useState(0);

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
        loadProfile();
        loadPostCount();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path ? "ud-nav-item active" : "ud-nav-item";
    const initials = profile?.username?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "U";
    const isOverview = location.pathname === "/dashboard";

    return (
        <div className="user-dash">
            {/* Sidebar */}
            <aside className="ud-sidebar">
                <Link to="/home" className="ud-brand"><span>GTE</span> Portal</Link>
                <nav className="ud-nav">
                    <Link to="/dashboard" className={isActive("/dashboard")}>
                        <span className="ud-nav-icon">🏠</span> Overview
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
                    <Link to="/dashboard/progress" className={isActive("/dashboard/progress")}>
                        <span className="ud-nav-icon">📊</span> Progress
                    </Link>
                    <Link to="/dashboard/quiz" className={isActive("/dashboard/quiz")}>
                        <span className="ud-nav-icon">📝</span> Take Quiz
                    </Link>
                    <Link to="/dashboard/certificate" className={isActive("/dashboard/certificate")}>
                        <span className="ud-nav-icon">🏅</span> Certificates
                    </Link>
                    <Link to="/chat" className="ud-nav-item">
                        <span className="ud-nav-icon">💬</span> Chat
                    </Link>
                    <Link to="/courses" className="ud-nav-item">
                        <span className="ud-nav-icon">📚</span> Courses
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
                            <h1>Welcome back, {profile?.username || user?.email?.split("@")[0] || "User"} 👋</h1>
                            <p>Here's what's happening with your account</p>
                        </div>

                        {/* Stats */}
                        <div className="ud-stats">
                            <div className="ud-stat">
                                <div className="ud-stat-icon">📝</div>
                                <p className="ud-stat-value">{postCount}</p>
                                <p className="ud-stat-label">Blog Posts</p>
                            </div>
                            <div className="ud-stat">
                                <div className="ud-stat-icon">📚</div>
                                <p className="ud-stat-value">0</p>
                                <p className="ud-stat-label">Enrolled Courses</p>
                            </div>
                            <div className="ud-stat">
                                <div className="ud-stat-icon">🏆</div>
                                <p className="ud-stat-value">0</p>
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
        </div>
    );
}
