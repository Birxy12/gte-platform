import React, { useState, useRef } from "react";
import { X, Image as ImageIcon, Music, Upload, Type, Smile, Video } from "lucide-react";
import { reelsService } from "../../services/reelsService";
import { useAuth } from "../../context/AuthProvider";

const FILTERS = [
    { name: "None", value: "none" },
    { name: "Vintage", value: "sepia(0.6) contrast(1.2)" },
    { name: "Noir", value: "grayscale(1) contrast(1.5)" },
    { name: "Vibrant", value: "saturate(2) contrast(1.1)" },
    { name: "Cool", value: "hue-rotate(180deg) saturate(1.5)" }
];

const STICKERS = ["🔥", "😂", "💯", "❤️", "🚀", "💀", "👏", "👀", "✨"];

export default function CreateReelModal({ onClose, onSuccess }) {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isVideo, setIsVideo] = useState(true);
    const [description, setDescription] = useState("");
    const [music, setMusic] = useState("");
    
    // Advanced Meta
    const [activeFilter, setActiveFilter] = useState("none");
    const [textOverlays, setTextOverlays] = useState([]);
    const [stickers, setStickers] = useState([]);
    
    const [newText, setNewText] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isVid = file.type.startsWith("video/");
        setIsVideo(isVid);
        setFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const addTextOverlay = () => {
        if (!newText.trim()) return;
        setTextOverlays(prev => [
            ...prev, 
            { text: newText, top: "50%", left: "50%" }
        ]);
        setNewText("");
    };

    const addSticker = (sticker) => {
        setStickers(prev => [
            ...prev,
            { emoji: sticker, top: "50%", left: "50%" }
        ]);
    };

    const handlePost = async () => {
        if (!file || !user) return;
        setIsUploading(true);
        try {
            const options = {
                music: music || "Original Audio",
                filter: activeFilter,
                textOverlays,
                stickers
            };
            
            await reelsService.uploadReel(file, description, user, options);
            onSuccess();
        } catch (error) {
            console.error("Failed to upload mission:", error);
            alert("Upload failed. Disconnecting...");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden shadow-2xl relative my-auto">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-10 bg-slate-900/50 hover:bg-red-500 rounded-full p-2 text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Preview Panel */}
                <div className="md:w-1/2 bg-black relative flex items-center justify-center min-h-[400px]">
                    {!previewUrl ? (
                        <div className="text-center p-8">
                            <Upload size={48} className="mx-auto text-blue-500 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Deploy New Mission</h3>
                            <p className="text-slate-400 text-sm mb-6">Upload an image or short video payload</p>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-full transition-colors"
                            >
                                Select File
                            </button>
                            <input 
                                type="file" 
                                accept="video/*,image/*" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect}
                            />
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                            {isVideo ? (
                                <video 
                                    src={previewUrl} 
                                    className="max-h-[600px] w-full object-contain" 
                                    style={{ filter: activeFilter }}
                                    loop 
                                    autoPlay 
                                    muted 
                                />
                            ) : (
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="max-h-[600px] w-full object-contain"
                                    style={{ filter: activeFilter }}
                                />
                            )}

                            {/* Render Text Overlays */}
                            {textOverlays.map((t, i) => (
                                <div key={i} className="absolute text-white font-bold text-2xl drop-shadow-lg" style={{ top: t.top, left: t.left, transform: 'translate(-50%, -50%)' }}>
                                    {t.text}
                                </div>
                            ))}

                            {/* Render Stickers */}
                            {stickers.map((s, i) => (
                                <div key={i} className="absolute text-4xl" style={{ top: s.top, left: s.left, transform: 'translate(-50%, -50%)' }}>
                                    {s.emoji}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Controls Panel */}
                <div className="md:w-1/2 bg-slate-800 p-6 overflow-y-auto max-h-[80vh]">
                    <h3 className="text-white font-bold text-lg mb-6 border-b border-slate-700 pb-2">Mission Configuration</h3>

                    {/* Basic Info */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Intel Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe this mission..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none resize-none h-24"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            <Music size={14} /> Soundtrack
                        </label>
                        <input
                            type="text"
                            value={music}
                            onChange={e => setMusic(e.target.value)}
                            placeholder="E.g. Theme Song - John Doe"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none"
                        />
                    </div>

                    {/* Filters */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Visual Filters</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {FILTERS.map(f => (
                                <button
                                    key={f.name}
                                    onClick={() => setActiveFilter(f.value)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeFilter === f.value ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Overlays */}
                    <div className="mb-6 space-y-4">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Metadata Overlays</label>
                        
                        {/* Text input */}
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={newText}
                                onChange={e => setNewText(e.target.value)}
                                placeholder="Add text..."
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 text-sm text-white focus:border-blue-500 outline-none"
                            />
                            <button onClick={addTextOverlay} className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg text-white">
                                <Type size={18} />
                            </button>
                        </div>

                        {/* Stickers */}
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-wrap gap-2">
                            {STICKERS.map(s => (
                                <button 
                                    key={s} 
                                    onClick={() => addSticker(s)}
                                    className="hover:scale-125 transition-transform text-xl"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8">
                        <button
                            onClick={handlePost}
                            disabled={!file || isUploading}
                            className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all ${!file || isUploading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'}`}
                        >
                            {isUploading ? (
                                "Transmitting..."
                            ) : (
                                <>Deploy Mission <Upload size={18} /></>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
