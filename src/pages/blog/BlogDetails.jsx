import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { doc, getDoc, collection, query, orderBy, getDocs, addDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthProvider";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Send,
  User,
  CheckCircle,
  Tag
} from "lucide-react";
import { formatDate } from "../../utils/helpers";
import "./Blog.css";

export default function BlogDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const postSnap = await getDoc(doc(db, "posts", id));
        if (postSnap.exists()) {
          const data = { id: postSnap.id, ...postSnap.data() };
          setPost(data);
          setLikesCount(data.likesCount || (data.likes?.length || 0));
          if (user && data.likes && data.likes.includes(user.uid)) {
            setLiked(true);
          }

          // Fetch comments
          const commentsSnap = await getDocs(
            query(collection(db, "posts", id, "comments"), orderBy("createdAt", "desc"))
          );
          setComments(commentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error("Error fetching article intel:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => (newLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        likesCount: increment(newLiked ? 1 : -1)
      });
    } catch (err) {
      console.error("Failed to update like status:", err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || commenting) return;

    setCommenting(true);
    try {
      const commentData = {
        text: newComment.trim(),
        authorId: user.uid,
        authorName: user.displayName || "Operative",
        authorPhoto: user.photoURL || null,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, "posts", id, "comments"), {
        ...commentData,
        createdAt: serverTimestamp()
      });

      setComments([{ id: docRef.id, ...commentData }, ...comments]);
      setNewComment("");

      await updateDoc(doc(db, "posts", id), {
        commentsCount: increment(1)
      });
    } catch (err) {
      console.error("Failed to transmit comment:", err);
    } finally {
      setCommenting(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-sm font-bold uppercase tracking-widest">Decrypting Transmission...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4 p-6 text-center">
        <h2 className="text-2xl font-black text-white">Transmission Not Found</h2>
        <p className="text-sm text-slate-500">This tactical briefing does not exist or has been archived.</p>
        <Link to="/blog" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider">
          Return to Intel Dispatch
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-400 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dispatch
        </Link>

        {/* Header */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {post.category || "Intel Briefing"}
            </span>
            {post.tags && post.tags.map((tag, idx) => (
              <span key={idx} className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
                {(post.authorName || "O")[0].toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-white text-sm">{post.authorName || "Command Operative"}</div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> 5 min read</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  liked ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" : "bg-slate-900 hover:bg-slate-800 text-slate-400"
                }`}
              >
                <Heart size={16} fill={liked ? "currentColor" : "none"} />
                <span>{likesCount}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-400 transition-colors"
                title="Copy Link"
              >
                {copied ? <CheckCircle size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                <span>{copied ? "Link Copied!" : "Share"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        {post.thumbnailUrl && (
          <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="w-full max-h-[480px] object-cover"
            />
          </div>
        )}

        {/* Main Content Body */}
        <div className="prose prose-invert max-w-none text-slate-300 text-base md:text-lg leading-relaxed space-y-6 whitespace-pre-line font-normal">
          {post.content}
        </div>

        {/* Comments Section */}
        <div className="pt-12 border-t border-slate-800 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <MessageSquare className="text-blue-500" /> Field Comms & Feedback ({comments.length})
            </h3>
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} className="space-y-3 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <textarea
                rows={3}
                required
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your perspective or tactical feedback..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={commenting || !newComment.trim()}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send size={14} />
                  {commenting ? "TRANSMITTING..." : "POST TRANSMISSION"}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800 text-center space-y-2">
              <p className="text-sm text-slate-400">Join the operative debrief to leave comments.</p>
              <Link to="/login" className="inline-block px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">
                Log In to Respond
              </Link>
            </div>
          )}

          {/* Comment List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No operative responses yet. Be the first to brief.</div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 font-bold text-xs flex items-center justify-center">
                        {(c.authorName || "O")[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-white">{c.authorName || "Operative"}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-300 pl-10">{c.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
