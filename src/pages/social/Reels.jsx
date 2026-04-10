// Main Reels Feed Component
export default function Reels() {
  const { user } = useAuth(); // ✅ FIXED: Added user from useAuth
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const watchedSetRef = useRef(new Set());
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

  // Watch gamification Hook - ✅ FIXED: Added proper dependencies and memoization
  const currentReelId = useMemo(() => reels[activeReelIndex]?.id, [reels, activeReelIndex]);

  useEffect(() => {
    if (!currentReelId || !user) return;
    
    if (watchedSetRef.current.has(currentReelId)) return;
    
    watchedSetRef.current.add(currentReelId);
    
    const watchedCount = watchedSetRef.current.size;
    if (watchedCount > 0 && watchedCount % 3 === 0) {
      const giveCoin = async () => {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            coins: increment(1)
          });
          
          if (window.Notification && Notification.permission === "granted") {
            new Notification("GTE Mission", { 
              body: "🎉 You earned 1 Coin for watching 3 reels!" 
            });
          } else {
            alert("🎉 You earned +1 Coin for watching 3 reels!");
          }
        } catch (e) {
          console.error("Error giving coin reward:", e);
        }
      };
      giveCoin();
    }
  }, [currentReelId, user]);

  // Touch handling for swipe gestures
  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeReelIndex < reels.length - 1) {
        containerRef.current?.scrollTo({
          top: (activeReelIndex + 1) * containerRef.current.clientHeight,
          behavior: 'smooth'
        });
      } else if (diff < 0 && activeReelIndex > 0) {
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
