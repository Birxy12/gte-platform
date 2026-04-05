import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Smile, Plus, X, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInput = ({ 
  onSendMessage, 
  onTyping, 
  editingMessageId, 
  editingText, 
  onCancelEdit,
  chatId 
}) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (editingMessageId) {
      setMessage(editingText || '');
      inputRef.current?.focus();
    }
  }, [editingMessageId, editingText]);

  const handleTyping = () => {
    if (!chatId) return;
    onTyping('typing');
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping('none');
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !selectedFile) return;

    try {
      await onSendMessage(message, selectedFile);
      setMessage('');
      setSelectedFile(null);
      onTyping('none');
      clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      console.error('Error sending:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '👏', '🎉', '🤔', '👎', '😍'];

  return (
    <div className="chat-input-area relative bg-transparent px-6 py-4">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*,video/*"
        onChange={handleFileSelect}
      />

      <AnimatePresence>
        {selectedFile && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute -top-20 left-10 right-10 bg-[#1e293b] p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 z-50 backdrop-blur-xl"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Image size={24} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-sm font-semibold text-white truncate">{selectedFile.name}</p>
               <p className="text-xs text-slate-400">Ready to send</p>
            </div>
            <button 
              onClick={() => setSelectedFile(null)}
              className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingMessageId && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute -top-12 left-8 right-8 bg-[#1e293b] px-5 py-2.5 rounded-t-2xl border border-white/10 border-b-0 flex items-center justify-between z-10 backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
               <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Editing</span>
            </div>
            <button 
              onClick={onCancelEdit}
              className="text-slate-400 hover:text-red-400 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="enterprise-pill">
        <button 
          className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
        >
          <Plus size={22} />
        </button>

        <div className="flex-1 flex items-center relative">
          <button 
            className="text-slate-400 hover:text-white mr-3 transition-colors"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} />
          </button>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-full left-0 mb-4 bg-[#1e293b] p-4 rounded-2xl shadow-2xl border border-white/10 grid grid-cols-6 gap-3 z-50 backdrop-blur-xl"
              >
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setMessage(prev => prev + emoji);
                      setShowEmojiPicker(false);
                      inputRef.current?.focus();
                    }}
                    className="text-2xl hover:scale-125 hover:bg-white/5 p-2 rounded-xl transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <input
            ref={inputRef}
            type="text"
            placeholder={editingMessageId ? "Update your message..." : "Type a message..."}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
              if (e.key === 'Escape' && editingMessageId) {
                onCancelEdit();
              }
            }}
            className="enterprise-input"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!message.trim() && !selectedFile}
          className={`p-3 rounded-full transition-all shadow-lg ${
            message.trim() || selectedFile 
              ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20' 
              : 'bg-white/5 text-slate-500'
          }`}
        >
          {message.trim() || selectedFile ? <Send size={18} /> : <Mic size={18} />}
        </motion.button>
      </div>
    </div>
  );
};

export default ChatInput;