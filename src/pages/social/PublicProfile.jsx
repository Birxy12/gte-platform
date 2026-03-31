import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { socialService } from "../../services/socialService";
import { ARMY_RANKS, getArmyRank } from "../../config/armyRanks";
import { Shield, MapPin, Calendar, Users, Video, MessageCircle, ArrowLeft } from "lucide-react";
import "./PublicProfile.css";

export default function PublicProfile() {
    const { uid } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [reels, setReels] = useState([]);
    const [stats, setStats] = useState({ friends: 0, following: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDossier = async () => {
            try {
                // 1. Fetch User Profile
                const userSnap = await getDoc(doc(db, "users", uid));
                if (!userSnap.exists()) {
                    setLoading(false);
                    return;
                }
                const userData = userSnap.data();
                setProfile(userData);

                // 2. Fetch Social Stats
                const friends = await socialService.getFriends(uid);
                const following = await socialService.getFollowing(uid);
                setStats({ friends: friends.length, following: following.length });

                // 3. Fetch Reels
                const reelsQ = query(collection(db, "reels"), where("userId", "==", uid));
                const reelsSnap = await getDocs(reelsQ);
                setReels(reelsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

                // 4. Calculate Rank
                const hasBio = !!(userData.bio && userData.bio.length > 5);
                const armyInfo = getArmyRank(friends.length, reelsSnap.size, hasBio);
                setProfile(prev => ({ ...prev, armyInfo }));

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchDossier();
    }, [uid]);

    if (loading) return <div className="dossier-loading">Retrieving Personnel File...</div>;
    if (!profile) return <div className="dossier-error">User Not Found in Database.</div>;

    return (
        <div className="dossier-page">
            <div className="dossier-container">
                <button className="dossier-back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} /> Back to Operations
                </button>

                <div className="dossier-header">
                    <div className="dossier-avatar-wrapper">
                        <img 
                            src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName || profile.username}&background=0f172a&color=eab308&size=256`} 
                            alt="Profile" 
                            className="dossier-avatar"
                        />
                        <div className="dossier-rank-badge">
                            <Shield size={20} />
                            <span>{profile.armyInfo?.rankName}</span>
                        </div>
                    </div>

                    <div className="dossier-main-info">
                        <h1>{profile.displayName || profile.username || "Unknown Officer"}</h1>
                        <p className="dossier-tagline">{profile.occupation || "Active Duty Member"}</p>
                        
                        <div className="dossier-meta-grid">
                            <div className="dossier-meta-item">
                                <MapPin size={16} /> <span>{profile.location || "Undisclosed Location"}</span>
                            </div>
                            <div className="dossier-meta-item">
                                <Calendar size={16} /> <span>Joined {profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : 'Recently'}</span>
                            </div>
                        </div>

                        <div className="dossier-stats-strip">
                            <div className="stat-unit">
                                <strong>{stats.friends}</strong>
                                <span>Allies</span>
                            </div>
                            <div className="stat-unit">
                                <strong>{reels.length}</strong>
                                <span>Deployments</span>
                            </div>
                            <div className="stat-unit">
                                <strong>{stats.following}</strong>
                                <span>Intelligence</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dossier-body">
                    <div className="dossier-section">
                        <h3>Personnel Briefing (Bio)</h3>
                        <p className="dossier-bio">
                            {profile.bio || "No intelligence provided for this personnel file."}
                        </p>
                    </div>

                    <div className="dossier-section">
                        <h3>Mission Gallery (Reels)</h3>
                        <div className="dossier-reels-grid">
                            {reels.length === 0 ? (
                                <div className="no-deployments">No active deployments found.</div>
                            ) : (
                                reels.map(reel => (
                                    <div key={reel.id} className="dossier-reel-card" onClick={() => navigate(`/reels?id=${reel.id}`)}>
                                        <video src={reel.videoUrl} />
                                        <div className="reel-card-overlay">
                                            <Video size={20} />
                                            <span>{reel.likes?.length || 0} Salutes</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="dossier-actions">
                    <button className="dossier-btn-primary" onClick={() => navigate('/chat')}>
                        <MessageCircle size={18} /> Open Direct Comms
                    </button>
                    <button className="dossier-btn-secondary" onClick={() => socialService.sendFriendRequest(uid)}>
                        Request Alliance
                    </button>
                </div>
            </div>
        </div>
    );
}
