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
                            <Bot size={24} />
                        </div>
                        <div className="ai-bot-title">
                            <h3>Birxy AI</h3>
                            <p>Active</p>
                        </div>
                        <div className="ai-bot-actions">
                            <X size={20} className="cursor-pointer opacity-50 hover:opacity-100" onClick={() => setIsOpen(false)} />
                        </div>
                    </div>

                    <div className="ai-bot-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`ai-msg ${msg.sender === 'user' ? 'ai-msg-user' : 'ai-msg-bot'}`}>
                                <div className="ai-msg-bubble">
                                    {msg.text}
                                    <div className="ai-msg-meta">
                                        <span className="ai-msg-time">{msg.time}</span>
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
                        <form className="ai-bot-input" onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="Ask Birxy anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isTyping}
                            />
                            <button type="submit" className="ai-bot-send-main" disabled={isTyping || !input.trim()}>
                                <Send size={18} />
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
