import { useState } from "react";
import { useAuth } from "../../../context/AuthProvider";
import { db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function UserBlogPost() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setLoading(true);
        setError("");

        try {
            await addDoc(collection(db, "posts"), {
                title: title.trim(),
                content: content.trim(),
                image: image.trim(),
                author: user.email,
                authorEmail: user.email,
                reactions: { like: 0, love: 0, laugh: 0 },
                comments: [],
                createdAt: serverTimestamp()
            });

            navigate("/dashboard/my-posts");
        } catch (err) {
            console.error(err);
            setError("Failed to publish your post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="ud-page-header">
                <h1>Write a Blog Post ✍️</h1>
                <p>Share your knowledge, ideas, and experiences with the community</p>
            </div>

            {error && <div className="ud-error">{error}</div>}

            <div className="ud-card">
                <form onSubmit={handleSubmit}>
                    <div className="ud-form-grid">
                        <div className="ud-field full">
                            <label>Post Title</label>
                            <input
                                type="text"
                                placeholder="An engaging title for your post..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="ud-field full">
                            <label>Cover Image URL (optional)</label>
                            <input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                        </div>

                        <div className="ud-field full">
                            <label>Content</label>
                            <textarea
                                placeholder="Write your blog post content here... Share your thoughts, tutorials, experiences, or tips."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows="12"
                                required
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    {(title || content) && (
                        <div style={{
                            marginTop: '1.5rem', padding: '1.5rem',
                            background: 'rgba(0,0,0,0.2)', borderRadius: '12px',
                            borderLeft: '3px solid #60a5fa'
                        }}>
                            <p style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 0.5rem 0' }}>Preview</p>
                            {title && <h3 style={{ color: 'white', margin: '0 0 0.5rem 0' }}>{title}</h3>}
                            {content && <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>{content.substring(0, 300)}{content.length > 300 ? '...' : ''}</p>}
                        </div>
                    )}

                    <div className="ud-btn-row">
                        <button type="submit" className="ud-btn-primary" disabled={loading}>
                            {loading ? "Publishing..." : "Publish Post 🚀"}
                        </button>
                        <button type="button" className="ud-btn-secondary" onClick={() => navigate("/dashboard")}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
