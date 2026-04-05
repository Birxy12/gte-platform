import React, { useState, useRef, useEffect } from "react";
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
    
    // Recording States
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const videoPreviewRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const streamRef = useRef(null);

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

    // --- Recording Logic ---
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "user", width: 720, height: 1280 }, 
                audio: true 
            });
            streamRef.current = stream;
            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = stream;
            }
            setIsCameraActive(true);
        } catch (err) {
            console.error("Camera access denied:", err);
            alert("Mission failed: Camera and Microphone access required for live capture.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsCameraActive(false);
        setIsRecording(false);
        clearInterval(timerRef.current);
    };

    const startRecording = () => {
        if (!streamRef.current) return;
        
        chunksRef.current = [];
        const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm;codecs=vp9,opus' });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const fileObj = new File([blob], `GTE_RECORD_${Date.now()}.webm`, { type: 'video/webm' });
            setFile(fileObj);
            setPreviewUrl(URL.createObjectURL(blob));
            setIsVideo(true);
            stopCamera();
        };

        recorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
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
            alert("Upload failed. Check your network transmission.");
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-0 md:p-4 overflow-y-auto">
            <div className="bg-slate-900 border-0 md:border md:border-slate-800 rounded-0 md:rounded-3xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden shadow-2xl relative min-h-screen md:min-h-0">
                
                {/* Mobile Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-6 left-6 z-50 bg-black/40 hover:bg-slate-800 rounded-full p-2 text-white transition-colors border border-white/10"
                >
                    <X size={20} />
                </button>

                {/* Preview Panel - Immersive 9:16 focus */}
                <div className="w-full md:w-[450px] bg-black relative flex items-center justify-center aspect-[9/16] md:aspect-auto md:min-h-[700px] border-r border-slate-800">
                    {!previewUrl && !isCameraActive ? (
                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Upload size={40} className="text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Deploy New Intel</h3>
                            <p className="text-slate-400 text-sm mb-8 px-10">Select a vertical file or record a mission live from your hardware.</p>
                            
                            <div className="flex flex-col gap-3 px-10">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Upload size={20} /> Select Media Asset
                                </button>
                                
                                <button 
                                    onClick={startCamera}
                                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-10 rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-2"
                                >
                                    <Video size={20} /> Record Live Intel
                                </button>
                            </div>

                            <input 
                                type="file" 
                                accept="video/*,image/*" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect}
                            />
                        </div>
                    ) : isCameraActive ? (
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
                            <video 
                                ref={videoPreviewRef}
                                className="w-full h-full object-cover scale-x-[-1]" 
                                autoPlay 
                                muted 
                                playsInline
                            />
                            
                            {/* Recording HUD */}
                            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                        <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
                                        <span className="text-xs font-mono text-white tracking-widest">{isRecording ? `REC ${new Date(recordingTime * 1000).toISOString().substr(14, 5)}` : 'STANDBY'}</span>
                                    </div>
                                    <button onClick={stopCamera} className="pointer-events-auto bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-all">
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <div className="flex flex-col items-center gap-6 pb-4">
                                    <button 
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className="pointer-events-auto group relative transition-transform active:scale-90"
                                    >
                                        <div className={`w-20 h-20 rounded-full border-4 ${isRecording ? 'border-red-500' : 'border-white'} flex items-center justify-center transition-all`}>
                                            <div className={`${isRecording ? 'w-8 h-8 rounded-md bg-red-500' : 'w-14 h-14 rounded-full bg-white'} transition-all group-hover:scale-110`}></div>
                                        </div>
                                    </button>
                                    <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em] drop-shadow-md">
                                        {isRecording ? 'Terminate Capture' : 'Initiate Intel Capture'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-900">
                            {isVideo ? (
                                <video 
                                    src={previewUrl} 
                                    className="w-full h-full object-cover" 
                                    style={{ filter: activeFilter }}
                                    loop 
                                    autoPlay 
                                    muted 
                                />
                            ) : (
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                    style={{ filter: activeFilter }}
                                />
                            )}

                            {/* UI Simulation Overlay */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/60">
                                {/* Simulated Text Overlays */}
                                {textOverlays.map((t, i) => (
                                    <div key={i} className="absolute text-white font-bold text-2xl drop-shadow-xl" style={{ top: t.top, left: t.left, transform: 'translate(-50%, -50%)' }}>
                                        {t.text}
                                    </div>
                                ))}
                                {/* Simulated Stickers */}
                                {stickers.map((s, i) => (
                                    <div key={i} className="absolute text-5xl" style={{ top: s.top, left: s.left, transform: 'translate(-50%, -50%)' }}>
                                        {s.emoji}
                                    </div>
                                ))}
                            </div>
                            
                            <button 
                                onClick={() => { setFile(null); setPreviewUrl(null); }}
                                className="absolute top-6 right-6 bg-red-500/80 hover:bg-red-500 text-white text-[10px] font-bold px-4 py-2 rounded-xl backdrop-blur-md shadow-lg transition-all"
                            >
                                DISCARD ASSET
                            </button>
                        </div>
                    )}
                </div>

                {/* Controls Panel */}
                <div className="flex-1 bg-slate-900 p-8 md:p-10 overflow-y-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-white font-bold text-xl uppercase tracking-widest">Mission Config</h3>
                        <div className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-400/20 font-mono">SECURE TRANS_ON</div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {/* Description */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Transmission Briefing</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Describe your mission intel..."
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white text-sm focus:border-blue-500/50 focus:bg-slate-800 outline-none transition-all resize-none h-32"
                            />
                        </div>

                        {/* Soundtrack */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">
                                <Music size={12} /> Audio Signature
                            </label>
                            <input
                                type="text"
                                value={music}
                                onChange={e => setMusic(e.target.value)}
                                placeholder="Audio track name..."
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-white text-sm focus:border-blue-500/50 outline-none transition-all"
                            />
                        </div>

                        {/* Filters */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Visual Matrix Filters</label>
                            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                                {FILTERS.map(f => (
                                    <button
                                        key={f.name}
                                        onClick={() => setActiveFilter(f.value)}
                                        className={`px-6 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeFilter === f.value ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                                    >
                                        {f.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Overlays */}
                        <div className="space-y-6">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Augmented Elements</label>
                            
                            <div className="flex gap-3">
                                <input 
                                    type="text" 
                                    value={newText}
                                    onChange={e => setNewText(e.target.value)}
                                    placeholder="Add HUD text..."
                                    className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 text-sm text-white focus:border-blue-500/50 outline-none"
                                />
                                <button onClick={addTextOverlay} className="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl text-white transition-colors border border-slate-700">
                                    <Type size={20} />
                                </button>
                            </div>

                            <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-4 flex flex-wrap gap-4 justify-center">
                                {STICKERS.map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => addSticker(s)}
                                        className="hover:scale-125 hover:rotate-6 active:scale-95 transition-all text-3xl"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Deployment Action */}
                        <div className="pt-4">
                            <button
                                onClick={handlePost}
                                disabled={!file || isUploading}
                                className={`w-full font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all text-sm uppercase tracking-widest ${!file || isUploading ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/20 active:scale-[0.98]'}`}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        UPLOADING INTEL...
                                    </>
                                ) : (
                                    <>DEPLOY MISSION ASSET <Upload size={20} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div