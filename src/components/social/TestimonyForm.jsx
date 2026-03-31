import React, { useState } from "react";
import { db, auth } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Star, Send, CheckCircle } from "lucide-react";

export default function TestimonyForm() {
    const [rating, setRating] = useState(5);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || !auth.currentUser) return;

        setLoading(true);
        try {
            await addDoc(collection(db, "testimonies"), {
                userId: auth.currentUser.uid,
                userName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
                userPhoto: auth.currentUser.photoURL,
                rating,
                text: text.trim(),
                published: false, // Requires admin approval
                createdAt: serverTimestamp()
            });
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting testimony:", error);
            alert("Mission failed: Could not submit feedback.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl text-center">
                <CheckCircle className="text-green-500 mx-auto mb-3" size={40} />
                <h3 className="text-white font-bold text-lg">Intel Received!</h3>
                <p className="text-gray-400 text-sm mt-1">Your testimony has been logged and is awaiting HQ approval.</p>
                <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-sm text-green-500 hover:underline font-bold"
                >
                    Submit another report
                </button>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
            <h3 className="text-white font-bold text-lg mb-1">Mission Debriefing</h3>
            <p className="text-gray-400 text-sm mb-4">Share your success story with the GTE community.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`transition-all ${star <= rating ? 'text-yellow-500 scale-110' : 'text-slate-600'}`}
                        >
                            <Star size={24} fill={star <= rating ? "currentColor" : "none"} />
                        </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {rating}/5 Stars
                    </span>
                </div>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Describe your training experience (e.g., 'The React course changed my career...')"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none transition-all resize-none"
                    rows={4}
                    required
                />

                <button
                    type="submit"
                    disabled={loading || !text.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <Send size={18} />
                            Deploy Testimony
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
