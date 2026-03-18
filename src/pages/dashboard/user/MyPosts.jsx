import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthProvider";
import { db } from "../../../config/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function MyPosts() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        if (!user) return;
        try {
            const q = query(collection(db, "posts"), where("authorEmail", "==", user.email));
            const snap = await getDocs(q);
            setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await deleteDoc(doc(db, "posts", id));
            setPosts(posts.filter(p => p.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <div className="ud-page-header">
                <h1>My Blog Posts 📄</h1>
                <p>Manage all your published blog posts</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <Link to="/dashboard/create-post" className="ud-btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                    + Write New Post
                </Link>
            </div>

            {loading ? (
                <p style={{ color: '#64748b' }}>Loading your posts...</p>
            ) : posts.length === 0 ? (
                <div className="ud-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</p>
                    <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No posts yet</h3>
                    <p style={{ color: '#64748b' }}>Start sharing your knowledge with the community!</p>
                    <Link to="/dashboard/create-post" className="ud-btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>
                        Write Your First Post →
                    </Link>
                </div>
            ) : (
                <div className="ud-card">
                    <h3>{posts.length} Post{posts.length !== 1 ? 's' : ''}</h3>
                    <div className="ud-posts-list">
                        {posts.map(post => (
                            <div key={post.id} className="ud-post-item">
                                <div>
                                    <div className="ud-post-title">{post.title}</div>
                                    <div className="ud-post-date">
                                        {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : "Recently"}
                                        {' · '}
                                        👍 {post.reactions?.like || 0} · 💬 {post.comments?.length || 0}
                                    </div>
                                </div>
                                <div className="ud-post-actions">
                                    <button className="ud-btn-delete" onClick={() => handleDelete(post.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
