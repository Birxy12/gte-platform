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
    <div className="chat-input-area flex items-center gap-2 px-4 py-3 bg-[#202c33] border-l border-[#2a3942] relative">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute -top-16 left-20 bg-[#202c33] px-4 py-2 rounded-lg shadow-xl border border-[#2a3942] flex items-center gap-3 z-10"
          >
            <Image size={20} className="text-msger-primary" />
            <span className="text-sm text-white truncate max-w-[200px]">{selectedFile.name}</span>
            <button 
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-white/10 rounded-full text-msger-text-dim hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingMessageId && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-10 left-20 right-20 bg-[#202c33] px-4 py-2 rounded-t-lg border border-[#2a3942] border-b-0 flex items-center justify-between z-10"
          >
            <span className="text-xs text-msger-text-dim">Editing message...</span>
            <button 
              onClick={onCancelEdit}
              className="text-msger-text-dim hover:text-red-400 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        className="p-2 rounded-full text-msger-text-dim hover:text-white hover:bg-white/10 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        title="Attach file"
      >
        <Plus size={24} />
      </button>

      <div className="input-container flex-1 bg-[#2a3942] px-4 py-2.5 rounded-full flex items-center relative">
        <button 
          className="text-msger-text-dim hover:text-white mr-3 transition-colors"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile size={22} />
        </button>

        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute bottom-full left-0 mb-2 bg-[#202c33] p-3 rounded-xl shadow-xl border border-[#2a3942] grid grid-cols-6 gap-2 z-20"
            >
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    setMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                    inputRef.current?.focus();
                  }}
                  className="text-2xl hover:scale-125 transition-transform p-1"
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
          placeholder={editingMessageId ? "Update your message..." : "Type a message"}
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
          className="w-full bg-transparent border-none outline-none text-white placeholder:text-msger-text-dim text-sm"
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleSubmit}
        disabled={!message.trim() && !selectedFile}
        className={`p-3 rounded-full transition-colors ${message.trim() || selectedFile ? 'bg-[#00a884] text-white hover:bg-[#008f72]' : 'bg-[#2a3942] text-msger-text-dim'}`}
      >
        {message.trim() || selectedFile ? <Send size={20} /> : <Mic size={20} />}
      </motion.button>
    </div>
  );
};

export default ChatInput;