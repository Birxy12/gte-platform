import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from "../../context/AuthProvider";
import "./Blog.css";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const { user } = useAuth();

  // State for tracking which post is being edited
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // State for tracking which post has comments open
  const [openComments, setOpenComments] = useState({});
  const [newComment, setNewComment] = useState("");

  const fetchPosts = async () => {
    try {
      const data = await getDocs(collection(db, "posts"));
      setPosts(
        data.docs.map((doc) => {
          const postData = doc.data();
          return {
            ...postData,
            id: doc.id,
            reactions: postData.reactions || { like: 0, love: 0, laugh: 0 },
            comments: postData.comments || []
          };
        })
      );
      setErrorMsg(""); // Clear errors on success
    } catch (error) {
      console.error("Error fetching posts:", error);
      if (error.code === "permission-denied") {
        setErrorMsg("Missing or insufficient permissions to view these posts. Please check your Firebase Database Rules.");
      } else {
        setErrorMsg("An error occurred while loading posts.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, "posts", postId));
        setPosts(posts.filter(p => p.id !== postId));
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post. Do you have permission?");
      }
    }
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleSaveEdit = async (postId) => {
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        title: editTitle,
        content: editContent
      });

      setPosts(posts.map(p =>
        p.id === postId ? { ...p, title: editTitle, content: editContent } : p
      ));
      setEditingPostId(null);
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post.");
    }
  };

  const handleReaction = async (postId, currentReactions, type) => {
    if (!user) {
      alert("Please login to react to posts");
      return;
    }

    try {
      const postRef = doc(db, "posts", postId);
      // Fallback if reactions object doesn't exist
      const reactions = currentReactions || { like: [], love: [], laugh: [] };
      
      // Ensure the reaction type is an array to support user tracking
      const reactionArray = Array.isArray(reactions[type]) ? reactions[type] : Array(reactions[type] || 0).fill('legacy_user');
      
      let newReactionArray = [...reactionArray];
      
      // Toggle logic: If user already reacted, remove them. Otherwise, add them.
      if (newReactionArray.includes(user.uid)) {
         newReactionArray = newReactionArray.filter(id => id !== user.uid);
      } else {
         newReactionArray.push(user.uid);
      }

      await updateDoc(postRef, {
        [`reactions.${type}`]: newReactionArray
      });

      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            reactions: {
              ...(p.reactions || {}),
              [type]: newReactionArray
            }
          };
        }
        return p;
      }));
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  };

  const toggleComments = (postId) => {
    setOpenComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to comment");
      return;
    }
    if (!newComment.trim()) return;

    const commentData = {
      text: newComment,
      author: user.email || "Anonymous user",
      timestamp: new Date().toISOString()
    };

    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        comments: arrayUnion(commentData)
      });

      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, commentData]
          };
        }
        return p;
      }));
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment.");
    }
  };

  if (loading) return <div style={{ color: "white", padding: "2rem", textAlign: "center" }}>Loading blog posts...</div>;

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Community Blog</h1>
        <p style={{ color: "#94a3b8" }}>Share your thoughts, learn from others, and interact.</p>
      </div>

      {errorMsg ? (
        <div style={{ color: "#f87171", textAlign: "center", padding: "2rem", background: "rgba(248, 113, 113, 0.1)", borderRadius: "12px", border: "1px solid rgba(248, 113, 113, 0.2)" }}>
          <h3>Unable to Load Content</h3>
          <p>{errorMsg}</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", gridColumn: "1 / -1" }}>No posts yet.</p>
          ) : (
            posts.map((post) => {
              const isOwner = user && (user.email === post.author || user.email === post.authorEmail);
              const isEditing = editingPostId === post.id;

              return (
                <div key={post.id} className="post-card">
                  {post.image && <img src={post.image} alt={post.title} className="post-image" />}

                  <div className="post-content">
                    {isEditing ? (
                      <>
                        <input
                          className="edit-input"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                        />
                        <textarea
                          className="edit-textarea"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="owner-actions">
                          <button className="btn-save" onClick={() => handleSaveEdit(post.id)}>Save Changes</button>
                          <button className="btn-cancel" onClick={() => setEditingPostId(null)}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        {isOwner && (
                          <div className="owner-actions">
                            <button className="btn-edit" onClick={() => startEdit(post)}>Edit</button>
                            <button className="btn-delete" onClick={() => handleDelete(post.id)}>Delete</button>
                          </div>
                        )}

                        <h2 className="post-title">{post.title}</h2>
                        <div className="post-meta flex items-center gap-2 mb-3">
                          <img 
                            src={post.authorPhoto || `https://ui-avatars.com/api/?name=${post.author || 'U'}&background=random`} 
                            className="w-10 h-10 rounded-full border border-slate-700 object-cover" 
                            alt="Author" 
                          />
                          <div className="flex flex-col">
                            <span className="text-white font-bold text-sm leading-tight">{post.author?.split('@')[0] || "Unknown"}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Post Author</span>
                          </div>
                        </div>
                        <p className="post-body">{post.content}</p>

                        <div className="post-actions">
                          <div className="reaction-group">
                            <button className={`btn-reaction ${Array.isArray(post.reactions?.like) && post.reactions.like.includes(user?.uid) ? 'text-blue-400' : ''}`} onClick={() => handleReaction(post.id, post.reactions, 'like')}>
                              👍 {Array.isArray(post.reactions?.like) ? post.reactions.like.length : (post.reactions?.like || 0)}
                            </button>
                            <button className={`btn-reaction ${Array.isArray(post.reactions?.love) && post.reactions.love.includes(user?.uid) ? 'text-red-400' : ''}`} onClick={() => handleReaction(post.id, post.reactions, 'love')}>
                              ❤️ {Array.isArray(post.reactions?.love) ? post.reactions.love.length : (post.reactions?.love || 0)}
                            </button>
                            <button className={`btn-reaction ${Array.isArray(post.reactions?.laugh) && post.reactions.laugh.includes(user?.uid) ? 'text-yellow-400' : ''}`} onClick={() => handleReaction(post.id, post.reactions, 'laugh')}>
                              😂 {Array.isArray(post.reactions?.laugh) ? post.reactions.laugh.length : (post.reactions?.laugh || 0)}
                            </button>
                          </div>
                          <button
                            className="btn-toggle-comments"
                            onClick={() => toggleComments(post.id)}
                          >
                            💬 {post.comments?.length || 0} Comments
                          </button>
                        </div>

                        {/* Comments Section */}
                        {openComments[post.id] && (
                          <div className="comments-section">
                            <div className="comment-list">
                              {post.comments?.length === 0 ? (
                                <div style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center" }}>Be the first to comment!</div>
                              ) : (
                                post.comments?.map((comment, index) => (
                                  <div key={index} className="comment-item flex items-start gap-3 p-2 bg-slate-900/30 rounded-lg mb-2">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${comment.author || 'U'}&background=random`} 
                                        className="w-8 h-8 rounded-full flex-shrink-0 object-cover" 
                                        alt="C" 
                                    />
                                    <div className="flex flex-col">
                                        <span className="comment-author text-xs font-bold text-blue-400">{comment.author.split('@')[0]}</span>
                                        <span className="comment-text text-sm text-slate-300">{comment.text}</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            <form onSubmit={(e) => handleAddComment(e, post.id)} className="add-comment-form">
                              <input
                                type="text"
                                className="comment-input"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                              />
                              <button
                                type="submit"
                                className="btn-submit-comment"
                                disabled={!newComment.trim()}
                              >
                                ➤
                              </button>
                            </form>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}