import { useState } from "react";
import { db } from "../../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [instructor, setInstructor] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [annualPrice, setAnnualPrice] = useState("");
  const [coinCost, setCoinCost] = useState("100");
  const [category, setCategory] = useState("Beginner");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const createCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "courses"), {
        title: title.trim(),
        description: description.trim(),
        videoUrl: videoUrl.trim(),
        instructor: instructor.trim(),
        monthlyPrice: monthlyPrice.trim() || "0",
        annualPrice: annualPrice.trim() || "0",
        coinCost: parseInt(coinCost) || 100,
        category: category,
        thumbnailUrl: thumbnailUrl.trim() || "",
        enrolledCount: 0,
        createdAt: serverTimestamp()
      });
      alert("Education course created successfully! 🎓");
      navigate("/admin/manage-courses");
    } catch (err) {
      console.error(err);
      alert("Error creating course. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="ad-page-header">
        <div className="ad-header-title">
          <h1>Create New Course</h1>
          <p>Design a new educational module for the platform</p>
        </div>
      </div>

      <div className="ad-card">
        <form onSubmit={createCourse}>
          <div className="ad-form-grid">
            <div className="ad-field full">
              <label>Course Title</label>
              <input
                placeholder="e.g. Advanced React Architecture"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="ad-field full">
              <label>Detailed Description</label>
              <textarea
                placeholder="Explain what learners will gain from this course..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="6"
                required
              />
            </div>

            <div className="ad-field">
              <label>Thumbnail Image URL</label>
              <input
                placeholder="https://... (leave blank for default)"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
              />
            </div>

            <div className="ad-field">
              <label>Category / Level</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Programming</option>
                <option>Design</option>
                <option>Business</option>
                <option>Marketing</option>
                <option>Finance</option>
              </select>
            </div>

            <div className="ad-field full">
              <label>Video / Resource URL</label>
              <input
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                required
              />
            </div>

            <div className="ad-field">
              <label>Instructor Name</label>
              <input
                placeholder="e.g. Dr. Jane Smith"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                required
              />
            </div>

            <div className="ad-field">
              <label>🪙 Coin Cost (Vault Payment)</label>
              <input
                type="number"
                min="0"
                placeholder="100"
                value={coinCost}
                onChange={(e) => setCoinCost(e.target.value)}
              />
              <small style={{ color: '#64748b', fontSize: '0.75rem' }}>Set to 0 for free access</small>
            </div>

            <div className="ad-field">
              <label>Monthly Price ($)</label>
              <input
                type="number"
                placeholder="29"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
              />
            </div>

            <div className="ad-field">
              <label>Annual Price ($)</label>
              <input
                type="number"
                placeholder="19"
                value={annualPrice}
                onChange={(e) => setAnnualPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="ad-btn-row">
            <button type="submit" className="ad-btn-primary" disabled={loading}>
              {loading ? "Creating..." : "✨ Create Course"}
            </button>
            <button type="button" className="ad-btn-secondary" onClick={() => navigate("/admin/manage-courses")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}