import { useState, useEffect, useRef } from "react";
import { X, Send, Minimize2, Maximize2 } from "lucide-react";
import { chatService } from "../../services/chatService";
import { presenceService } from "../../services/presenceService";
import { useAuth } from "../../context/AuthProvider";
import { format } from "date-fns";
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

        const unsubscribeTyping = chatService.subscribeToTyping(chatId, (typingUsers) => {
            // Check if the target user is in the typing array
            setIsTyping(typingUsers.includes(targetUser.uid || targetUser.id));
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

        chatService.setTypingStatus(chatId, user.uid, true);

        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            chatService.setTypingStatus(chatId, user.uid, false);
        }, 1500);
        setTypingTimeout(timeout);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !chatId) return;

        try {
            await chatService.sendMessage(chatId, user.uid, inputText);
            setInputText("");
            chatService.setTypingStatus(chatId, user.uid, false);
            if (typingTimeout) clearTimeout(typingTimeout);
        } catch (err) {
            console.error("Popup send error:", err);
        }
    };

    if (!targetUser) return null;

    return (
        <div className={`chat-popup-container ${minimized ? 'minimized' : ''}`}>
            <div className="chat-popup-header" onClick={() => setMinimized(!minimized)}>
                <div className="flex items-center gap-2">
                    <div className="popup-avatar">
                        <img
                            src={targetUser.photoURL || `https://ui-avatars.com/api/?name=${targetUser.displayName || targetUser.email || 'U'}`}
                            alt="avatar"
                        />
                        <div className={`online-indicator ${isTargetOnline ? 'active' : ''}`} style={{ backgroundColor: isTargetOnline ? '#2ecc71' : '#95a5a6' }}></div>
                    </div>
                    <span className="font-semibold text-sm truncate max-w-[120px]">
                        {targetUser.displayName || targetUser.username || targetUser.email.split('@')[0]}
                    </span>
                </div>

                <div className="popup-actions" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setMinimized(!minimized)} className="popup-btn">
                        {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={onClose} className="popup-btn hover:text-red-400">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {!minimized && (
                <>
                    <div className="chat-popup-body no-scrollbar">
                        {messages.length === 0 ? (
                            <div className="text-center text-xs text-gray-400 mt-4">
                                Say hi to {targetUser.displayName || "your new friend"}! 👋
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
                                <div className="popup-msg-bubble text-gray-500 italic text-xs">
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
                        <button type="submit" disabled={!inputText.trim()} className="text-blue-500 disabled:opacity-50">
                            <Send size={18} />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}
