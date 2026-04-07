import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useMemo,
  memo 
} from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Music, 
  Download, 
  Trash2, 
  X, 
  Send,
  Play,
  Pause,
  Megaphone,
  Plus,
  Video
} from 'lucide-react';
import PropTypes from 'prop-types';
import { reelsService } from '../../services/reelsService';
import { useAuth } from '../../context/AuthProvider';
import '../../styles/reels.css';

// Constants
const SCROLL_THROTTLE_MS = 150;
const COMMENTS_ANIMATION_DURATION = 0.3;

// Utility: Throttle function for scroll performance
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Individual Reel Component (memoized for performance)
const Reel = memo(function Reel({ data, isActive, onDeleted }) {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const videoRef = useRef(null);
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize state from props
  useEffect(() => {
    setIsLiked(data.likes?.includes(user?.uid) ?? false);
    setLikesCount(data.likes?.length ?? 0);
    setComments(data.comments ?? []);
  }, [data, user?.uid]);

  // Handle video playback based on active state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isMounted = true;

    const handlePlayback = async () => {
      try {
        if (isActive) {
          setIsLoading(true);
          await video.play();
          if (isMounted) {
            setIsPlaying(true);
            setIsLoading(false);
          }
        } else {
          video.pause();
          video.currentTime = 0;
          if (isMounted) {
            setIsPlaying(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Playback error:', err);
          setError('Autoplay prevented. Tap to play.');
          setIsLoading(false);
        }
      }
    };

    handlePlayback();

    return () => {
      isMounted = false;
    };
  }, [isActive]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => setError('Failed to load video');

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  // Handlers
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [isPlaying]);

  const toggleLike = useCallback(async (e) => {
    e.stopPropagation();
    if (authLoading) return;
    if (!user) {
      alert('Please log in to like this video');
      return;
    }

    // Optimistic update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      await reelsService.toggleLike(data.id, user.uid);
    } catch (err) {
      // Rollback on error
      setIsLiked(!newLikedState);
      setLikesCount(prev => newLikedState ? prev - 1 : prev + 1);
      console.error('Like error:', err);
    }
  }, [isLiked, user, data.id]);

  const handleComment = useCallback(async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const commentText = newComment.trim();
    setNewComment('');

    // Optimistic update
    const tempComment = {
      id: `temp-${Date.now()}`,
      userName: user.displayName || 'Anonymous',
      text: commentText,
      createdAt: new Date().toISOString()
    };
    setComments(prev => [...prev, tempComment]);

    try {
      const savedComment = await reelsService.addComment(data.id, user, commentText);
      setComments(prev => prev.map(c => c.id === tempComment.id ? savedComment : c));
    } catch (err) {
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
      console.error('Comment error:', err);
      alert('Failed to post comment');
    }
  }, [newComment, user, data.id]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this reel permanently?')) return;
    
    setIsDeleting(true);
    try {
      await reelsService.deleteReel(data.id, data.storagePath);
      onDeleted(data.id);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete reel');
      setIsDeleting(false);
    }
  }, [data.id, data.storagePath, onDeleted]);

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(data.videoUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reel_${data.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      window.open(data.videoUrl, '_blank');
    }
  }, [data.videoUrl, data.id]);

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/reels?id=${data.id}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this reel',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
      reelsService.incrementShare(data.id);
    } catch (err) {
      console.error('Share error:', err);
    }
  }, [data.id]);

  // Memoized values
  const authorAvatar = useMemo(() => 
    data.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.authorName || 'User')}&background=random`,
    [data.authorPhoto, data.authorName]
  );

  const isOwner = user?.uid === data.userId;

  return (
    <div 
      className={`reel-wrapper ${!isPlaying ? 'paused' : ''}`}
      role="article"
      aria-label={`Reel by ${data.authorName}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={data.videoUrl}
        className="reel-video"
        loop
        playsInline
        muted={!isActive} // Mute when not active to prevent audio overlap
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
        controlsList="nodownload"
        preload="metadata"
        aria-label="Reel video"
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="reel-loading-overlay">
          <div className="spinner" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="reel-error-overlay" onClick={togglePlay}>
          <p>{error}</p>
          <span>Tap to retry</span>
        </div>
      )}

      {/* Play/Pause Indicator */}
      <AnimatePresence>
        {!isPlaying && !isLoading && !error && (
          <motion.div 
            className="play-indicator"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {isPlaying ? <Pause size={48} /> : <Play size={48} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Content */}
      <div className="reel-overlay">
        {/* Info Section */}
        <div className="reel-info">
          <div className="reel-author">
            <img 
              src={authorAvatar}
              className="author-avatar"
              alt={`${data.authorName}'s avatar`}
              loading="lazy"
            />
            <div className="author-details">
              <Link 
                to={`/profile/${data.userId}`} 
                className="author-name"
                onClick={(e) => e.stopPropagation()}
              >
                {data.authorName}
              </Link>
              <span className="author-tag">{data.isAd ? 'Promoted' : 'Creator'}</span>
            </div>
            {data.isAd && (
              <div className="ad-badge-premium">
                <Megaphone size={12} fill="currentColor" /> AD
              </div>
            )}
          </div>
          
          <p className="reel-description">{data.description}</p>
          
          <div className="reel-music">
            <Music size={16} aria-hidden="true" />
            <div className="music-marquee">
              <span>{data.music || 'Original Audio'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="reel-actions" role="toolbar" aria-label="Reel actions">
          <ActionButton 
            onClick={toggleLike}
            icon={<Heart size={28} />}
            active={isLiked}
            activeColor="#ef4444"
            label="Like"
            count={likesCount}
          />
          
          <ActionButton 
            onClick={() => setShowComments(true)}
            icon={<MessageCircle size={28} />}
            label="Comments"
            count={comments.length}
          />
          
          <ActionButton 
            onClick={handleShare}
            icon={<Share2 size={28} />}
            label="Share"
            count={data.shares || 0}
          />

          {(isOwner || isAdmin) && (
            <ActionButton 
              onClick={handleDownload}
              icon={<Download size={28} />}
              label="Save"
            />
          )}

          {(isOwner || isAdmin) && (
            <ActionButton 
              onClick={handleDelete}
              icon={<Trash2 size={28} />}
              label="Delete"
              disabled={isDeleting}
              className="delete-btn"
            />
          )}
        </div>
      </div>

      {/* Comments Sidebar */}
      <AnimatePresence>
        {showComments && (
          <CommentsPanel 
            comments={comments}
            onClose={() => setShowComments(false)}
            onSubmit={handleComment}
            newComment={newComment}
            setNewComment={setNewComment}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

// Extracted Action Button Component
const ActionButton = memo(function ActionButton({ 
  onClick, 
  icon, 
  active = false, 
  activeColor,
  label, 
  count, 
  disabled = false,
  className = ''
}) {
  return (
    <button 
      className={`action-btn ${className} ${active ? 'active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
    >
      <span className="action-icon" style={active ? { color: activeColor } : undefined}>
        {React.cloneElement(icon, {
          fill: active ? activeColor : 'transparent',
          color: active ? activeColor : 'currentColor'
        })}
      </span>
      {count !== undefined && <span className="action-count">{count}</span>}
      <span className="action-label">{label}</span>
    </button>
  );
});

ActionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.element.isRequired,
  active: PropTypes.bool,
  activeColor: PropTypes.string,
  label: PropTypes.string.isRequired,
  count: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

// Extracted Comments Panel Component
const CommentsPanel = memo(function CommentsPanel({ 
  comments, 
  onClose, 
  onSubmit, 
  newComment, 
  setNewComment 
}) {
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Auto-focus input when opened
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll to bottom when new comments added
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [comments.length]);

  return (
    <motion.div 
      className="reel-comments-overlay"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: COMMENTS_ANIMATION_DURATION, ease: 'easeInOut' }}
    >
      <div className="comments-header">
        <h3>Comments ({comments.length})</h3>
        <button 
          onClick={onClose}
          aria-label="Close comments"
          className="close-btn"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="comments-list" ref={listRef}>
        {comments.length === 0 ? (
          <div className="comments-empty">No comments yet. Be the first!</div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <span className="comment-author">{comment.userName}</span>
              <p className="comment-text">{comment.text}</p>
            </div>
          ))
        )}
      </div>
      
      <form className="comment-form" onSubmit={onSubmit}>
        <input 
          ref={inputRef}
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          maxLength={500}
        />
        <button 
          type="submit" 
          disabled={!newComment.trim()}
          aria-label="Send comment"
        >
          <Send size={18} />
        </button>
      </form>
    </motion.div>
  );
});

CommentsPanel.propTypes = {
  comments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  })).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  newComment: PropTypes.string.isRequired,
  setNewComment: PropTypes.func.isRequired
};

// PropTypes for Reel
Reel.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    videoUrl: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    authorName: PropTypes.string,
    authorPhoto: PropTypes.string,
    description: PropTypes.string,
    music: PropTypes.string,
    likes: PropTypes.arrayOf(PropTypes.string),
    comments: PropTypes.arrayOf(PropTypes.object),
    shares: PropTypes.number,
    storagePath: PropTypes.string
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onDeleted: PropTypes.func.isRequired
};

// Main Reels Feed Component
export default function Reels() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  
  const containerRef = useRef(null);
  const touchStartY = useRef(0);

  // Fetch reels on mount
  useEffect(() => {
    let isMounted = true;

    const fetchReels = async () => {
      try {
        setLoading(true);
        const data = await reelsService.getAllReels();
        if (isMounted) {
          setReels(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Fetch error:', err);
          setError('Failed to load reels');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReels();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle reel deletion
  const handleDeleted = useCallback((id) => {
    setReels(prev => prev.filter(r => r.id !== id));
    // Adjust active index if necessary
    setActiveReelIndex(prev => Math.min(prev, reels.length - 2));
  }, [reels.length]);

  // Throttled scroll handler
  const handleScroll = useCallback(
    throttle(() => {
      if (!containerRef.current) return;
      
      const { scrollTop, clientHeight } = containerRef.current;
      const newIndex = Math.round(scrollTop / clientHeight);
      
      if (newIndex !== activeReelIndex && newIndex >= 0 && newIndex < reels.length) {
        setActiveReelIndex(newIndex);
      }
    }, SCROLL_THROTTLE_MS),
    [activeReelIndex, reels.length]
  );

  // Touch handling for swipe gestures
  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (Math.abs(diff) > 50) { // Threshold for swipe
      if (diff > 0 && activeReelIndex < reels.length - 1) {
        // Swipe up - next reel
        containerRef.current?.scrollTo({
          top: (activeReelIndex + 1) * containerRef.current.clientHeight,
          behavior: 'smooth'
        });
      } else if (diff < 0 && activeReelIndex > 0) {
        // Swipe down - previous reel
        containerRef.current?.scrollTo({
          top: (activeReelIndex - 1) * containerRef.current.clientHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [activeReelIndex, reels.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' && activeReelIndex < reels.length - 1) {
        containerRef.current?.scrollTo({
          top: (activeReelIndex + 1) * containerRef.current.clientHeight,
          behavior: 'smooth'
        });
      } else if (e.key === 'ArrowUp' && activeReelIndex > 0) {
        containerRef.current?.scrollTo({
          top: (activeReelIndex - 1) * containerRef.current.clientHeight,
          behavior: 'smooth'
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReelIndex, reels.length]);

  if (loading) {
    return (
      <div className="reels-loading" role="status" aria-live="polite">
        <div className="spinner" />
        <p>Loading reels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reels-error" role="alert">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="reels-page-wrapper">
      <div 
        className="reels-container"
        ref={containerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="feed"
        aria-label="Reels feed"
        aria-live="polite"
        aria-atomic="false"
      >
        {reels.length === 0 ? (
          <div className="no-reels">
            <p>No reels yet. Be the first to create one!</p>
            <Link to="/reels/create" className="create-btn">Create Reel</Link>
          </div>
        ) : (
          reels.map((reel, index) => (
            <Reel 
              key={reel.id}
              data={reel}
              isActive={index === activeReelIndex}
              onDeleted={handleDeleted}
            />
          ))
        )}
      </div>

      {/* Primary Action Button (Create Reel) */}
      <Link to="/reels/create" className="reels-fab" aria-label="Create New Reel">
        <Plus size={32} />
      </Link>
      
      {/* Progress Indicator */}
      {reels.length > 0 && (
        <div className="reels-progress" aria-hidden="true">
          {reels.map((_, idx) => (
            <div 
              key={idx}
              className={`progress-dot ${idx === activeReelIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}