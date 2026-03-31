import { useState, useEffect } from "react";
import { collection, getDocs, query, where, documentId } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthProvider";
import { socialService } from "../../services/socialService";
import { chatService } from "../../services/chatService";
import { useNavigate } from "react-router-dom";
import ReportUserModal from "../../components/common/ReportUserModal";
import UserProfileModal from "../../components/social/UserProfileModal";
import ChatPopup from "../../components/chat/ChatPopup";
import "./DiscoverUsers.css";

export default function DiscoverUsers() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [friends, setFriends] = useState([]);
    const [following, setFollowing] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const [reportingUser, setReportingUser] = useState(null);
    const [viewingProfile, setViewingProfile] = useState(null);
    const [activeChatUser, setActiveChatUser] = useState(null);

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all users (excluding self and admins if desired, but let's just exclude self)
            const q = query(collection(db, "users"), where("uid", "!=", user.uid));
            const snapshot = await getDocs(q);
            const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Exclude banned users or admins if needed, for now just show all
            setUsers(allUsers);

            // Fetch relations
            const myFriends = await socialService.getFriends(user.uid);
            const myFollowing = await socialService.getFollowing(user.uid);
            const myRequests = await socialService.getIncomingRequests(user.uid);

            setFriends(myFriends);
            setFollowing(myFollowing);
            setIncomingRequests(myRequests);

        } catch (err) {
            console.error("Error fetching discover data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (targetId) => {
        try {
            if (following.includes(targetId)) {
                await socialService.unfollowUser(user.uid, targetId);
                setFollowing(prev => prev.filter(id => id !== targetId));
            } else {
                await socialService.followUser(user.uid, targetId);
                setFollowing(prev => [...prev, targetId]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddFriend = async (targetId) => {
        try {
            await socialService.sendFriendRequest(user.uid, targetId);
            alert("Friend request sent!");
        } catch (err) {
            console.error(err);
        }
    };

    const handleAcceptRequest = async (senderId) => {
        try {
            await socialService.acceptFriendRequest(senderId, user.uid);
            setIncomingRequests(prev => prev.filter(req => req.senderId !== senderId));
            setFriends(prev => [...prev, senderId]);
            alert("Friend request accepted! 🎉");
        } catch (err) {
            console.error("Failed to accept request:", err);
        }
    };

    const handleMessage = (targetUser) => {
        // Instead of navigating, open the popup
        setActiveChatUser(targetUser);
    };

    const filteredUsers = users.filter(u =>
        (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="discover-page">
            <div className="discover-header">
                <div className="discover-header-content">
                    <h1>Discover <span>Community</span></h1>
                    <p>Find other learners, connect, and grow together.</p>

                    <div className="discover-search">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="search-btn">🔍</button>
                    </div>
                </div>
            </div>

            <div className="discover-container">
                {loading ? (
                    <div className="loading-state">Loading community...</div>
                ) : (
                    <>
                        {incomingRequests.length > 0 && (
                            <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-6 mb-8 shadow-xl">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-blue-400">👋</span> Pending Friend Requests ({incomingRequests.length})
                                </h2>
                                <div className="flex flex-col gap-3">
                                    {incomingRequests.map(req => {
                                        const sender = users.find(u => u.uid === req.senderId) || { displayName: "Someone" };
                                        return (
                                            <div key={req.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={sender.photoURL || `https://ui-avatars.com/api/?name=${sender.displayName || 'U'}&background=random`} 
                                                        alt="User"
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-white">{sender.displayName || "A user"}</p>
                                                        <p className="text-xs text-slate-400">wants to be friends</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleAcceptRequest(req.senderId)}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Accept
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="users-grid">
                        {filteredUsers.map(u => (
                            <div key={u.id} className="user-discover-card">
                                <div className="card-top" style={{ cursor: 'pointer' }} onClick={() => setViewingProfile(u)}>
                                    <div className="user-avatar">
                                        <img
                                            src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName || u.username || u.email}&background=random`}
                                            alt={u.displayName}
                                        />
                                    </div>
                                    <div className="user-info">
                                        <h3>{u.displayName || u.username || u.email.split('@')[0]}</h3>
                                        <p>{u.role || "Student"}</p>
                                    </div>
                                    <button
                                        className="report-btn"
                                        onClick={(e) => { e.stopPropagation(); setReportingUser(u); }}
                                        title="Report User"
                                    >
                                        ⚠️
                                    </button>
                                </div>

                                <div className="card-actions">
                                    <button
                                        className={`btn-action ${following.includes(u.uid) ? 'following' : ''}`}
                                        onClick={() => handleFollow(u.uid)}
                                    >
                                        {following.includes(u.uid) ? "✓ Following" : "+ Follow"}
                                    </button>

                                    {!friends.includes(u.uid) && (
                                        <button className="btn-action friend" onClick={() => handleAddFriend(u.uid)}>
                                            👋 Add Friend
                                        </button>
                                    )}

                                    <button className="btn-action message" onClick={() => handleMessage(u)}>
                                        💬 Message
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filteredUsers.length === 0 && (
                            <div className="empty-state">
                                No users found matching your search.
                            </div>
                        )}
                    </div>
                </>
                )}
            </div>

            {reportingUser && (
                <ReportUserModal
                    reportedUser={reportingUser}
                    onClose={() => setReportingUser(null)}
                />
            )}

            {viewingProfile && (
                <UserProfileModal
                    profileUser={viewingProfile}
                    onClose={() => setViewingProfile(null)}
                    onMessage={(u) => setActiveChatUser(u)}
                    onFollow={handleFollow}
                    onAddFriend={handleAddFriend}
                    isFollowing={following.includes(viewingProfile.uid)}
                    isFriend={friends.includes(viewingProfile.uid)}
                />
            )}

            {activeChatUser && (
                <ChatPopup
                    targetUser={activeChatUser}
                    onClose={() => setActiveChatUser(null)}
                />
            )}
        </div>
    );
}
