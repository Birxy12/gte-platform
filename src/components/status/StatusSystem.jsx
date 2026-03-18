import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import { statusService } from "../../services/statusService";
import { Plus, Camera, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function StatusFeed() {
    const { user } = useAuth();
    const [statuses, setStatuses] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [viewingStatus, setViewingStatus] = useState(null);

    useEffect(() => {
        const unsubscribe = statusService.subscribeToStatuses((newStatuses) => {
            const grouped = newStatuses.reduce((acc, status) => {
                if (!acc[status.userId]) acc[status.userId] = [];
                acc[status.userId].push(status);
                return acc;
            }, {});
            setStatuses(Object.values(grouped));
        }, (err) => {
            console.error("Status subscription error:", err);
        });
        return unsubscribe;
    }, []);

    return (
        <div className="bg-white min-h-[100px] border-b border-wa-border p-3 md:p-4">
            <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-bold text-wa-text">Status</h2>
                <button
                    onClick={() => setShowCreate(true)}
                    className="text-wa-teal-light font-medium text-sm"
                >
                    Privacy
                </button>
            </div>

            <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2">
                {/* My Status */}
                <div
                    className="flex flex-col items-center gap-1.5 md:gap-2 shrink-0 cursor-pointer group"
                    onClick={() => setShowCreate(true)}
                >
                    <div className="relative">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-wa-border p-0.5 group-active:scale-95 transition-transform">
                            <div className="w-full h-full rounded-full bg-wa-bg-light overflow-hidden">
                                <img src={user?.photoURL || "https://ui-avatars.com/api/?name=" + (user?.displayName || "U")} className="w-full h-full object-cover" alt="Me" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 bg-wa-green text-white rounded-full p-1 border-2 border-white shadow-sm">
                            <Plus size={12} md:size={14} strokeWidth={3} />
                        </div>
                    </div>
                    <span className="text-[11px] md:text-xs font-medium text-wa-text">My status</span>
                </div>

                {/* Contacts Status */}
                {statuses.map((userStatus) => (
                    <div
                        key={userStatus[0].userId}
                        className="flex flex-col items-center gap-1.5 md:gap-2 shrink-0 cursor-pointer group"
                        onClick={() => setViewingStatus(userStatus)}
                    >
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-wa-green p-0.5 group-active:scale-95 transition-transform">
                            <div className="w-full h-full rounded-full bg-wa-bg-light overflow-hidden">
                                <img src={userStatus[0].imageUrl || "https://ui-avatars.com/api/?name=" + userStatus[0].userDisplayName} className="w-full h-full object-cover" alt="Status" />
                            </div>
                        </div>
                        <span className="text-[11px] md:text-xs font-medium text-wa-text truncate w-14 md:w-16 text-center">
                            {userStatus[0].userDisplayName.split(' ')[0]}
                        </span>
                    </div>
                ))}
            </div>

            {showCreate && <CreateStatus onClose={() => setShowCreate(false)} />}

            <AnimatePresence>
                {viewingStatus && (
                    <StatusViewer
                        statusList={viewingStatus}
                        onClose={() => setViewingStatus(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function CreateStatus({ onClose }) {
    const { user } = useAuth();
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        try {
            await statusService.createStatus(user.uid, user.displayName || "User", text, image);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-wa-bg-chat flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden flex flex-col">
                <div className="bg-wa-teal p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose}><X /></button>
                        <span className="font-bold">New Status</span>
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={loading || (!text && !image)}
                        className="bg-wa-green text-white px-4 py-2 rounded-md font-bold text-sm uppercase disabled:opacity-50"
                    >
                        {loading ? "..." : "Post"}
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center gap-6">
                    <textarea
                        placeholder="Type a status"
                        className="w-full text-2xl font-medium text-center bg-transparent outline-none resize-none h-32"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    <input
                        type="file"
                        id="status-image-wa"
                        className="hidden"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                    <label
                        htmlFor="status-image-wa"
                        className="w-full h-64 bg-wa-bg-light border-2 border-dashed border-wa-border rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                    >
                        {image ? (
                            <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                            <>
                                <Camera size={48} className="text-wa-text-secondary mb-2" />
                                <span className="text-wa-text-secondary">Add an image</span>
                            </>
                        )}
                    </label>
                </div>
            </div>
        </div>
    );
}

function StatusViewer({ statusList, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentStatus = statusList[currentIndex];

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentIndex < statusList.length - 1) {
                setCurrentIndex(v => v + 1);
            } else {
                onClose();
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [currentIndex, statusList, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-[#111] flex flex-col"
        >
            {/* Progress Bars */}
            <div className="flex gap-1 p-2">
                {statusList.map((_, i) => (
                    <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={i === currentIndex ? { scaleX: 1 } : i < currentIndex ? { scaleX: 1 } : { scaleX: 0 }}
                            transition={i === currentIndex ? { duration: 5, ease: "linear" } : { duration: 0 }}
                            className="h-full bg-wa-green origin-left"
                        />
                    </div>
                ))}
            </div>

            {/* User Info */}
            <div className="flex items-center justify-between p-4 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img src={"https://ui-avatars.com/api/?name=" + currentStatus.userDisplayName} alt="U" />
                    </div>
                    <div>
                        <p className="font-bold">{currentStatus.userDisplayName}</p>
                        <p className="text-xs opacity-70">Just now</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2"><X size={28} /></button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                {currentStatus.imageUrl && (
                    <img src={currentStatus.imageUrl} className="max-w-full max-h-[70vh] rounded-lg shadow-2xl mb-8" alt="Status" />
                )}
                <p className="text-white text-3xl font-medium leading-relaxed">{currentStatus.text}</p>
            </div>
        </motion.div>
    );
}
