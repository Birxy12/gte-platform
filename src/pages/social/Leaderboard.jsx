import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Shield, Award, Star, TrendingUp, Users, Video } from "lucide-react";
import "./Leaderboard.css";

export default function Leaderboard() {
    const [topUsers, setTopUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Fetch top 20 users by coins as a proxy for activity
                const q = query(collection(db, "users"), orderBy("coins", "desc"), limit(20));
                const snap = await getDocs(q);
                const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setTopUsers(users);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return <div className="leaderboard-loading">Scanning Global Operations...</div>;

    const podium = topUsers.slice(0, 3);
    const others = topUsers.slice(3);

    return (
        <div className="leaderboard-page">
            <div className="leaderboard-container">
                <div className="leaderboard-header">
                    <h1>Global Command Center</h1>
                    <p>Recognizing our most decorated high-ranking personnel</p>
                </div>

                {/* Podium Section */}
                <div className="leaderboard-podium">
                    {/* Rank 2 (Left) */}
                    {podium[1] && (
                        <div className="podium-item silver" onClick={() => navigate(`/profile/${podium[1].id}`)}>
                            <div className="podium-avatar-wrapper">
                                <img src={podium[1].photoURL || `https://ui-avatars.com/api/?name=${podium[1].displayName}&background=334155&color=fff`} alt="Silver" />
                                <div className="podium-badge">2</div>
                            </div>
                            <div className="podium-info">
                                <h3>{podium[1].displayName || podium[1].username || "Soldier"}</h3>
                                <span className="podium-rank">Sergeant</span>
                                <div className="podium-score"><Star size={14} /> {podium[1].coins} XP</div>
                            </div>
                        </div>
                    )}

                    {/* Rank 1 (Center) */}
                    {podium[0] && (
                        <div className="podium-item gold" onClick={() => navigate(`/profile/${podium[0].id}`)}>
                            <div className="podium-avatar-wrapper">
                                <img src={podium[0].photoURL || `https://ui-avatars.com/api/?name=${podium[0].displayName}&background=eab308&color=0f172a`} alt="Gold" />
                                <div className="podium-badge"><Award size={24} /></div>
                            </div>
                            <div className="podium-info">
                                <h2>{podium[0].displayName || podium[0].username || "Elite Soldier"}</h2>
                                <span className="podium-rank uppercase font-black text-yellow-500">Platform Captain</span>
                                <div className="podium-score big"><TrendingUp size={20} /> {podium[0].coins} Total XP</div>
                            </div>
                        </div>
                    )}

                    {/* Rank 3 (Right) */}
                    {podium[2] && (
                        <div className="podium-item bronze" onClick={() => navigate(`/profile/${podium[2].id}`)}>
                            <div className="podium-avatar-wrapper">
                                <img src={podium[2].photoURL || `https://ui-avatars.com/api/?name=${podium[2].displayName}&background=7c2d12&color=fff`} alt="Bronze" />
                                <div className="podium-badge">3</div>
                            </div>
                            <div className="podium-info">
                                <h3>{podium[2].displayName || podium[2].username || "Soldier"}</h3>
                                <span className="podium-rank">Corporal</span>
                                <div className="podium-score"><Star size={14} /> {podium[2].coins} XP</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* List Section */}
                <div className="leaderboard-list">
                    <div className="list-header">
                        <span>Rank</span>
                        <span>Personnel</span>
                        <span>Standing</span>
                        <span>Intelligence (XP)</span>
                    </div>
                    {others.map((user, index) => (
                        <div key={user.id} className="list-item" onClick={() => navigate(`/profile/${user.id}`)}>
                            <div className="item-rank">{index + 4}</div>
                            <div className="item-user">
                                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=1e293b&color=94a3b8`} alt="Avatar" />
                                <div>
                                    <div className="item-name">{user.displayName || user.username || "Private"}</div>
                                    <div className="item-level">Training Status: Level {Math.floor((user.coins || 0) / 100) + 1}</div>
                                </div>
                            </div>
                            <div className="item-status">
                                <Shield size={16} /> <span>Active Duty</span>
                            </div>
                            <div className="item-score">{user.coins}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
