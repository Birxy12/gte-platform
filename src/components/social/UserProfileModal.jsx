import { useState, useEffect } from "react";
import { X, MapPin, Calendar, Link as LinkIcon, Briefcase, Users } from "lucide-react";
import { socialService } from "../../services/socialService";
import "./UserProfileModal.css";

export default function UserProfileModal({ profileUser, onClose, onMessage, onFollow, onAddFriend, isFollowing, isFriend }) {
    const [friendsCount, setFriendsCount] = useState(0);

    useEffect(() => {
        if (profileUser) {
            socialService.getFriends(profileUser.uid || profileUser.id)
                .then(friends => setFriendsCount(friends.length))
                .catch(err => console.error("Could not load friends", err));
        }
    }, [profileUser]);

    if (!profileUser) return null;

    const initials = profileUser.displayName ? profileUser.displayName.substring(0, 2).toUpperCase() : "U";
    const joinDate = profileUser.createdAt?.toDate
        ? profileUser.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : "Recently";

    return (
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal-content" onClick={e => e.stopPropagation()}>

                {/* Header Banner */}
                <div className="profile-banner">
                    <button className="profile-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                    <div className="profile-avatar-container">
                        <img
                            src={profileUser.photoURL || `https://ui-avatars.com/api/?name=${profileUser.displayName || profileUser.email}&background=0D8ABC&color=fff&size=256`}
                            alt={profileUser.displayName || "User"}
                            className="profile-avatar-large"
                        />
                    </div>
                </div>

                {/* Body Details */}
                <div className="profile-body">
                    <div className="profile-main-info">
                        <h2>{profileUser.displayName || profileUser.username || "Anonymous Learner"}</h2>
                        <p className="profile-email">{profileUser.email}</p>
                        <span className={`profile-role role-${profileUser.role || 'user'}`}>
                            {profileUser.role || 'Student'}
                        </span>
                    </div>

                    <div className="profile-bio">
                        <p>{profileUser.bio || "This user hasn't added a bio yet, but they are eager to learn!"}</p>
                    </div>

                    <div className="profile-metadata">
                        {profileUser.location && (
                            <div className="meta-item">
                                <MapPin size={16} />
                                <span>{profileUser.location}</span>
                            </div>
                        )}
                        {profileUser.portfolio && (
                            <div className="meta-item">
                                <LinkIcon size={16} />
                                <a href={profileUser.portfolio} target="_blank" rel="noreferrer">Portfolio</a>
                            </div>
                        )}
                        {profileUser.occupation && (
                            <div className="meta-item">
                                <Briefcase size={16} />
                                <span>{profileUser.occupation}</span>
                            </div>
                        )}
                        <div className="meta-item">
                            <Users size={16} />
                            <span>{friendsCount} Friend{friendsCount !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="meta-item">
                            <Calendar size={16} />
                            <span>Joined {joinDate}</span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="profile-action-bar">
                        <button
                            className="action-btn-primary w-full"
                            onClick={() => {
                                onMessage(profileUser);
                                onClose();
                            }}
                        >
                            💬 Direct Message
                        </button>

                        <div className="flex gap-2 mt-2">
                            {onFollow && (
                                <button
                                    className={`action-btn-secondary flex-1 ${isFollowing ? 'active' : ''}`}
                                    onClick={() => onFollow(profileUser.uid || profileUser.id)}
                                >
                                    {isFollowing ? "✓ Following" : "+ Follow"}
                                </button>
                            )}

                            {onAddFriend && !isFriend && (
                                <button
                                    className="action-btn-secondary flex-1 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                                    onClick={() => onAddFriend(profileUser.uid || profileUser.id)}
                                >
                                    👋 Add Friend
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
