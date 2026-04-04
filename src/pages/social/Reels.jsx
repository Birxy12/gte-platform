import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Music, Download, Trash2, X, Send, Plus, Repeat } from 'lucide-react';
import { reelsService } from '../../services/reelsService';
import { useAuth } from '../../context/AuthProvider';
import CreateReelModal from '../../components/social/CreateReelModal';
import '../../styles/reels.css';

function Reel({ data, isActive, onDeleted, onRepost }) {
    const { user } = useAuth();
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(data.likes?.includes(user?.uid));
    const [likesCount, setLikesCount] = useState(data.likes?.length || 0);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState(data.comments || []);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isReposting, setIsReposting] = useState(false);

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
        if (isLiking) return; // Debounce multiple clicks

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

    const handleRepost = async (e) => {
        e.stopPropagation();
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
            onRepost(); // refresh
        } catch (error) {
            console.error(error);
            alert("Broadcast failed.");
        } finally {
            setIsReposting(false);
        }
    };

    return (
        <div className={`reel-wrapper ${!isPlaying ? 'paused' : ''}`}>
            {/* Visual Overlays & Video */}
            <div className="absolute inset-0 z-0 overflow-hidden" onClick={togglePlay}>
                <video
                    ref={videoRef}
                    src={data.videoUrl}
                    className="reel-video w-full h-full object-cover"
                    style={{ filter: data.filter || 'none' }}
                    loop
                    playsInline
                />
                
                {/* Advanced Metadata Rendering */}
                {data.textOverlays?.map((t, i) => (
                    <div key={i} className="absolute text-white font-bold text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] pointer-events-none" style={{ top: t.top, left: t.left, transform: 'translate(-50%, -50%)' }}>
                        {t.text}
                    </div>
                ))}

                {data.stickers?.map((s, i) => (
                    <div key={i} className="absolute text-4xl pointer-events-none drop-shadow-md" style={{ top: s.top, left: s.left, transform: 'translate(-50%, -50%)' }}>
                        {s.emoji}
                    </div>
                ))}
            </div>

            <div className="play-indicator z-10 pointer-events-none">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </div>

            <div className="reel-overlay z-20 pointer-events-none">
                <div className="reel-info pointer-events-auto">
                    {data.isRepost && (
                        <div className="flex items-center gap-1 text-slate-300 text-xs mb-2 font-bold uppercase tracking-widest bg-black/40 w-fit px-2 py-1 rounded-full backdrop-blur-sm border border-white/10">
                            <Repeat size={12} /> Broadcast Transmission
                        </div>
                    )}
                    <div className="reel-author flex items-center gap-2 mb-2">
                        <img 
                            src={data.authorPhoto || `https://ui-avatars.com/api/?name=${data.authorName || 'U'}&background=random`} 
                            className="w-8 h-8 rounded-full border border-white/20 object-cover" 
                            alt="Author" 
                        />
                        <div className="flex flex-col">
                            <Link to={`/profile/${data.userId}`} className="hover:underline font-bold text-sm text-white drop-shadow-md">
                                @{data.authorName}
                            </Link>
                            <span className="army-tag text-[10px] opacity-80 uppercase tracking-tighter drop-shadow-md">Mission Creator</span>
                        </div>
                    </div>
                    <p className="reel-description text-white drop-shadow-md">{data.description}</p>
                    <div className="reel-music drop-shadow-md">
                        <Music size={16} className="text-white" />
                        <div className="music-marquee text-white outline-black">
                            <span>{data.music || "Original Audio - Mission Soundtrack"}</span>
                        </div>
                    </div>
                </div>

                <div className="reel-actions pointer-events-auto">
                    <button className={`action-btn ${isLiking ? 'opacity-50' : ''}`} onClick={toggleLike} disabled={isLiking}>
                        <Heart size={32} fill={isLiked ? "#ef4444" : "rgba(0,0,0,0.4)"} color={isLiked ? "#ef4444" : "white"} className="drop-shadow-lg" />
                        <span className="action-text drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{likesCount}</span>
                    </button>
                    
                    <button className="action-btn" onClick={() => setShowComments(!showComments)}>
                        <MessageCircle size={32} className="drop-shadow-lg" fill="rgba(0,0,0,0.4)" color="white" />
                        <span className="action-text drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{comments.length}</span>
                    </button>
                    
                    <button className="action-btn" onClick={handleShare}>
                        <Share2 size={32} className="drop-shadow-lg" fill="rgba(0,0,0,0.4)" color="white" />
                        <span className="action-text drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{data.shares || 0}</span>
                    </button>

                    <button className={`action-btn ${isReposting ? 'opacity-50' : ''}`} onClick={handleRepost} disabled={isReposting}>
                        <Repeat size={32} className="drop-shadow-lg" fill="rgba(0,0,0,0.4)" color="white" />
                        <span className="action-text drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">Broadcast</span>
                    </button>

                    <button className="action-btn" onClick={handleDownload}>
                        <Download size={32} className="drop-shadow-lg" fill="rgba(0,0,0,0.4)" color="white" />
                        <span className="action-text drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">Save</span>
                    </button>

                    {user?.uid === data.userId && (
                        <button className="action-btn text-red-500" onClick={handleDelete} disabled={isDeleting}>
                            <Trash2 size={32} fill="rgba(0,0,0,0.4)" />
                            <span className="action-text drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">Abort</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Comments Sidebar Overlay */}
            {showComments && (
                <div className="reel-comments-overlay animate-in slide-in-from-right z-30 pointer-events-auto">
                    <div className="comments-header bg-slate-900 border-b border-slate-800">
                        <h3 className="font-bold text-white tracking-widest text-sm uppercase">Intelligence Feed ({comments.length})</h3>
                        <button onClick={() => setShowComments(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                    </div>
                    <div className="comments-list">
                        {comments.length === 0 ? (
                            <div className="text-center py-10 opacity-50 text-white font-bold">No mission feedback yet.</div>
                        ) : (
                            comments.map(c => (
                                <div key={c.id} className="comment-bubble-army bg-slate-800/80 border border-slate-700/50 backdrop-blur-md">
                                    <div className="comment-user text-blue-400">@{c.userName}</div>
                                    <div className="comment-text text-slate-200">{c.text}</div>
                                </div>
                            ))
                        )}
                    </div>
                    <form className="comment-input-army bg-slate-900 border-t border-slate-800" onSubmit={handleComment}>
                        <input 
                            placeholder="Add mission briefing..." 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-white focus:border-blue-500 rounded-lg outline-none"
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 transition-colors rounded-lg"><Send size={18} /></button>
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
    const [showCreateModal, setShowCreateModal] = useState(false);
    const containerRef = useRef(null);

    const fetchReels = async () => {
        setLoading(true);
        try {
            const data = await reelsService.getAllReels();
            setReels(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
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

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        fetchReels(); // Pull new intelligence
        setActiveReelIndex(0); // Go to top where it should appear
    };

    if (loading && reels.length === 0) return <div className="reels-loading font-bold uppercase tracking-widest text-slate-400 text-sm">Awaiting Mission Intel...</div>;

    return (
        <div className="reels-page-wrapper relative bg-black">
            {/* Create Overlay Button */}
            <button 
                onClick={() => setShowCreateModal(true)}
                className="absolute top-6 right-6 z-50 bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all text-white p-3 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                title="Deploy Mission"
            >
                <Plus size={24} />
            </button>

            <div className="reels-container" ref={containerRef} onScroll={handleScroll}>
                {reels.length === 0 ? (
                    <div className="no-reels font-bold uppercase tracking-widest text-slate-400 text-sm flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-full border border-slate-700/50 bg-slate-800/30 flex items-center justify-center">
                            <Plus size={32} className="text-slate-500" />
                        </div>
                        No missions active. Be the first to deploy!
                    </div>
                ) : (
                    reels.map((reel, index) => (
                        <Reel 
                            key={reel.id} 
                            data={reel} 
                            isActive={index === activeReelIndex} 
                            onDeleted={onDeleted}
                            onRepost={fetchReels}
                        />
                    ))
                )}
            </div>

            {/* Creation Modal */}
            {showCreateModal && (
                <CreateReelModal 
                    onClose={() => setShowCreateModal(false)} 
                    onSuccess={handleCreateSuccess} 
                />
            )}
        </div>
    );
}
