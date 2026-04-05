import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Share2, Clipboard, History, Video, Layers, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROMPT_CATEGORIES = {
    "All": [
        "Show your hidden talent in 15 seconds!",
        "Create a dance using only your desk and chair.",
        "Explain your favorite tech gadget in 10 seconds.",
        "Turn your pet into the main character of a movie scene.",
        "Make a before-and-after transformation clip.",
        "React to the most recent photo in your gallery.",
        "Do a 30-second rapid fire Q&A about your hobby.",
        "Show us your workspace setup in cinematic shots.",
        "Try to explain a complex concept using only emojis.",
        "Film a 'Day in the life' but only with 1-second clips."
    ],
    "Tech": [
        "Explain your favorite tech gadget in 10 seconds.",
        "Show us your workspace setup in cinematic shots.",
        "What's one tech tool you can't live without?",
        "Review a piece of software in 30 seconds.",
        "Show a quick 'Hello World' in a language you're learning."
    ],
    "Comedy": [
        "Re-enact a famous movie scene with a funny twist.",
        "Show your 'expectation vs reality' of a weekend project.",
        "Try not to laugh challenge with your own jokes.",
        "Do an impression of a famous tech CEO.",
        "The struggle of debugging code in 15 seconds."
    ],
    "Lifestyle": [
        "Show your morning routine in fast forward.",
        "What's in your everyday carry (EDC) bag?",
        "Quick healthy snack hack.",
        "A 15-second tour of your favorite local spot.",
        "Your top 3 productivity tips for creators."
    ]
};

export default function ReelPrompt({ onDeployMission }) {
    const [category, setCategory] = useState("All");
    const [currentPrompt, setCurrentPrompt] = useState("");
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        generatePrompt();
    }, [category]);

    const generatePrompt = () => {
        setIsGenerating(true);
        const categoryPrompts = PROMPT_CATEGORIES[category];
        const randomIndex = Math.floor(Math.random() * categoryPrompts.length);
        const newPrompt = categoryPrompts[randomIndex];
        
        setTimeout(() => {
            setCurrentPrompt(newPrompt);
            setHistory(prev => [newPrompt, ...prev.slice(0, 9)]);
            setIsGenerating(false);
        }, 400);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(currentPrompt);
        alert("Mission details copied to clipboard!");
    };

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full group-hover:bg-blue-600/20 transition-all"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-white font-black text-2xl flex items-center gap-3 tracking-tight">
                        <Sparkles className="text-blue-500" /> MISSION GENERATOR
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Select a sector and generate your next objective.</p>
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {Object.keys(PROMPT_CATEGORIES).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${category === cat ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative min-h-[160px] flex items-center justify-center bg-black/40 border border-white/5 rounded-2xl p-8 mb-8">
                <AnimatePresence mode="wait">
                    {!isGenerating ? (
                        <motion.h3 
                            key={currentPrompt}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-white text-xl md:text-2xl font-bold text-center leading-relaxed"
                        >
                            "{currentPrompt}"
                        </motion.h3>
                    ) : (
                        <div className="flex gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button 
                    onClick={generatePrompt}
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all border border-slate-700 group/btn"
                >
                    <RefreshCw size={18} className={`${isGenerating ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform duration-500'}`} />
                    NEW MISSION
                </button>

                <div className="flex gap-2">
                    <button 
                        onClick={copyToClipboard}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-bold py-4 rounded-xl transition-all border border-slate-700"
                        title="Copy Prompt"
                    >
                        <Clipboard size={18} />
                    </button>
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className={`flex-1 flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-bold py-4 rounded-xl transition-all border border-slate-700 ${showHistory ? 'ring-2 ring-blue-500/50' : ''}`}
                        title="History"
                    >
                        <History size={18} />
                    </button>
                </div>

                <button 
                    onClick={onDeployMission}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 uppercase tracking-widest sm:col-span-2 lg:col-span-1"
                >
                    <Video size={18} /> DEPLOY INTEL
                </button>
            </div>

            {/* History Panel */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-6 border-t border-slate-800 pt-6 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Recent Intelligence</h4>
                            <button onClick={() => setShowHistory(false)}><X size={14} className="text-slate-600 hover:text-white" /></button>
                        </div>
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {history.length > 1 ? history.slice(1).map((h, i) => (
                                <div key={i} className="text-slate-300 text-sm p-3 bg-slate-800/30 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                    {h}
                                </div>
                            )) : (
                                <div className="text-center py-6 text-slate-600 text-sm">No recorded history.</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
