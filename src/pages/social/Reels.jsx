import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Music, Download, Trash2, X, Send, Plus, Repeat, Sparkles, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reelsService } from '../../services/reelsService';
import { useAuth } from '../../context/AuthProvider';
import CreateReelModal from '../../components/social/CreateReelModal';
import ReelPrompt from '../../components/social/ReelPrompt';
import Avatar from '../../components/common/Avatar';
import '../../styles/reels.css';

/**
 * Enhanced TikTok-style Reel Component
 */
function Reel({ data, isActive, onDeleted, onRepost }) {
    const { user } = useAuth();
    const videoRef = useRef(null);
    
    // UI States
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(data.likes?.includes(user?.uid));
    const [likesCount, setLikesCount] = useState(data.likes?.length || 0);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState(data.comments || []);
    
    // Action States
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isReposting, setIsReposting] = useState(false);
    
    // Animation States
    const [showHeartPop, setShowHeartPop] = useState(false);
    const [videoProgress, setVideoProgress] = useState(0);
    const lastTap = useRef(0);

    useEffect(() => {
        setIsLiked(data.likes?.includes(user?.uid));
        setLikesCount(data.likes?.length || 0);
        setComments(data.comments || []);
    }, [data, user]);

    // Autoplay / Pause logic
    useEffect(() => {
        if (!videoRef.current) return;
        if (isActive) {
            videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(e => console.log('Autoplay prevented:', e));
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, [isActive]);

    const handleVideoClick = (e) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        
        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            handleDoubleTap(e);
        } else {
            togglePlay();
        }
        lastTap.current = now;
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleDoubleTap = (e) => {
        if (!isLiked) {
            toggleLike(e);
        }
        setShowHeartPop(true);
        setTimeout(() => setShowHeartPop(false), 800);
    };

    const toggleLike = async (e) => {
        if (e) e.stopPropagation();
        if (!user) return alert("Please log in to salute this mission!");
        if (isLiking) return;

        setIsLiking(true);
        try {
            await reelsService.toggleLike(data.id, user.uid);
            setIsLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLiking(false);
        }
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setVideoProgress(progress);
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;
        try {
            const comment = await reelsService.addComment(data.id, user, newComment);
            setComments(prev => [...prev, comment]);
            setNewComment("");
        } catch (e) { console.error(e); }
    };

    const handleDelete = async () => {
        if (!window.confirm("Abort this mission? This reel will be permanently deleted.")) return;
        setIsDeleting(true);
        try {
            await reelsService.deleteReel(data.id, data.storagePath);
            onDeleted(data.id);
        } catch (e) {
            console.error(e);
            alert("Deletion failed.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(data.videoUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `GTE_Reel_${data.id}.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            window.open(data.videoUrl, '_blank');
        }
    };

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/reels?id=${data.id}`;
        navigator.clipboard.writeText(shareUrl);
        alert("Mission intelligence copied to clipboard! 📋");
        reelsService.incrementShare(data.id);
    };

    const handleRepost = async () => {
        if (!user) return;
        if (isReposting) return;
        if (!window.confirm("Broadcast this intel to your network?")) return;

        setIsReposting(true);
        try {
            await reelsService.uploadReel(null, `Reposted intel from @${data.authorName}`, user, {
                isRepost: true,
                originalVideoUrl: data.videoUrl,
                originalReelId: data.id,
                music: data.music,
                filter: data.filter,
                textOverlays: data.textOverlays,
                stickers: data.stickers
            });
            alert("Intel successfully broadcasted!");
            onRepost();
        } catch (error) {
            console.error(error);
            alert("Broadcast failed.");
        } finally {
            setIsReposting(false);
        }
    };

    return (
        <div className="reel-wrapper">
            {/* Main Interactive Video Layer */}
            <div className="reel-interact-layer" onClick={handleVideoClick}>
                <video
                    ref={videoRef}
                    src={data.videoUrl}
                    className="reel-video"
                    style={{ filter: data.filter || 'none' }}
                    loop
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                />
                
                {/* Advanced Metadata Rendering (Text/Stickers) */}
                <div className="absolute inset-0 pointer-events-none">
                    {data.textOverlays?.map((t, i) => (
                        <div key={i} className="absolute text-white font-bold text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ top: t.top, left: t.left, transform: 'translate(-50%, -50%)' }}>
                            {t.text}
                        </div>
                    ))}
                    {data.stickers?.map((s, i) => (
                        <div key={i} className="absolute text-4xl" style={{ top: s.top, left: s.left, transform: 'translate(-50%, -50%)' }}>
                            {s.emoji}
                        </div>
                    ))}
                </div>

                {/* Double-tap Heart Animation */}
                <div className="heart-animations-container">
                    <AnimatePresence>
                        {showHeartPop && (
                            <motion.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 1, 0], y: [0, -50, -100] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8 }}
                                className="heart-pop-animation"
                            >
                                <Heart size={80} fill="#ef4444" stroke="none" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Play/Pause Indicator Overlay */}
            <AnimatePresence>
                {!isPlaying && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.6, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="play-indicator"
                    >
                        <Play size={48} fill="white" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Information Overlay (Bottom Left) */}
            <div className="reel-info-overlay">
                <div className="author-name">
                    <Link to={`/profile/${data.userId}`} className="hover:underline">
                        @{data.authorName}
                    </Link>
                    <span className="army-tag">HQ Creator</span>
                </div>
                
                {data.isRepost && (
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1 font-bold">
                        <Repeat size={12} /> BROADCASTED INTEL
                    </div>
                )}

                <p className="reels-description">{data.description}</p>

                <div className="music-info-container">
                    <Music size={14} className="music-icon-spinning" />
                    <div className="music-marquee-container">
                        <div className="music-marquee-text">
                            {data.music || "Original Audio - Mission Soundtrack"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Actions (Bottom Right) */}
            <div className="reels-sidebar">
                <div className="sidebar-profile">
                    <Link to={`/profile/${data.userId}`}>
                        <img 
                            src={data.authorPhoto || `https://ui-avatars.com/api/?name=${data.authorName}&background=random`} 
                            alt="Author" 
                            className="sidebar-profile-img"
                        />
                    </Link>
                    <button className="plus-follow">+</button>
                </div>

                <div className="sidebar-action">
                    <button className="sidebar-icon-btn" onClick={toggleLike}>
                        <Heart size={38} fill={isLiked ? "#ef4444" : "rgba(0,0,0,0.5)"} color={isLiked ? "#ef4444" : "#fff"} />
                    </button>
                    <span className="sidebar-count">{likesCount}</span>
                </div>

                <div className="sidebar-action">
                    <button className="sidebar-icon-btn" onClick={() => setShowComments(true)}>
                        <MessageCircle size={38} fill="rgba(0,0,0,0.5)" />
                    </button>
                    <span className="sidebar-count">{comments.length}</span>
                </div>

                <div className="sidebar-action">
                    <button className="sidebar-icon-btn" onClick={handleRepost}>
                        <Repeat size={38} color={isReposting ? "#eab308" : "#fff"} />
                    </button>
                    <span className="sidebar-count">Repost</span>
                </div>

                <div className="sidebar-action">
                    <button className="sidebar-icon-btn" onClick={handleShare}>
                        <Share2 size={38} fill="rgba(0,0,0,0.5)" />
                    </button>
                    <span className="sidebar-count">{data.shares || 0}</span>
                </div>

                <div className="sidebar-action">
                    <button className="sidebar-icon-btn" onClick={handleDownload}>
                        <Download size={32} />
                    </button>
                </div>

                {user?.uid === data.userId && (
                    <div className="sidebar-action">
                        <button className="sidebar-icon-btn text-red-500" onClick={handleDelete}>
                            <Trash2 size={32} />
                        </button>
                    </div>
                )}

                {/* Spinning Record Icon */}
                <div className="music-record-wrapper">
                    <div className="music-record-icon">
                        <Music size={20} color="#fff" />
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="reel-progress-bar">
                <div className="reel-progress-fill" style={{ width: `${videoProgress}%` }}></div>
            </div>

            {/* Comments Overlay */}
            <AnimatePresence>
                {showComments && (
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="reel-comments-overlay"
                    >
                        <div className="comments-header">
                            <h3>Briefing Room ({comments.length})</h3>
                            <button onClick={() => setShowComments(false)} className="text-white hover:opacity-70">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="comments-list overflow-y-auto max-h-[60vh] p-4">
                            {comments.length === 0 ? (
                                <div className="text-center py-10 opacity-50 text-white font-bold">No tactical feedback yet.</div>
                            ) : (
                                comments.map(c => (
                                    <div key={c.id} className="mb-4 bg-white/5 p-3 rounded-xl">
                                        <div className="text-xs text-army-gold font-bold mb-1">@{c.userName}</div>
                                        <div className="text-white text-sm">{c.text}</div>
                                    </div>
                                ))
                            )}
                        </div>
                        <form className="p-4 border-t border-white/10 flex gap-2" onSubmit={handleComment}>
                            <input 
                                className="flex-1 bg-white/10 border-none rounded-full px-4 py-2 text-white outline-none focus:ring-1 focus:ring-army-gold"
                                placeholder="Add mission briefing..." 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button type="submit" className="bg-army-gold p-2 rounded-full text-black">
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Main Reels Page
 */
export default function Reels() {
    const { user } = useAuth();
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeReelIndex, setActiveReelIndex] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const containerRef = useRef(null);

    const fetchReels = async () => {
        setLoading(true);
        try {
            const data = await reelsService.getAllReels();
            setReels(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReels();
    }, []);

    const handleScroll = () => {
        if (!containerRef.current) return;
        const scrollPosition = containerRef.current.scrollTop;
        const windowHeight = containerRef.current.clientHeight;
        const newIndex = Math.round(scrollPosition / windowHeight);
        if (newIndex !== activeReelIndex) {
            setActiveReelIndex(newIndex);
        }
    };

    if (loading && reels.length === 0) {
        return (
            <div className="reels-loading">
                <div className="loading-spinner-army"></div>
                <div className="text-army-gold font-bold tracking-widest text-sm uppercase">Loading Mission Intel...</div>
            </div>
        );
    }

    return (
        <div className="reels-page-wrapper">
            {/* Deployment Mission Hub (Top Right) */}
            <div className="mission-hub-controls">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mission-briefing-btn"
                    onClick={() => setShowPrompt(true)}
                >
                    <Sparkles size={20} />
                    <span>Mission Briefing</span>
                </motion.button>
                
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="deploy-reel-btn"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={24} />
                </motion.button>
            </div>

            {/* Mission Briefing Overlay */}
            <AnimatePresence>
                {showPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <div className="w-full max-w-2xl relative">
                            <button 
                                onClick={() => setShowPrompt(false)}
                                className="absolute -top-12 right-0 text-white/50 hover:text-white"
                            >
                                <X size={32} />
                            </button>
                            <ReelPrompt onDeployMission={() => {
                                setShowPrompt(false);
                                setShowCreateModal(true);
                            }} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back to Portal (Top Left) */}
            <Link to="/home" className="absolute top-6 left-6 z-[100] text-white opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
                <X size={20} /> Portal
            </Link>

            <div className="reels-container overflow-y-scroll snap-y snap-mandatory" ref={containerRef} onScroll={handleScroll}>
                {reels.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6">
                        <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center">
                            <Plus size={32} className="text-slate-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-400 mb-2">No active missions found in this sector.</p>
                            <button 
                                onClick={() => setShowCreateModal(true)}
                                className="text-army-gold underline font-bold"
                            >
                                Deploy First Intel
                            </button>
                        </div>
                    </div>
                ) : (
                    reels.map((reel, index) => (
                        <Reel 
                            key={reel.id} 
                            data={reel} 
                            isActive={index === activeReelIndex} 
                            onDeleted={(id) => setReels(prev => prev.filter(r => r.id !== id))}
                            onRepost={fetchReels}
                        />
                    ))
                )}
            </div>

            {/* Bottom Navigation Bar (Mobile-style) */}
            <div className="reels-bottom-nav">
                <Link to="/reels" className="nav-item active">
                    <Repeat size={24} />
                    <span>Reels</span>
                </Link>
                <button onClick={() => setShowCreateModal(true)} className="nav-item create-btn">
                    <Plus size={28} />
                </button>
                <Link to="/chat" className="nav-item">
                    <MessageCircle size={24} />
                    <span>Chat</span>
                </Link>
                <Link to={`/profile/${user?.uid}`} className="nav-item">
                    <Avatar src={user?.photoURL} name={user?.displayName} size="small" className="nav-avatar" />
                    <span>Profile</span>
                </Link>
            </div>

            {/* Creation Modal */}
            {showCreateModal && (
                <CreateReelModal 
                    onClose={() => setShowCreateModal(false)} 
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchReels();
                    }} 
                />
            )}
        </div>
    );
}
