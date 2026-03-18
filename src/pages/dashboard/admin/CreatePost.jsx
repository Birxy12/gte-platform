import { useState } from "react";
import { db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const createPost = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        image: image.trim(),
        reactions: { like: 0, love: 0, laugh: 0 },
        comments: [],
        createdAt: serverTimestamp()
      });
      alert("Blog post published successfully! 📰");
      navigate("/admin/manage-posts");
    } catch (err) {
      console.error(err);
      alert("Error publishing post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Write New Blog Post</h1>
          <p>Share platform updates, tutorials, or industry news</p>
        </div>
      </div>

      <div className="ad-card">
        <form onSubmit={createPost}>
          <div className="ad-form-grid">
            <div className="ad-field full">
              <label>Title</label>
              <input
                placeholder="An engaging title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="ad-field full">
              <label>Content</label>
              <textarea
                placeholder="Write your story here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="10"
                required
              />
            </div>

            <div className="ad-field">
              <label>Author Display Name</label>
              <input
                placeholder="Admin"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>

            <div className="ad-field">
              <label>Cover Image URL (optional)</label>
              <input
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
          </div>

          <div className="ad-btn-row">
            <button type="submit" className="ad-btn-primary" disabled={loading}>
              {loading ? "Publishing..." : "🖋️ Publish Post"}
            </button>
            <button type="button" className="ad-btn-secondary" onClick={() => navigate("/admin/manage-posts")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}