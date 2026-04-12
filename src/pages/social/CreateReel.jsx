import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ChevronLeft, 
  Upload, 
  Video, 
  Type, 
  Music, 
  Target, 
  CheckCircle,
  AlertCircle,
  Layout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthProvider";
import { reelsService } from "../../services/reelsService";
import { missionsService } from "../../services/missionsService";
import "../../styles/reels.css";

export default function CreateReel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [music, setMusic] = useState("Original Audio");
  const [coinCost, setCoinCost] = useState("0");
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const data = await missionsService.getMissions();
        setMissions(data);
      } catch (err) {
        console.error("Error fetching missions:", err);
      }
    };
    fetchMissions();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
        setError("Video size must be less than 50MB");
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a video to upload");
      return;
    }

    setUploading(true);
    setProgress(10); // Initial progress

    try {
      // Simulate progress since Supabase upload doesn't natively expose it in this simple client
      const progressInterval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 5 : prev));
      }, 500);

      await reelsService.uploadReel(file, description, user, {
        music,
        coinCost: parseInt(coinCost) || 0,
        missionId: selectedMission?.id || null,
        missionPrompt: selectedMission?.prompt || null
      });

      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        navigate("/reels");
      }, 1000);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Transmission failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <div className="create-reel-wrapper">
      {/* Header */}
      <div className="create-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ChevronLeft size={24} />
        </button>
        <h1>Deploy New Intel</h1>
        <div style={{ width: 24 }} />
      </div>

      <div className="create-scroll-area">
        <form onSubmit={handleUpload} className="create-form">
          
          {/* Video Preview / Upload Area */}
          <div 
            className={`file-upload-area ${previewUrl ? 'has-preview' : ''}`}
            onClick={() => !uploading && document.getElementById('reel-video-input').click()}
          >
            {previewUrl ? (
              <video src={previewUrl} className="preview-video" muted playsInline />
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon-circle">
                  <Upload size={32} />
                </div>
                <p>Select Raw Intel (MP4/MOV)</p>
                <span>Max size: 50MB</span>
              </div>
            )}
            <input 
              id="reel-video-input"
              type="file" 
              accept="video/*" 
              onChange={handleFileChange} 
              hidden 
            />
            {previewUrl && !uploading && (
                <div className="change-video-overlay">
                    <Video size={16} /> Tap to Change Asset
                </div>
            )}
          </div>

          {/* Description */}
          <div className="field-group">
            <label><Type size={16} /> Objective Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is the context of this intel? #MissionComplete"
              maxLength={200}
              required
            />
            <div className="char-count">{description.length}/200</div>
          </div>

          {/* Music */}
          <div className="field-group">
            <label><Music size={16} /> Audio Source</label>
            <input 
              type="text"
              value={music}
              onChange={(e) => setMusic(e.target.value)}
              placeholder="Original Audio"
            />
          </div>

          {/* Coin Cost */}
          <div className="field-group">
            <label><Target size={16} /> 🪙 Coin Cost (Optional Vault Unlock)</label>
            <input 
              type="number"
              min="0"
              value={coinCost}
              onChange={(e) => setCoinCost(e.target.value)}
              placeholder="0 = Free to view"
            />
            <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
               Charge users Vault coins to unlock and view this reel.
            </small>
          </div>

          {/* Mission Picker */}
          <div className="field-group">
            <label><Target size={16} /> Linked Mission (Optional)</label>
            <div className="mission-selector">
                {missions.length === 0 ? (
                    <div className="no-missions-placeholder">No active missions found</div>
                ) : (
                    <div className="mission-scroll-x">
                        {missions.map(m => (
                            <button
                                key={m.id}
                                type="button"
                                className={`mission-chip ${selectedMission?.id === m.id ? 'active' : ''}`}
                                onClick={() => setSelectedMission(selectedMission?.id === m.id ? null : m)}
                            >
                                {m.category}: {m.prompt.substring(0, 30)}...
                            </button>
                        ))}
                    </div>
                )}
            </div>
          </div>

          {/* Progress / Error */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="upload-error"
              >
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}

            {uploading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="progress-container"
              >
                <div className="progress-bar-bg">
                    <motion.div 
                        className="progress-bar-fill"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
                <p>Transmitting Intel... {progress}%</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <button 
            type="submit" 
            className={`deploy-btn ${uploading ? 'deploying' : ''}`}
            disabled={uploading || !file}
          >
            {uploading ? (
                <>Deploying...</>
            ) : (
                <><CheckCircle size={20} /> Deploy Intel to Network</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
