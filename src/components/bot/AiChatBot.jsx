import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { openAiService } from "../../services/openAiService";
import "./AiChatBot.css";

export default function AiChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: "bot", text: "Hi there! I'm Globix, your AI learning assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

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

        const userMsg = { id: Date.now(), sender: "user", text: input.trim() };
        const newMessages = [...messages, userMsg];
        
        setMessages(newMessages);
        setInput("");
        setIsTyping(true);

        try {
            const aiResponseText = await openAiService.askAssistant(newMessages);
            const botMsg = { id: Date.now() + 1, sender: "bot", text: aiResponseText };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Bot Error:", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: "bot", text: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later!" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="ai-bot-container">
            {isOpen && (
                <div className="ai-bot-window">
                    <div className="ai-bot-header">
                        <div className="ai-bot-avatar">
                            <Bot size={20} />
                        </div>
                        <div className="ai-bot-title">
                            <h3>Globix AI</h3>
                            <p>Online & Ready to Help</p>
                        </div>
                        <button className="ai-bot-close" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="ai-bot-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`ai-msg ${msg.sender === 'user' ? 'ai-msg-user' : 'ai-msg-bot'}`}>
                                {msg.text}
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

                    <form className="ai-bot-input" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isTyping}
                        />
                        <button type="submit" className="ai-bot-send" disabled={!input.trim() || isTyping}>
                            <Send size={18} />
                        </button>
                    </form>
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
