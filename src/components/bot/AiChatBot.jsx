import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Phone, Video, MoreVertical, Plus, Smile, Camera, Mic, ChevronLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
import { openAiService } from "../../services/openAiService";
import { useAuth } from "../../context/AuthProvider";
import "./AiChatBot.css";

export default function AiChatBot() {
    const { user } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: "bot", text: "Hi there! I'm Birxy, your AI learning assistant. How can I help you today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Removed early return from here

    const initials = user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : (user?.email ? user.email.substring(0, 2).toUpperCase() : "BA");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg = { id: Date.now(), sender: "user", text: input.trim(), time: timestamp };
        const newMessages = [...messages, userMsg];
        
        setMessages(newMessages);
        setInput("");
        setIsTyping(true);

        try {
            const aiResponseText = await openAiService.askAssistant(newMessages);
            const botMsg = { id: Date.now() + 1, sender: "bot", text: aiResponseText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Bot Error:", error);
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                sender: "bot", 
                text: "Mission failed. I'm having trouble connecting to my central brain. Please check your signal (or API key) and try again! 📡",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Hide widget on certain pages
    if (location.pathname.startsWith("/chat")) return null;

    return (
        <div className="ai-bot-container">
            {isOpen && (
                <div className="ai-bot-window">
                    <div className="ai-bot-header">
                        <button className="ai-bot-back" onClick={() => setIsOpen(false)}>
                            <ChevronLeft size={24} />
                        </button>
                        <div className="ai-bot-avatar">
                            {user?.photoURL ? <img src={user.photoURL} alt="avatar" /> : initials}
                        </div>
                        <div className="ai-bot-title">
                            <h3>Birxy AI</h3>
                            <p>Online</p>
                        </div>
                        <div className="ai-bot-actions">
                            <Video size={18} />
                            <Phone size={18} />
                            <MoreVertical size={18} />
                        </div>
                    </div>

                    <div className="ai-bot-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`ai-msg ${msg.sender === 'user' ? 'ai-msg-user' : 'ai-msg-bot'}`}>
                                <div className="ai-msg-bubble">
                                    {msg.text}
                                    <div className="ai-msg-meta">
                                        <span className="ai-msg-time">{msg.time}</span>
                                        {msg.sender === 'user' && (
                                            <div className="ai-msg-status">
                                                <svg viewBox="0 0 16 15" width="16" height="15" fill="currentColor"><path d="M15.01 3.316l-.478-.372a.365.365 0 00-.51.063L8.666 9.879l-2.031-1.39a.433.433 0 00-.582.08l-.29.395a.434.434 0 00.082.584l2.582 1.768a.482.482 0 00.686-.1l5.865-7.401a.365.365 0 00-.063-.51zm-5.748 7.731c.096.066.213.1.332.1.2 0 .39-.1.517-.267l5.127-6.471a.365.365 0 00-.063-.51l-.478-.372a.365.365 0 00-.51.063l-4.57 5.768a.11.11 0 01-.157.02l-2.031-1.39a.433.433 0 00-.582.08l-.29.395a.434.434 0 00.082.584l2.582 1.768zM2.877 7.822a.433.433 0 00-.582.08l-.29.395a.434.434 0 00.082.584l2.582 1.768a.482.482 0 00.686-.1l3.522-4.444a.365.365 0 00-.063-.51l-.478-.372a.365.365 0 00-.51.063L4.856 9.387 2.877 7.822z"></path></svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="ai-typing-indicator">
                                <span className="ai-dot"></span>
                                <span className="ai-dot"></span>
                                <span className="ai-dot"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="ai-bot-footer">
                        <button className="ai-footer-btn"><Plus size={22} /></button>
                        <form className="ai-bot-input" onSubmit={handleSend}>
                            <div className="ai-input-wrapper">
                                <button type="button" className="ai-inner-icon"><Smile size={20} /></button>
                                <input
                                    type="text"
                                    placeholder="Message"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={isTyping}
                                />
                                <button type="button" className="ai-inner-icon"><Camera size={20} /></button>
                            </div>
                            <button type="submit" className="ai-bot-send-main" disabled={isTyping}>
                                {input.trim() ? <Send size={20} /> : <Mic size={20} />}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {!isOpen && (
                <button className="ai-bot-toggle" onClick={() => setIsOpen(true)}>
                    <MessageSquare size={24} />
                </button>
            )}
        </div>
    );
}
