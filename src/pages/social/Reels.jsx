import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Music, Download, Trash2, X, Send } from 'lucide-react';
import { reelsService } from '../../services/reelsService';
import { useAuth } from '../../context/AuthProvider';
import '../../styles/reels.css';

function Reel({ data, isActive, onDeleted }) {
    const { user } = useAuth();
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(data.likes?.includes(user?.uid));
    const [likesCount, setLikesCount] = useState(data.likes?.length || 0);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState(data.comments || []);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setIsLiked(data.likes?.includes(user?.uid));
        setLikesCount(data.likes?.length || 0);
        setComments(data.comments || []);
    }, [data, user]);

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

    useEffect(() => {
        if (isActive) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log('Autoplay prevented:', e));
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, [isActive]);

    const toggleLike = async (e) => {
        e.stopPropagation();
        if (!user) return alert("Please log in to salute this mission!");
        try {
            await reelsService.toggleLike(data.id, user.uid);
            setIsLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        } catch (e) { console.error(e); }
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
            alert("Download failed. Opening in new tab instead.");
            window.open(data.videoUrl, '_blank');
        }
    };

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/reels?id=${data.id}`;
        navigator.clipboard.writeText(shareUrl);
        alert("Reel intelligence copied to clipboard! 📋");
        reelsService.incrementShare(data.id);
    };

    return (
        <div className={`reel-wrapper ${!isPlaying ? 'paused' : ''}`}>
            <video
                ref={videoRef}
                src={data.videoUrl}
                className="reel-video"
                loop
                playsInline
                onClick={togglePlay}
            />

            <div className="play-indicator">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </div>

            <div className="reel-overlay">
                <div className="reel-info">
                    <div className="reel-author flex items-center gap-2 mb-2">
                        <img 
                            src={data.authorPhoto || `https://ui-avatars.com/api/?name=${data.authorName || 'U'}&background=random`} 
                            className="w-8 h-8 rounded-full border border-white/20 object-cover" 
                            alt="Author" 
                        />
                        <div className="flex flex-col">
                            <Link to={`/profile/${data.userId}`} className="hover:underline font-bold text-sm">
                                {data.authorName}
                            </Link>
                            <span className="army-tag text-[10px] opacity-80 uppercase tracking-tighter">Mission Creator</span>
                        </div>
                    </div>
                    <p className="reel-description">{data.description}</p>
                    <div className="reel-music">
                        <Music size={16} />
                        <div className="music-marquee">
                            <span>{data.music || "Original Audio - Mission Soundtrack"}</span>
                        </div>
                    </div>
                </div>

                <div className="reel-actions">
                    <button className="action-btn" onClick={toggleLike}>
                        <Heart size={32} fill={isLiked ? "#ef4444" : "transparent"} color={isLiked ? "#ef4444" : "white"} />
                        <span className="action-text">{likesCount}</span>
                    </button>
                    
                    <button className="action-btn" onClick={() => setShowComments(!showComments)}>
                        <MessageCircle size={32} />
                        <span className="action-text">{comments.length}</span>
                    </button>
                    
                    <button className="action-btn" onClick={handleShare}>
                        <Share2 size={32} />
                        <span className="action-text">{data.shares || 0}</span>
                    </button>

                    <button className="action-btn" onClick={handleDownload}>
                        <Download size={32} />
                        <span className="action-text">Save</span>
                    </button>

                    {user?.uid === data.userId && (
                        <button className="action-btn text-red-500" onClick={handleDelete} disabled={isDeleting}>
                            <Trash2 size={32} />
                            <span className="action-text">Abort</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Comments Sidebar Overlay */}
            {showComments && (
                <div className="reel-comments-overlay animate-in slide-in-from-right">
                    <div className="comments-header">
                        <h3>Intelligence Feed ({comments.length})</h3>
                        <button onClick={() => setShowComments(false)}><X size={20} /></button>
                    </div>
                    <div className="comments-list">
                        {comments.length === 0 ? (
                            <div className="text-center py-10 opacity-50">No mission feedback yet.</div>
                        ) : (
                            comments.map(c => (
                                <div key={c.id} className="comment-bubble-army">
                                    <div className="comment-user">{c.userName}</div>
                                    <div className="comment-text">{c.text}</div>
                                </div>
                            ))
                        )}
                    </div>
                    <form className="comment-input-army" onSubmit={handleComment}>
                        <input 
                            placeholder="Add mission briefing..." 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button type="submit"><Send size={18} /></button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default function Reels() {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeReelIndex, setActiveReelIndex] = useState(0);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchReels = async () => {
            try {
                const data = await reelsService.getAllReels();
                setReels(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchReels();
    }, []);

    const onDeleted = (id) => {
        setReels(prev => prev.filter(r => r.id !== id));
    };

    const handleScroll = () => {
        if (!containerRef.current) return;
        
        const scrollPosition = containerRef.current.scrollTop;
        const windowHeight = containerRef.current.clientHeight;
        const newIndex = Math.round(scrollPosition / windowHeight);
        
        if (newIndex !== activeReelIndex) {
            setActiveReelIndex(newIndex);
        }
    };

    if (loading) return <div className="reels-loading">Awaiting Mission Intel...</div>;

    return (
        <div className="reels-page-wrapper">
            <div className="reels-container" ref={containerRef} onScroll={handleScroll}>
                {reels.length === 0 ? (
                    <div className="no-reels">No missions active. Be the first to deploy!</div>
                ) : (
                    reels.map((reel, index) => (
                        <Reel 
                            key={reel.id} 
                            data={reel} 
                            isActive={index === activeReelIndex} 
                            onDeleted={onDeleted}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
