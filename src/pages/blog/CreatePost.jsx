import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthProvider";
import { ArrowLeft, Send, Image, Tag, FileText } from "lucide-react";

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Programming");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user || loading) return;

    setLoading(true);
    try {
      const tagList = tags
        .split(",")
        .map(t => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const postData = {
        title: title.trim(),
        category,
        thumbnailUrl: thumbnailUrl.trim() || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
        content: content.trim(),
        tags: tagList,
        authorId: user.uid,
        authorName: user.displayName || "Operative",
        authorPhoto: user.photoURL || null,
        likes: [],
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "posts"), postData);
      navigate(`/blog/${docRef.id}`);
    } catch (err) {
      console.error("Failed to publish dispatch:", err);
      alert("Failed to publish dispatch. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-white">Create Intel Dispatch</h1>
          <p className="text-sm text-slate-400">Publish a tutorial, operational briefing, or community guide.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Dispatch Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Architecting Scalable Cloud Microservices in 2026"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Mission Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="Programming">Programming</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="DevOps & Cloud">DevOps & Cloud</option>
                <option value="Design & UI/UX">Design & UI/UX</option>
                <option value="Career & Strategy">Career & Strategy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Header Image URL
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={e => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="react, security, web3, cloud"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Dispatch Body (Markdown & formatting supported)
            </label>
            <textarea
              rows={10}
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your briefing content here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-900/30"
            >
              <Send size={16} />
              {loading ? "TRANSMITTING..." : "PUBLISH DISPATCH"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
