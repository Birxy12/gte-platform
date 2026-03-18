import { useState, useEffect, useCallback } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: "", content: "", author: "", image: "" });

  const fetchPosts = useCallback(async () => {
    try {
      const data = await getDocs(collection(db, "posts"));
      setPosts(data.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts() }, [fetchPosts]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this blog post permanentely?")) return;
    try {
      await deleteDoc(doc(db, "posts", id));
      fetchPosts();
    } catch (e) {
      console.error("Error deleting post:", e);
      alert("Error deleting post");
    }
  }

  const handleEdit = (post) => {
    setEditingId(post.id);
    setEditData({ title: post.title, content: post.content, author: post.author, image: post.image });
  }

  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, "posts", id), editData);
      setEditingId(null);
      fetchPosts();
    } catch (e) {
      console.error("Error saving edit:", e);
      alert("Error saving changes");
    }
  }

  if (loading) return <div className="ad-card">Loading posts...</div>;

  return (
    <>
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Manage Blog Posts</h1>
          <p>Review, edit, or remove platform-wide blog content</p>
        </div>
        <Link to="/admin/create-post" className="ad-btn-primary" style={{ textDecoration: 'none' }}>
          ＋ Write New Post
        </Link>
      </div>

      <div className="ad-card" style={{ padding: '0' }}>
        <div className="ad-table-wrapper">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Title & Meta</th>
                <th>Author</th>
                <th>Reactions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>
                    {editingId === post.id ? (
                      <input
                        className="ad-field"
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                        value={editData.title}
                        onChange={e => setEditData({ ...editData, title: e.target.value })}
                      />
                    ) : (
                      <div>
                        <div style={{ fontWeight: '700', color: 'white' }}>{post.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          ID: {post.id.substring(0, 8)}... | Published: {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === post.id ? (
                      <input
                        className="ad-field"
                        value={editData.author}
                        onChange={e => setEditData({ ...editData, author: e.target.value })}
                      />
                    ) : (
                      <span style={{ color: '#fbbf24', fontWeight: '600' }}>{post.author}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      👍 {post.reactions?.like || 0} | ❤️ {post.reactions?.love || 0} | 😂 {post.reactions?.laugh || 0}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      {editingId === post.id ? (
                        <>
                          <button className="ad-btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => saveEdit(post.id)}>Save</button>
                          <button className="ad-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setEditingId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="ad-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleEdit(post)}>Edit</button>
                          <button className="ad-btn-danger" onClick={() => handleDelete(post.id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}