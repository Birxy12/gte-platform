import { useState, useEffect, useRef } from "react";
import { X, Send, Minimize2, Maximize2, Sparkles } from "lucide-react";
import { chatService } from "../../services/chatService";
import { presenceService } from "../../services/presenceService";
import { useAuth } from "../../context/AuthProvider";
import Avatar from "../common/Avatar";
import "./ChatPopup.css";

export default function ChatPopup({ targetUser, onClose }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [chatId, setChatId] = useState(null);
    const [minimized, setMinimized] = useState(false);
    const [isTargetOnline, setIsTargetOnline] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!user || !targetUser) return;

        const initChat = async () => {
            try {
                const id = await chatService.getOrCreateDirectChat(user.uid, targetUser.uid || targetUser.id);
                setChatId(id);
            } catch (err) {
                console.error("Failed to init chat popup:", err);
            }
        };
        initChat();

        // Subscribe to target user's presence state
        const unsubscribePresence = presenceService.subscribeToPresence(
            targetUser.uid || targetUser.id,
            (presenceData) => {
                setIsTargetOnline(presenceData?.isOnline || false);
            }
        );

        return () => {
            if (unsubscribePresence) unsubscribePresence();
        };
    }, [user, targetUser]);

    useEffect(() => {
        if (!chatId) return;
        const unsubscribe = chatService.subscribeToMessages(chatId, (updatedMessages) => {
            setMessages(updatedMessages);
        });

        const unsubscribeTyping = chatService.subscribeToStatuses(chatId, (statuses) => {
            setIsTyping(statuses[targetUser.uid || targetUser.id] === 'typing');
        });

        return () => {
            unsubscribe();
            unsubscribeTyping();
        };
    }, [chatId, targetUser]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (!minimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping, minimized]);

    const handleInputChange = (e) => {
        setInputText(e.target.value);
        if (!chatId) return;

        chatService.setStatus(chatId, user.uid, "typing");

        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            chatService.setStatus(chatId, user.uid, "none");
        }, 1500);
        setTypingTimeout(timeout);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !chatId) return;

        try {
            await chatService.sendMessage(chatId, user.uid, inputText);
            setInputText("");
            chatService.setStatus(chatId, user.uid, "none");
            if (typingTimeout) clearTimeout(typingTimeout);
        } catch (err) {
            console.error("Popup send error:", err);
        }
    };

    if (!targetUser) return null;

    const displayName = targetUser.displayName || targetUser.username || targetUser.email?.split('@')[0] || "Operative";

    return (
        <div className={`chat-popup-container ${minimized ? 'minimized' : ''}`}>
            <div className="chat-popup-header" onClick={() => setMinimized(!minimized)}>
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <Avatar
                            src={targetUser.photoURL}
                            name={displayName}
                            size="mini"
                        />
                        {isTargetOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
                        )}
                    </div>
                    <div>
                        <span className="font-bold text-xs truncate max-w-[130px] block text-white">
                            {displayName}
                        </span>
                        <span className="text-[10px] text-blue-200 block">
                            {isTargetOnline ? "Active" : "Offline"}
                        </span>
                    </div>
                </div>

                <div className="popup-actions" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setMinimized(!minimized)} className="popup-btn" title={minimized ? "Expand" : "Minimize"}>
                        {minimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
                    </button>
                    <button onClick={onClose} className="popup-btn hover:text-rose-400" title="Close">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!minimized && (
                <>
                    <div className="chat-popup-body custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="text-center text-xs text-slate-400 mt-6 flex flex-col items-center gap-2">
                                <Sparkles size={20} className="text-blue-400" />
                                <span>Direct mission comms with {displayName}</span>
                            </div>
                        ) : (
                            messages.map(msg => {
                                const isMe = msg.senderId === user.uid;
                                return (
                                    <div key={msg.id} className={`popup-msg-wrapper ${isMe ? 'sent' : 'received'}`}>
                                        <div className="popup-msg-bubble">
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        {isTyping && (
                            <div className="popup-msg-wrapper received">
                                <div className="popup-msg-bubble text-slate-400 italic text-[11px]">
                                    typing...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="chat-popup-input">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={handleInputChange}
                        />
                        <button 
                            type="submit" 
                            disabled={!inputText.trim()} 
                            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-all cursor-pointer"
                        >
                            <Send size={14} />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}
